import { PurchaseProvider } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auditLog, getOrCreateRequestId } from "@/lib/api-observability";
import { type CheckoutLine, fulfillCartLines } from "@/lib/commerce/fulfill-cart";
import { getAppBaseUrl } from "@/lib/commerce/checkout-config";
import { sendPurchaseReceiptEmail } from "@/lib/email/send-purchase-receipt";
import { iyzicoCheckoutFormRetrieve } from "@/lib/iyzico/client";
import { db } from "@/lib/db";

const lineSchema = z.object({
  gameId: z.string(),
  title: z.string(),
  currency: z.string(),
  listPriceCents: z.number().int().nonnegative(),
  chargedCents: z.number().int().nonnegative(),
  developerSlug: z.string().nullable(),
});

function parseTryToCents(s: string | undefined): number {
  if (!s) return -1;
  const n = Number(String(s).replace(",", "."));
  if (!Number.isFinite(n)) return -1;
  return Math.round(n * 100);
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const base = getAppBaseUrl();

  let token: string | null = null;
  let conversationIdFromForm: string | undefined;
  try {
    const ct = req.headers.get("content-type") ?? "";
    if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
      const fd = await req.formData();
      token = fd.get("token")?.toString() ?? null;
      conversationIdFromForm =
        fd.get("conversationId")?.toString() ??
        fd.get("paymentConversationId")?.toString() ??
        undefined;
    } else {
      const raw = await req.text();
      const params = new URLSearchParams(raw);
      token = params.get("token");
      conversationIdFromForm =
        params.get("conversationId") ??
        params.get("paymentConversationId") ??
        undefined;
    }
  } catch {
    token = null;
  }

  if (!token) {
    auditLog("warn", "iyzico.callback.no_token", { requestId });
    return NextResponse.redirect(`${base}/cart?checkout=cancel`, 302);
  }

  try {
    const result = await iyzicoCheckoutFormRetrieve({
      locale: "tr",
      token,
      conversationId: conversationIdFromForm,
    });

    if (result.status !== "success") {
      auditLog("warn", "iyzico.callback.retrieve_fail", {
        requestId,
        err: result.errorMessage,
      });
      return NextResponse.redirect(`${base}/cart?checkout=cancel`, 302);
    }

    const paymentStatus = String(result.paymentStatus ?? "");
    if (paymentStatus !== "SUCCESS") {
      auditLog("info", "iyzico.callback.not_paid", { requestId, paymentStatus });
      return NextResponse.redirect(`${base}/cart?checkout=cancel`, 302);
    }

    const paymentId = String(result.paymentId ?? "");
    if (!paymentId) {
      auditLog("error", "iyzico.callback.no_payment_id", { requestId });
      return NextResponse.redirect(`${base}/cart?checkout=cancel`, 302);
    }

    const dup = await db.iyzicoProcessedPayment.findUnique({
      where: { paymentId },
    });
    if (dup) {
      return NextResponse.redirect(`${base}/?checkout=already`, 302);
    }

    const conversationId = String(result.conversationId ?? "");
    const paidCents = parseTryToCents(result.paidPrice);
    if (!conversationId || paidCents < 0) {
      auditLog("error", "iyzico.callback.bad_payload", { requestId });
      return NextResponse.redirect(`${base}/cart?checkout=cancel`, 302);
    }

    const intent = await db.iyzicoPaymentIntent.findUnique({
      where: { conversationId },
    });
    if (!intent || intent.amountCents !== paidCents) {
      auditLog("error", "iyzico.callback.amount_or_intent_mismatch", {
        requestId,
        conversationId,
        expected: intent?.amountCents,
        paidCents,
      });
      return NextResponse.redirect(`${base}/cart?checkout=cancel`, 302);
    }

    if (intent.kind === "WALLET_TOPUP") {
      const user = await db.user.findUnique({
        where: { id: intent.userId },
        select: { id: true },
      });
      if (!user) {
        return NextResponse.redirect(`${base}/wallet?topup=fail`, 302);
      }
      await db.$transaction(async (tx) => {
        await tx.iyzicoProcessedPayment.create({ data: { paymentId } });
        await tx.user.update({
          where: { id: intent.userId },
          data: { walletBalanceCents: { increment: intent.amountCents } },
        });
        await tx.walletTransaction.create({
          data: {
            userId: intent.userId,
            amountCents: intent.amountCents,
            type: "TOPUP",
            description: `Cüzdan yükleme (İyzico • ${paymentId})`,
          },
        });
        await tx.iyzicoPaymentIntent.delete({ where: { id: intent.id } });
      });
      auditLog("info", "iyzico.callback.wallet_topup", {
        requestId,
        userId: intent.userId,
        paymentId,
      });
      return NextResponse.redirect(`${base}/wallet?topup=iyzico_success`, 302);
    }

    if (intent.kind !== "CART" || !intent.pendingCheckoutId) {
      return NextResponse.redirect(`${base}/cart?checkout=cancel`, 302);
    }

    const pending = await db.pendingCheckout.findUnique({
      where: { id: intent.pendingCheckoutId },
    });
    if (!pending || pending.status !== "PENDING" || pending.userId !== intent.userId) {
      auditLog("error", "iyzico.callback.pending_missing", {
        requestId,
        pendingId: intent.pendingCheckoutId,
      });
      return NextResponse.redirect(`${base}/support?checkout=problem`, 302);
    }

    const parsedLines = z.array(lineSchema).safeParse(pending.lines);
    if (!parsedLines.success) {
      await db.pendingCheckout.update({
        where: { id: pending.id },
        data: { status: "CANCELED" },
      });
      return NextResponse.redirect(`${base}/cart?checkout=cancel`, 302);
    }

    const lines = parsedLines.data as CheckoutLine[];
    const expectedPaid = lines.reduce((a, l) => a + Math.max(0, l.chargedCents), 0);
    if (expectedPaid !== paidCents || expectedPaid !== pending.chargedCents) {
      auditLog("error", "iyzico.callback.cart_amount_mismatch", {
        requestId,
        expectedPaid,
        paidCents,
        pendingCharged: pending.chargedCents,
      });
      return NextResponse.redirect(`${base}/cart?checkout=cancel`, 302);
    }

    const couponNote = pending.couponCode ? `kupon: ${pending.couponCode}` : null;

    await db.$transaction(async (tx) => {
      await tx.iyzicoProcessedPayment.create({ data: { paymentId } });
      await fulfillCartLines({
        userId: pending.userId,
        lines,
        couponNote,
        provider: PurchaseProvider.IYZICO,
        providerRefPrefix: paymentId,
        iyzicoPaymentId: paymentId,
        tx,
      });
      await tx.pendingCheckout.update({
        where: { id: pending.id },
        data: { status: "COMPLETED" },
      });
      await tx.iyzicoPaymentIntent.delete({ where: { id: intent.id } });
    });

    void sendPurchaseReceiptEmail({
      userId: pending.userId,
      lines: lines.map((l) => ({ title: l.title, chargedCents: l.chargedCents })),
      totalCents: expectedPaid,
      currency: pending.currency,
      requestId,
    });

    auditLog("info", "iyzico.callback.cart_done", {
      requestId,
      paymentId,
      userId: pending.userId,
    });

    return NextResponse.redirect(`${base}/library?checkout=iyzico_success`, 302);
  } catch (err) {
    auditLog("error", "iyzico.callback.error", {
      requestId,
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.redirect(`${base}/cart?checkout=cancel`, 302);
  }
}
