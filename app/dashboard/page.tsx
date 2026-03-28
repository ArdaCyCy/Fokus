import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAppUser } from "@/lib/auth/app-user";
import { db } from "@/lib/db";
import { StorePageHero } from "@/components/store/store-page-hero";

export default async function DashboardOverviewPage() {
  const user = await requireAppUser("/dashboard");
  const gameWhere = user.role === "ADMIN" ? {} : { developerSlug: user.id };
  const [totalGames, publishedGames, draftGames, earnings, recentSales] =
    await Promise.all([
      db.game.count({ where: gameWhere }),
      db.game.count({ where: { ...gameWhere, status: "PUBLISHED" } }),
      db.game.count({ where: { ...gameWhere, status: "DRAFT" } }),
      db.earning.aggregate({
        where: user.role === "ADMIN" ? {} : { userId: user.id },
        _sum: { netCents: true },
      }),
      db.purchase.findMany({
        where: {
          status: "PAID",
          ...(user.role === "ADMIN"
            ? {}
            : { game: { developerSlug: user.id } }),
        },
        include: {
          game: { select: { title: true } },
          user: { select: { username: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

  const stats = [
    { label: "Toplam oyun", value: String(totalGames) },
    { label: "Yayınlanan", value: String(publishedGames) },
    { label: "Taslak", value: String(draftGames) },
    {
      label: "Net kazanç (tahmini)",
      value: `₺${((earnings._sum.netCents ?? 0) / 100).toLocaleString("tr-TR")}`,
    },
  ] as const;

  return (
    <div className="space-y-8">
      <StorePageHero
        eyebrow="Geliştirici"
        title="Genel bakış"
        description="Oyunlarının durumu, satış özeti ve son işlemler."
        className="mb-0"
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <Card
            key={item.label}
            className="border-white/[0.07] bg-card/95 shadow-md"
          >
            <CardHeader className="pb-2">
              <CardDescription>{item.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-2xl font-bold text-foreground">
                {item.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <Card className="border-white/[0.07] bg-card/95">
          <CardHeader>
            <CardTitle>Son satışlar</CardTitle>
            <CardDescription>
              Tamamlanmış satın alımlar; veriler canlı veritabanından gelir.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {recentSales.length === 0 ? (
              <p className="text-sm text-muted-foreground">Henüz satış yok.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sipariş</TableHead>
                    <TableHead>Oyun</TableHead>
                    <TableHead>Alıcı</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Tarih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono text-xs">
                        {sale.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>{sale.game.title}</TableCell>
                      <TableCell>
                        {sale.user.username ?? sale.user.email ?? "kullanıcı"}
                      </TableCell>
                      <TableCell>
                        ₺{(sale.amountCents / 100).toLocaleString("tr-TR")}
                      </TableCell>
                      <TableCell>
                        {new Date(sale.createdAt).toLocaleDateString("tr-TR")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
