import { PurchaseProvider, PurchaseStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { z } from "zod";

import { requireAppUser } from "@/lib/auth/app-user";
import { enforceApiRateLimit } from "@/lib/api-rate-limit";
import { auditLog, getOrCreateRequestId, jsonWithRequestId } from "@/lib/api-observability";
import { db } from "@/lib/db";
import { allowDesktopNotification } from "@/lib/notifications/preferences";

const bodySchema = z.object({
  purchaseId: z.string().cuid(),
});

const MAX_REFUND_MS = 14 * 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const limited = await enforceApiRateLimit(req, {
    key: "refunds",
    limit: 20,
    window: "1 m",
  });
  if (limited) {
    limited.headers.set("X-Request-Id", requestId);
    return limited;
  }

  const user = await requireAppUser("/library");
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return jsonWithRequestId({ error: "Geçersiz veri" }, { status: 400 }, requestId);
  }

  const purchase = await db.purchase.findFirst({
    where: { id: parsed.data.purchaseId, userId: user.id },
    include: {
      game: { select: { id: true, title: true } },
      earning: true,
    },
  });
  if (!purchase || purchase.status !== PurchaseStatus.PAID) {
    return jsonWithRequestId(
      { error: "İade için uygun satın alım bulunamadı." },
      { status: 404 },
      requestId,
    );
  }
  if (!purchase.paidAt || Date.now() - purchase.paidAt.getTime() > MAX_REFUND_MS) {
    return jsonWithRequestId({ error: "İade süresi dolmuş." }, { status: 400 }, requestId);
  }

  if (
    purchase.provider === PurchaseProvider.IYZICO ||
    purchase.provider === PurchaseProvider.STRIPE
  ) {
    return jsonWithRequestId(
      {
        error:
          "Kartla yapılan ödemelerde iade İyzico / banka süreçleriyle yürür. Lütfen destek üzerinden talep aç.",
      },
      { status: 400 },
      requestId,
    );
  }

  const creditWallet =
    purchase.provider === PurchaseProvider.MANUAL ||
    purchase.provider === PurchaseProvider.OTHER;

  const notifyUser = await allowDesktopNotification(user.id);

  await db.$transaction(async (tx) => {
    await tx.purchase.update({
      where: { id: purchase.id },
      data: { status: PurchaseStatus.REFUNDED },
    });

    await tx.earning.updateMany({
      where: {
        purchaseId: purchase.id,
        status: { in: ["AVAILABLE", "PAID_OUT"] },
      },
      data: { status: "REVERSED" },
    });

    if (creditWallet) {
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalanceCents: { increment: purchase.amountCents } },
      });
      await tx.walletTransaction.create({
        data: {
          userId: user.id,
          amountCents: purchase.amountCents,
          type: "TOPUP",
          description: `${purchase.game.title} — cüzdan iadesi`,
        },
      });
    }

    if (notifyUser) {
      await tx.notification.create({
        data: {
          userId: user.id,
          type: "SYSTEM",
          title: `${purchase.game.title} iadesi tamamlandı`,
        },
      });
    }
    await tx.activityEvent.create({
      data: {
        userId: user.id,
        gameId: purchase.game.id,
        type: "PURCHASE",
        message: `${purchase.game.title} satın alımı iade edildi`,
      },
    });
  });

  auditLog("info", "refunds.success", {
    requestId,
    userId: user.id,
    purchaseId: purchase.id,
    amountCents: purchase.amountCents,
    provider: purchase.provider,
  });
  return jsonWithRequestId(
    {
      ok: true,
      refundedCents: purchase.amountCents,
      toWallet: creditWallet,
    },
    undefined,
    requestId,
  );
}
