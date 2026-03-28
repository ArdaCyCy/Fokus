import Link from "next/link";
import { ModerationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function resolveReport(reportId: string, status: "RESOLVED" | "DISMISSED") {
  "use server";
  await requireRole("ADMIN", "/admin/review-reports");
  await db.reviewReport.update({
    where: { id: reportId },
    data: {
      status: status === "RESOLVED" ? ModerationStatus.RESOLVED : ModerationStatus.DISMISSED,
      resolvedAt: new Date(),
    },
  });
  revalidatePath("/admin/review-reports");
}

export default async function AdminReviewReportsPage() {
  await requireRole("ADMIN", "/admin/review-reports");
  const reports = await db.reviewReport.findMany({
    where: { status: ModerationStatus.PENDING },
    orderBy: { createdAt: "asc" },
    include: {
      review: {
        select: {
          id: true,
          rating: true,
          content: true,
          title: true,
          game: { select: { title: true, slug: true } },
        },
      },
      reporter: { select: { username: true, email: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold">Inceleme moderasyonu</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild size="sm">
            <Link href="/admin/games">Oyun onayı</Link>
          </Button>
          <Button variant="outline" asChild size="sm">
            <Link href="/admin/payouts">Ödeme talepleri</Link>
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Bekleyen raporlar: {reports.length}</p>
      {reports.map((r) => (
        <Card key={r.id} className="bg-card/70">
          <CardHeader>
            <CardTitle className="text-base">{r.review.game.title}</CardTitle>
            <p className="text-xs text-muted-foreground">
              Raporlayan: {r.reporter.username ?? r.reporter.email} ·{" "}
              {new Date(r.createdAt).toLocaleString("tr-TR")}
            </p>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <span className="font-medium">Puan:</span> {r.review.rating}/5
            </p>
            {r.review.title ? <p className="font-medium">{r.review.title}</p> : null}
            {r.review.content ? <p className="text-muted-foreground">{r.review.content}</p> : null}
            <p className="rounded-md border border-border bg-muted/30 p-2 text-muted-foreground">
              <span className="font-medium text-foreground">Neden:</span> {r.reason}
            </p>
            <div className="flex gap-2">
              <form action={resolveReport.bind(null, r.id, "RESOLVED")}>
                <Button type="submit" size="sm">
                  Çözüldü
                </Button>
              </form>
              <form action={resolveReport.bind(null, r.id, "DISMISSED")}>
                <Button type="submit" variant="outline" size="sm">
                  Reddet (spam)
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      ))}
      {reports.length === 0 ? (
        <p className="text-sm text-muted-foreground">Bekleyen rapor yok.</p>
      ) : null}
    </div>
  );
}
