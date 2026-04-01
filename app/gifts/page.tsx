import Link from "next/link";

import { requireAppUser } from "@/lib/auth/app-user";
import { db } from "@/lib/db";
import { GiftsPageClient } from "@/components/gifts/gifts-page-client";

export default async function GiftsPage() {
  const user = await requireAppUser("/gifts");
  const [games, sent, received] = await Promise.all([
    db.game.findMany({
      where: { isPublished: true, status: "PUBLISHED" },
      select: { id: true, title: true, priceCents: true },
      orderBy: { title: "asc" },
      take: 200,
    }),
    db.gift.findMany({
      where: { senderId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { game: { select: { title: true } } },
    }),
    db.gift.findMany({
      where: { recipientEmail: user.email ?? "__none__", status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { game: { select: { title: true } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-bold">Oyun hediye et</h1>
        <p className="text-sm text-muted-foreground">
          Cüzdan bakiyesi ile hediye satın al, alıcı linkten claim ettiğinde oyun kütüphanesine eklenir.
        </p>
        <div className="text-sm">
          <Link href="/wallet" className="text-accent hover:underline">
            Cüzdanımı aç
          </Link>
        </div>
      </div>
      <GiftsPageClient games={games} sent={sent} received={received} />
    </div>
  );
}

