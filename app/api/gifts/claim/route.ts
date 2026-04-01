import { PurchaseProvider, PurchaseStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { enforceApiRateLimit } from "@/lib/api-rate-limit";
import { requireAppUser } from "@/lib/auth/app-user";
import { platformFeeBps } from "@/lib/commerce/fulfill-cart";
import { db } from "@/lib/db";

const bodySchema = z.object({
  token: z.string().cuid(),
});

export async function POST(req: NextRequest) {
  const limited = await enforceApiRateLimit(req, {
    key: "gifts-claim",
    limit: 30,
    window: "1 m",
  });
  if (limited) return limited;

  const user = await requireAppUser("/gifts");
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz token." }, { status: 400 });
  }

  const gift = await db.gift.findUnique({
    where: { claimToken: parsed.data.token },
    include: { game: true, sender: { select: { id: true, email: true } } },
  });
  if (!gift || gift.status !== "PENDING") {
    return NextResponse.json({ error: "Hediye kodu geçersiz veya kullanılmış." }, { status: 404 });
  }
  if (gift.senderId === user.id) {
    return NextResponse.json({ error: "Kendi hediyeni claim edemezsin." }, { status: 400 });
  }

  const userEmail = (user.email ?? "").trim().toLowerCase();
  if (userEmail !== gift.recipientEmail.trim().toLowerCase()) {
    return NextResponse.json(
      { error: "Bu hediye kodu farklı bir e-posta için oluşturulmuş." },
      { status: 403 },
    );
  }

  const alreadyOwned = await db.purchase.findFirst({
    where: { userId: user.id, gameId: gift.gameId, status: PurchaseStatus.PAID },
    select: { id: true },
  });
  if (alreadyOwned) {
    return NextResponse.json({ error: "Bu oyuna zaten sahipsin." }, { status: 400 });
  }

  const feeBps = platformFeeBps();
  await db.$transaction(async (tx) => {
    const updated = await tx.gift.updateMany({
      where: { id: gift.id, status: "PENDING" },
      data: {
        status: "CLAIMED",
        recipientId: user.id,
        claimedAt: new Date(),
      },
    });
    if (updated.count !== 1) {
      throw new Error("gift_race");
    }

    const purchase = await tx.purchase.create({
      data: {
        userId: user.id,
        gameId: gift.gameId,
        amountCents: gift.amountCents,
        currency: gift.currency,
        status: PurchaseStatus.PAID,
        provider: PurchaseProvider.OTHER,
        providerRef: `gift:${gift.id}`,
        paidAt: new Date(),
      },
    });

    if (gift.game.developerSlug) {
      const gross = gift.amountCents;
      const fee = Math.round((gross * feeBps) / 10_000);
      const net = gross - fee;
      await tx.earning.create({
        data: {
          userId: gift.game.developerSlug,
          gameId: gift.gameId,
          purchaseId: purchase.id,
          grossCents: gross,
          platformFeeCents: fee,
          netCents: net,
          currency: gift.currency.toUpperCase(),
          status: "AVAILABLE",
        },
      });
    }

    await tx.activityEvent.create({
      data: {
        userId: user.id,
        gameId: gift.gameId,
        type: "PURCHASE",
        message: `${gift.game.title} hediye olarak eklendi`,
      },
    });
    await tx.notification.create({
      data: {
        userId: user.id,
        type: "SALE",
        title: `${gift.game.title} kütüphanene eklendi`,
      },
    });
    await tx.inventoryItem.create({
      data: {
        userId: user.id,
        gameId: gift.gameId,
        name: `${gift.game.title} — hediye lisans`,
      },
    });
  });

  return NextResponse.json({ ok: true, redirect: "/library?gift=claimed" });
}

