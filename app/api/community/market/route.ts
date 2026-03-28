import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { enforceApiRateLimit } from "@/lib/api-rate-limit";
import { requireAppUser } from "@/lib/auth/app-user";
import { db } from "@/lib/db";
import { allowDesktopNotification } from "@/lib/notifications/preferences";

const buySchema = z.object({
  listingId: z.string().min(1),
});
const listSchema = z.object({
  inventoryItemId: z.string().min(1),
  priceCents: z.number().int().min(100).max(500000),
});

export async function GET() {
  const listings = await db.marketListing.findMany({
    where: { soldAt: null },
    include: {
      inventoryItem: { select: { id: true, name: true, imageUrl: true, game: { select: { title: true } } } },
      seller: { select: { username: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });
  return NextResponse.json({ listings });
}

export async function POST(req: NextRequest) {
  const limited = await enforceApiRateLimit(req, { key: "market-buy", limit: 30, window: "1 m" });
  if (limited) return limited;
  const buyer = await requireAppUser("/community/market");
  const parsed = buySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });

  const listing = await db.marketListing.findFirst({
    where: { id: parsed.data.listingId, soldAt: null },
    include: { inventoryItem: true },
  });
  if (!listing) return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
  if (listing.sellerId === buyer.id) return NextResponse.json({ error: "Kendi urununu alamazsin." }, { status: 400 });
  const sellerBlocked = await db.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: buyer.id, blockedId: listing.sellerId },
        { blockerId: listing.sellerId, blockedId: buyer.id },
      ],
    },
    select: { id: true },
  });
  if (sellerBlocked) {
    return NextResponse.json({ error: "Bu satıcı ile islem yapılamaz." }, { status: 403 });
  }

  const buyerDb = await db.user.findUnique({
    where: { id: buyer.id },
    select: { walletBalanceCents: true },
  });
  if (!buyerDb || buyerDb.walletBalanceCents < listing.priceCents) {
    return NextResponse.json({ error: "Yetersiz bakiye." }, { status: 400 });
  }

  const notifySeller = await allowDesktopNotification(listing.sellerId);
  await db.$transaction(async (tx) => {
    await tx.marketListing.update({
      where: { id: listing.id },
      data: { soldAt: new Date() },
    });
    await tx.inventoryItem.update({
      where: { id: listing.inventoryItemId },
      data: { userId: buyer.id },
    });
    await tx.user.update({
      where: { id: buyer.id },
      data: { walletBalanceCents: { decrement: listing.priceCents } },
    });
    await tx.user.update({
      where: { id: listing.sellerId },
      data: { walletBalanceCents: { increment: listing.priceCents } },
    });
    await tx.walletTransaction.createMany({
      data: [
        {
          userId: buyer.id,
          amountCents: -listing.priceCents,
          type: "MARKET_BUY",
          description: `${listing.inventoryItem.name} satın alımı`,
        },
        {
          userId: listing.sellerId,
          amountCents: listing.priceCents,
          type: "MARKET_SELL",
          description: `${listing.inventoryItem.name} satisi`,
        },
      ],
    });
    if (notifySeller) {
      await tx.notification.create({
        data: {
          userId: listing.sellerId,
          type: "SALE",
          title: `${listing.inventoryItem.name} satildi`,
        },
      });
    }
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const limited = await enforceApiRateLimit(req, { key: "market-list", limit: 20, window: "1 m" });
  if (limited) return limited;
  const user = await requireAppUser("/community/market");
  const parsed = listSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });

  const item = await db.inventoryItem.findFirst({
    where: { id: parsed.data.inventoryItemId, userId: user.id },
    select: { id: true },
  });
  if (!item) return NextResponse.json({ error: "Envanter öğesi bulunamadı." }, { status: 404 });

  await db.marketListing.upsert({
    where: { inventoryItemId: item.id },
    create: {
      sellerId: user.id,
      inventoryItemId: item.id,
      priceCents: parsed.data.priceCents,
    },
    update: {
      sellerId: user.id,
      priceCents: parsed.data.priceCents,
      soldAt: null,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await requireAppUser("/community/market");
  const url = new URL(req.url);
  const listingId = url.searchParams.get("listingId");
  if (!listingId) return NextResponse.json({ error: "Eksik listingId." }, { status: 400 });
  await db.marketListing.deleteMany({ where: { id: listingId, sellerId: user.id, soldAt: null } });
  return NextResponse.json({ ok: true });
}
