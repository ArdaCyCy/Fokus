import { PurchaseProvider } from "@prisma/client";
import { NextRequest } from "next/server";
import { z } from "zod";

import { requireAppUser } from "@/lib/auth/app-user";
import { enforceApiRateLimit } from "@/lib/api-rate-limit";
import { auditLog, getOrCreateRequestId, jsonWithRequestId } from "@/lib/api-observability";
import { evaluateCoupon, splitDiscountAcrossItems } from "@/lib/commerce/coupons";
import { fulfillCartLines, type CheckoutLine } from "@/lib/commerce/fulfill-cart";
import { db } from "@/lib/db";
import { getIdempotencyReplay, saveIdempotencyResult } from "@/lib/idempotency";

const bodySchema = z.object({
  gameIds: z.array(z.string().cuid()).min(1).max(30),
  couponCode: z.string().trim().max(32).optional(),
});

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const limited = await enforceApiRateLimit(req, {
    key: "checkout-wallet",
    limit: 15,
    window: "1 m",
  });
  if (limited) {
    limited.headers.set("X-Request-Id", requestId);
    return limited;
  }

  const user = await requireAppUser("/cart");
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    auditLog("warn", "checkout.wallet.invalid_payload", { requestId, userId: user.id });
    return jsonWithRequestId(
      { error: "Geçersiz veri", issues: parsed.error.flatten() },
      { status: 400 },
      requestId
    );
  }
  const idemKey = req.headers.get("idempotency-key")?.trim();
  const fingerprint = JSON.stringify({
    gameIds: [...parsed.data.gameIds].sort(),
    couponCode: parsed.data.couponCode?.trim().toUpperCase() ?? null,
  });
  if (idemKey) {
    const replay = getIdempotencyReplay({
      namespace: "checkout-wallet",
      userId: user.id,
      key: idemKey,
      fingerprint,
      requestId,
    });
    if (replay) {
      auditLog("info", "checkout.wallet.idempotency_replay", { requestId, userId: user.id });
      return replay;
    }
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
    auditLog("warn", "checkout.wallet.empty_games", { requestId, userId: user.id });
    return jsonWithRequestId({ error: "Satın alınabilir oyun bulunamadı." }, { status: 404 }, requestId);
  }

  const totalCents = games.reduce((acc, g) => acc + g.priceCents, 0);
  const coupon = evaluateCoupon(totalCents, parsed.data.couponCode);
  if (coupon && !coupon.valid) {
    return jsonWithRequestId({ error: coupon.reason }, { status: 400 }, requestId);
  }
  const discountCents = coupon?.valid ? coupon.discountCents : 0;
  const chargedCents = totalCents - discountCents;

  if (user.walletBalanceCents < chargedCents) {
    auditLog("warn", "checkout.wallet.insufficient_balance", {
      requestId,
      userId: user.id,
      totalCents: chargedCents,
      balanceCents: user.walletBalanceCents,
    });
    return jsonWithRequestId(
      { error: "Yetersiz bakiye. Lütfen cüzdanını yükle." },
      { status: 400 },
      requestId
    );
  }

  const discountedPrices = splitDiscountAcrossItems(
    games.map((g) => g.priceCents),
    discountCents
  );

  const lines: CheckoutLine[] = games.map((g, i) => ({
    gameId: g.id,
    title: g.title,
    currency: g.currency,
    listPriceCents: g.priceCents,
    chargedCents: discountedPrices[i] ?? g.priceCents,
    developerSlug: g.developerSlug,
  }));

  const couponNote = coupon?.valid ? `kupon: ${coupon.code}` : null;
  const batchRef = idemKey ?? `w_${Date.now()}_${requestId.slice(0, 8)}`;

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { walletBalanceCents: { decrement: chargedCents } },
    });
    await tx.walletTransaction.create({
      data: {
        userId: user.id,
        amountCents: -chargedCents,
        type: "PURCHASE",
        description: `${games.length} oyun, cüzdan${coupon?.valid ? ` (${coupon.code})` : ""}`,
      },
    });

    await fulfillCartLines({
      userId: user.id,
      lines,
      couponNote,
      provider: PurchaseProvider.MANUAL,
      providerRefPrefix: batchRef,
      stripePaymentIntentId: null,
      stripeCheckoutSessionId: null,
      iyzicoPaymentId: null,
      tx,
    });
  });

  auditLog("info", "checkout.wallet.success", {
    requestId,
    userId: user.id,
    purchased: games.length,
    totalCents,
    chargedCents,
    discountCents,
    couponCode: coupon?.valid ? coupon.code : null,
  });
  const resultBody = {
    ok: true,
    message: "Satın alma tamamlandı.",
    purchased: games.length,
    totalCents,
    chargedCents,
    discountCents,
    couponCode: coupon?.valid ? coupon.code : null,
  };
  if (idemKey) {
    saveIdempotencyResult({
      namespace: "checkout-wallet",
      userId: user.id,
      key: idemKey,
      fingerprint,
      body: resultBody,
      status: 200,
    });
  }
  return jsonWithRequestId(resultBody, undefined, requestId);
}
