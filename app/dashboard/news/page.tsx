import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NewsForm } from "@/components/dashboard/news-form";
import { requireRole } from "@/lib/auth/permissions";
import { db } from "@/lib/db";

export default async function DashboardNewsPage() {
  const user = await requireRole("DEVELOPER", "/dashboard/news");
  const games = await db.game.findMany({
    where: user.role === "ADMIN" ? {} : { developerSlug: user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true },
  });

  return (
    <Card className="bg-card/70">
      <CardHeader>
        <CardTitle>Haber / Patch Notu Yayimla</CardTitle>
        <CardDescription>Topluluga duyuru, etkinlik ve patch notu paylas.</CardDescription>
      </CardHeader>
      <CardContent>
        <NewsForm games={games} />
      </CardContent>
    </Card>
  );
}
