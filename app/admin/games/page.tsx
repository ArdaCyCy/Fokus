import Link from "next/link";
import { requireRole } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function moderate(gameId: string, decision: "APPROVE" | "REJECT") {
  "use server";
  await requireRole("ADMIN", "/admin/games");
  await db.game.update({
    where: { id: gameId },
    data: {
      status: decision === "APPROVE" ? "PUBLISHED" : "REJECTED",
      isPublished: decision === "APPROVE",
      releasedAt: decision === "APPROVE" ? new Date() : null,
    },
  });
}

export default async function AdminGamesPage() {
  await requireRole("ADMIN", "/admin/games");
  const pending = await db.game.findMany({
    where: { status: "PENDING" },
    orderBy: { updatedAt: "asc" },
    select: { id: true, title: true, developerName: true, updatedAt: true, priceCents: true },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold">Admin oyun onayı</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild size="sm">
            <Link href="/admin/review-reports">İnceleme raporları</Link>
          </Button>
          <Button variant="outline" asChild size="sm">
            <Link href="/admin/payouts">Ödeme talepleri</Link>
          </Button>
        </div>
      </div>
      {pending.map((game) => (
        <Card key={game.id} className="bg-card/70">
          <CardHeader>
            <CardTitle>{game.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {game.developerName} - ₺{(game.priceCents / 100).toLocaleString("tr-TR")}
            </p>
            <div className="flex gap-2">
              <form action={moderate.bind(null, game.id, "APPROVE")}>
                <Button type="submit" variant="default">
                  Onayla
                </Button>
              </form>
              <form action={moderate.bind(null, game.id, "REJECT")}>
                <Button type="submit" variant="destructive">
                  Reddet
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      ))}
      {pending.length === 0 ? <p className="text-sm text-muted-foreground">Bekleyen oyun yok.</p> : null}
    </div>
  );
}
