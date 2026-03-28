import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { z } from "zod";

import { requireAppUser } from "@/lib/auth/app-user";
import { enforceApiRateLimit } from "@/lib/api-rate-limit";
import { auditLog, getOrCreateRequestId, jsonWithRequestId } from "@/lib/api-observability";
import { evaluateCoupon, splitDiscountAcrossItems } from "@/lib/commerce/coupons";
import type { CheckoutLine } from "@/lib/commerce/fulfill-cart";
import { buildCartCheckoutFormRequest } from "@/lib/iyzico/checkout-request";
import { getIyzicoClient, iyzicoCheckoutFormInitialize } from "@/lib/iyzico/client";
import { db } from "@/lib/db";

const bodySchema = z.object({
  gameIds: z.array(z.string().cuid()).min(1).max(30),
  couponCode: z.string().trim().max(32).optional(),
});

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
    key: "checkout-iyzico",
    limit: 10,
    window: "1 m",
  });
  if (limited) {
    limited.headers.set("X-Request-Id", requestId);
    return limited;
  }

  const user = await requireAppUser("/cart");
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    auditLog("warn", "checkout.iyzico.invalid_payload", { requestId, userId: user.id });
    return jsonWithRequestId(
      { error: "Geçersiz veri", issues: parsed.error.flatten() },
      { status: 400 },
      requestId,
    );
  }

  const games = await db.game.findMany({
    where: { id: { in: parsed.data.gameIds }, isPublished: true },
    select: {
      id: true,
      title: true,
      priceCents: true,
      currency: true,
      developerSlug: true,
    },
  });
  if (games.length === 0) {
    return jsonWithRequestId({ error: "Satın alınabilir oyun bulunamadı." }, { status: 404 }, requestId);
  }

  const currencies = new Set(games.map((g) => g.currency.toLowerCase()));
  if (currencies.size !== 1) {
    return jsonWithRequestId(
      { error: "Sepette birden fazla para birimi olamaz." },
      { status: 400 },
      requestId,
    );
  }
  const currency = [...currencies][0]!;

  const totalCents = games.reduce((acc, g) => acc + g.priceCents, 0);
  const coupon = evaluateCoupon(totalCents, parsed.data.couponCode);
  if (coupon && !coupon.valid) {
    return jsonWithRequestId({ error: coupon.reason }, { status: 400 }, requestId);
  }
  const discountCents = coupon?.valid ? coupon.discountCents : 0;
  const chargedCents = totalCents - discountCents;

  if (chargedCents < 1) {
    return jsonWithRequestId(
      { error: "Bu tutar için kart ödemesi kullanılamaz; cüzdan veya mağaza akışını deneyin." },
      { status: 400 },
      requestId,
    );
  }

  const discountedPrices = splitDiscountAcrossItems(
    games.map((g) => g.priceCents),
    discountCents,
  );

  const lines: CheckoutLine[] = games.map((g, i) => ({
    gameId: g.id,
    title: g.title,
    currency: g.currency,
    listPriceCents: g.priceCents,
    chargedCents: discountedPrices[i] ?? g.priceCents,
    developerSlug: g.developerSlug,
  }));

  const pending = await db.pendingCheckout.create({
    data: {
      userId: user.id,
      lines: lines as Prisma.InputJsonValue,
      couponCode: coupon?.valid ? coupon.code : null,
      discountCents,
      chargedCents,
      currency,
    },
  });

  await db.iyzicoPaymentIntent.create({
    data: {
      conversationId: pending.id,
      userId: user.id,
      kind: "CART",
      amountCents: chargedCents,
      currency: currency.toUpperCase(),
      pendingCheckoutId: pending.id,
    },
  });

  try {
    const formReq = buildCartCheckoutFormRequest({
      user,
      pendingCheckoutId: pending.id,
      lines,
      chargedCents,
      currency,
    });
    const result = await iyzicoCheckoutFormInitialize(formReq);
    if (result.status !== "success") {
      throw new Error(result.errorMessage ?? "iyzico_init_failed");
    }
    const url = result.paymentPageUrl;
    if (!url) {
      throw new Error("paymentPageUrl_missing");
    }

    auditLog("info", "checkout.iyzico.initialized", {
      requestId,
      userId: user.id,
      pendingId: pending.id,
    });

    return jsonWithRequestId({ url, conversationId: pending.id }, undefined, requestId);
  } catch (err) {
    await db.pendingCheckout.update({
      where: { id: pending.id },
      data: { status: "CANCELED" },
    });
    await db.iyzicoPaymentIntent.deleteMany({ where: { conversationId: pending.id } });
    auditLog("error", "checkout.iyzico.init_failed", {
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
