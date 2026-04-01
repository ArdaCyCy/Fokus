import Link from "next/link";
import { notFound } from "next/navigation";

import { ClaimGiftButton } from "@/components/gifts/claim-gift-button";
import { requireAppUser } from "@/lib/auth/app-user";
import { db } from "@/lib/db";

export default async function GiftClaimPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  await requireAppUser("/gifts");
  const { token } = await params;
  const gift = await db.gift.findUnique({
    where: { claimToken: token },
    include: { game: { select: { title: true } } },
  });
  if (!gift) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-12">
      <h1 className="font-heading text-2xl font-bold">Hediye claim</h1>
      <p className="text-sm text-muted-foreground">
        Oyun: <span className="font-medium text-foreground">{gift.game.title}</span>
      </p>
      <p className="text-sm text-muted-foreground">Durum: {gift.status}</p>
      {gift.status === "PENDING" ? (
        <ClaimGiftButton token={token} />
      ) : (
        <Link href="/library" className="text-accent hover:underline">
          Kütüphaneye dön
        </Link>
      )}
    </div>
  );
}

