import { NextRequest } from "next/server";
import { z } from "zod";

import { enforceApiRateLimit } from "@/lib/api-rate-limit";
import { auditLog, getOrCreateRequestId, jsonWithRequestId } from "@/lib/api-observability";
import { requireAppUser } from "@/lib/auth/app-user";
import { buildWalletTopupFormRequest } from "@/lib/iyzico/checkout-request";
import { getIyzicoClient, iyzicoCheckoutFormInitialize } from "@/lib/iyzico/client";
import { db } from "@/lib/db";

const bodySchema = z.object({
  amountCents: z.number().int().min(1000).max(500_000),
});

const WALLET_TOPUP_CURRENCY = "TRY";

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  if (!getIyzicoClient()) {
    return jsonWithRequestId(
      { error: "Kart ödemesi yapılandırılmamış (IYZICO_API_KEY / IYZICO_SECRET_KEY)." },
      { status: 503 },
      requestId,
    );
  }

  const limited = await enforceApiRateLimit(req, {
    key: "checkout-wallet-topup",
    limit: 10,
    window: "1 m",
  });
  if (limited) {
    limited.headers.set("X-Request-Id", requestId);
    return limited;
  }

  const user = await requireAppUser("/wallet");
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return jsonWithRequestId({ error: "Geçersiz tutar." }, { status: 400 }, requestId);
  }

  const { amountCents } = parsed.data;
  const conversationId = `wt_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;

  await db.iyzicoPaymentIntent.create({
    data: {
      conversationId,
      userId: user.id,
      kind: "WALLET_TOPUP",
      amountCents,
      currency: WALLET_TOPUP_CURRENCY,
    },
  });

  try {
    const formReq = buildWalletTopupFormRequest({
      user,
      conversationId,
      amountCents,
    });
    const result = await iyzicoCheckoutFormInitialize(formReq);
    if (result.status !== "success") {
      throw new Error(result.errorMessage ?? "iyzico_init_failed");
    }
    const url = result.paymentPageUrl;
    if (!url) throw new Error("paymentPageUrl_missing");

    auditLog("info", "checkout.wallet_topup.iyzico", {
      requestId,
      userId: user.id,
      amountCents,
    });

    return jsonWithRequestId({ url, conversationId }, undefined, requestId);
  } catch (err) {
    await db.iyzicoPaymentIntent.deleteMany({ where: { conversationId } });
    auditLog("error", "checkout.wallet_topup.fail", {
      requestId,
      userId: user.id,
      message: err instanceof Error ? err.message : String(err),
    });
    return jsonWithRequestId(
      { error: "Ödeme sağlayıcısı hatası. Daha sonra tekrar deneyin." },
      { status: 502 },
      requestId,
    );
  }
}
