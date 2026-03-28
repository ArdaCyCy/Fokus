import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/app-user";
import { db } from "@/lib/db";

export async function GET() {
  const user = await requireAppUser("/profile");
  const items = await db.inventoryItem.findMany({
    where: { userId: user.id },
    include: {
      game: { select: { title: true } },
      listing: { select: { id: true, priceCents: true, soldAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items });
}
