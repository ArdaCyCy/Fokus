import type { Prisma } from "@prisma/client";
import { PurchaseProvider, PurchaseStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { allowDesktopNotification } from "@/lib/notifications/preferences";

export type CheckoutLine = {
  gameId: string;
  title: string;
  currency: string;
  listPriceCents: number;
  chargedCents: number;
  developerSlug: string | null;
};

/** Varsayılan Fokus komisyonu: %30 (basis points). `PLATFORM_FEE_BPS` ile geçersiz kıl. */
const DEFAULT_FEE_BPS = 3000;

export function platformFeeBps(): number {
  const raw = process.env.PLATFORM_FEE_BPS;
  const n = raw ? Number.parseInt(raw, 10) : DEFAULT_FEE_BPS;
  return Number.isFinite(n) && n >= 0 && n <= 10_000 ? n : DEFAULT_FEE_BPS;
}

export async function fulfillCartLines(params: {
  userId: string;
  lines: CheckoutLine[];
  couponNote: string | null;
  provider: PurchaseProvider;
  providerRefPrefix: string;
  stripePaymentIntentId?: string | null;
  stripeCheckoutSessionId?: string | null;
  iyzicoPaymentId?: string | null;
  /** Satır başı providerRef: varsayılan `${prefix}:${gameId}` */
  providerRefForLine?: (line: CheckoutLine, index: number) => string;
  tx?: Prisma.TransactionClient;
}): Promise<void> {
  const {
    userId,
    lines,
    couponNote,
    provider,
    providerRefPrefix,
    stripePaymentIntentId,
    stripeCheckoutSessionId,
    iyzicoPaymentId,
    providerRefForLine,
  } = params;

  const notifyBuyer = await allowDesktopNotification(userId);
  const feeBps = platformFeeBps();

  const run = async (tx: Prisma.TransactionClient) => {
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index]!;
      const providerRef =
        providerRefForLine?.(line, index) ?? `${providerRefPrefix}:${line.gameId}`;

      const exists = await tx.purchase.findFirst({
        where: { userId, gameId: line.gameId, providerRef },
        select: { id: true },
      });
      if (exists) continue;

      const alreadyOwned = await tx.purchase.findFirst({
        where: { userId, gameId: line.gameId, status: PurchaseStatus.PAID },
        select: { id: true },
      });
      if (alreadyOwned) continue;

      const purchase = await tx.purchase.create({
        data: {
          userId,
          gameId: line.gameId,
          amountCents: line.chargedCents,
          currency: line.currency,
          status: PurchaseStatus.PAID,
          provider,
          providerRef,
          paidAt: new Date(),
          stripePaymentIntentId: stripePaymentIntentId ?? null,
          stripeCheckoutSessionId: stripeCheckoutSessionId ?? null,
          iyzicoPaymentId: iyzicoPaymentId ?? null,
        },
      });

      if (line.developerSlug) {
        const devUser = await tx.user.findUnique({
          where: { id: line.developerSlug },
          select: { id: true },
        });
        if (devUser) {
          const gross = line.listPriceCents;
          const fee = Math.round((gross * feeBps) / 10_000);
          const net = gross - fee;
          await tx.earning.create({
            data: {
              userId: devUser.id,
              gameId: line.gameId,
              purchaseId: purchase.id,
              grossCents: gross,
              platformFeeCents: fee,
              netCents: net,
              currency: line.currency.toUpperCase(),
              status: "AVAILABLE",
            },
          });
        }
      }

      await tx.activityEvent.create({
        data: {
          userId,
          gameId: line.gameId,
          type: "PURCHASE",
          message: couponNote
            ? `${line.title} satın alındı (${couponNote})`
            : `${line.title} satın alındı`,
        },
      });
      if (notifyBuyer) {
        await tx.notification.create({
          data: {
            userId,
            type: "SALE",
            title: `${line.title} kütüphanene eklendi`,
          },
        });
      }
      await tx.inventoryItem.create({
        data: {
          userId,
          gameId: line.gameId,
          name: `${line.title} — lisans`,
        },
      });
    }

    await tx.cartItem.deleteMany({
      where: { userId, gameId: { in: lines.map((l) => l.gameId) } },
    });
  };

  if (params.tx) {
    await run(params.tx);
  } else {
    await db.$transaction(run);
  }
}
