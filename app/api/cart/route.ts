import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAppUser } from "@/lib/auth/app-user";
import { db } from "@/lib/db";
import { getCartItems } from "@/lib/data/account";

const bodySchema = z.object({
  gameId: z.string().cuid(),
});

export async function GET() {
  const user = await requireAppUser("/cart");
  const items = await getCartItems(user.id);
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const user = await requireAppUser("/cart");
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri", issues: parsed.error.flatten() }, { status: 400 });
  }

  const game = await db.game.findUnique({ where: { id: parsed.data.gameId } });
  if (!game || !game.isPublished) {
    return NextResponse.json({ error: "Oyun bulunamadı" }, { status: 404 });
  }

  await db.cartItem.upsert({
    where: { userId_gameId: { userId: user.id, gameId: parsed.data.gameId } },
    update: {},
    create: { userId: user.id, gameId: parsed.data.gameId },
  });
  const existedInWishlist = await db.wishlist.findFirst({
    where: { userId: user.id, gameId: parsed.data.gameId },
    select: { id: true },
  });
  await db.activityEvent.create({
    data: {
      userId: user.id,
      gameId: game.id,
      type: "CART_ADD",
      message: existedInWishlist
        ? `${game.title} wishlist'ten sepete donustu`
        : `${game.title} sepete eklendi`,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await requireAppUser("/cart");
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri", issues: parsed.error.flatten() }, { status: 400 });
  }

  await db.cartItem.deleteMany({
    where: { userId: user.id, gameId: parsed.data.gameId },
  });
  return NextResponse.json({ ok: true });
}
