import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { enforceApiRateLimit } from "@/lib/api-rate-limit";
import { requireAppUser } from "@/lib/auth/app-user";
import { db } from "@/lib/db";
import { sendGiftEmail } from "@/lib/email/send-gift-email";

const createSchema = z.object({
  gameId: z.string().cuid(),
  recipientEmail: z.string().email(),
  note: z.string().max(240).optional(),
});

export async function GET() {
  const user = await requireAppUser("/gifts");
  const [sent, received] = await Promise.all([
    db.gift.findMany({
      where: { senderId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { game: { select: { id: true, title: true, slug: true } } },
    }),
    db.gift.findMany({
      where: { recipientEmail: user.email ?? "__none__", status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { game: { select: { id: true, title: true, slug: true } } },
    }),
  ]);
  return NextResponse.json({ sent, received });
}

export async function POST(req: NextRequest) {
  const limited = await enforceApiRateLimit(req, {
    key: "gifts-create",
    limit: 20,
    window: "1 m",
  });
  if (limited) return limited;

  const user = await requireAppUser("/gifts");
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
  }
  if (!user.email) {
    return NextResponse.json(
      { error: "Hediye göndermek için hesabında e-posta tanımlı olmalı." },
      { status: 400 },
    );
  }

  const { gameId, note } = parsed.data;
  const recipientEmail = parsed.data.recipientEmail.trim().toLowerCase();
  if (recipientEmail === user.email.trim().toLowerCase()) {
    return NextResponse.json({ error: "Kendine hediye gönderemezsin." }, { status: 400 });
  }

  const game = await db.game.findFirst({
    where: { id: gameId, isPublished: true, status: "PUBLISHED" },
    select: { id: true, title: true, priceCents: true },
  });
  if (!game) {
    return NextResponse.json({ error: "Hediye edilecek oyun bulunamadı." }, { status: 404 });
  }
  if (game.priceCents < 1) {
    return NextResponse.json(
      { error: "Ücretsiz oyunlar için hediye satın alımı gerekmez." },
      { status: 400 },
    );
  }
  if (user.walletBalanceCents < game.priceCents) {
    return NextResponse.json(
      { error: "Yetersiz bakiye. Önce cüzdanına para yükle." },
      { status: 400 },
    );
  }

  const gift = await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { walletBalanceCents: { decrement: game.priceCents } },
    });
    await tx.walletTransaction.create({
      data: {
        userId: user.id,
        amountCents: -game.priceCents,
        type: "PURCHASE",
        description: `${game.title} — hediye gönderimi (${recipientEmail})`,
      },
    });
    return tx.gift.create({
      data: {
        senderId: user.id,
        recipientEmail,
        gameId: game.id,
        amountCents: game.priceCents,
        currency: "TRY",
        note: note?.trim() || null,
      },
      select: { id: true, claimToken: true },
    });
  });

  void sendGiftEmail({
    toEmail: recipientEmail,
    gameTitle: game.title,
    amountCents: game.priceCents,
    claimPath: `/gifts/claim/${gift.claimToken}`,
    senderName: user.username ?? user.email,
    note: note?.trim() || null,
    requestId: crypto.randomUUID(),
  });

  return NextResponse.json({
    ok: true,
    giftId: gift.id,
    claimUrl: `/gifts/claim/${gift.claimToken}`,
  });
}

