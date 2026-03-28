import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAppUser } from "@/lib/auth/app-user";
import { db } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PayoutRequestForm } from "@/components/dashboard/payout-request-form";

export default async function DashboardEarningsPage() {
  const user = await requireAppUser("/dashboard/earnings");
  const [rows, refundCount, payouts] = await Promise.all([
    db.earning.findMany({
      where: user.role === "ADMIN" ? {} : { userId: user.id },
      include: { game: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    db.purchase.count({
      where: {
        status: "REFUNDED",
        ...(user.role === "ADMIN" ? {} : { game: { developerSlug: user.id } }),
      },
    }),
    user.role === "ADMIN"
      ? db.payoutRequest.findMany({ orderBy: { createdAt: "desc" }, take: 20 })
      : db.payoutRequest.findMany({
          where: { developerId: user.id },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
  ]);
  const total = rows.reduce((acc, r) => acc + r.netCents, 0);

  return (
    <Card className="bg-card/70">
      <CardHeader>
        <CardTitle>Kazançlarım</CardTitle>
        <CardDescription>
          Satislardan elde edilen net gelir ozetin.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="font-medium">Toplam net kazanc: ₺{(total / 100).toLocaleString("tr-TR")}</p>
        <p className="text-muted-foreground">
          Iade sayisi (ilgili satislar): <span className="font-medium text-foreground">{refundCount}</span>
        </p>
        {(user.role === "DEVELOPER" || user.role === "ADMIN") && (
          <div className="space-y-4">
            <Card className="border-white/[0.08] bg-muted/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Geliştirici ödemeleri (İyzico)</CardTitle>
                <CardDescription>
                  Pazaryeri / alt üye (submerchant) ve otomatik pay dağıtımı İyzico üzerinden
                  yapılandırılacak. Şimdilik kazanç özeti aşağıda; ödeme talebi formunu kullan.
                </CardDescription>
              </CardHeader>
            </Card>
            <PayoutRequestForm />
          </div>
        )}
        {payouts.length > 0 ? (
          <div>
            <p className="mb-2 font-medium">Ödeme talepleri</p>
            <ul className="space-y-1 rounded-md border border-border bg-muted/20 p-2 text-xs">
              {payouts.map((p) => (
                <li key={p.id}>
                  {new Date(p.createdAt).toLocaleDateString("tr-TR")} — ₺
                  {(p.amountCents / 100).toLocaleString("tr-TR")} — {p.status}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Oyun</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">Net</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{new Date(r.createdAt).toLocaleDateString("tr-TR")}</TableCell>
                <TableCell>{r.game.title}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell className="text-right">₺{(r.netCents / 100).toLocaleString("tr-TR")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
