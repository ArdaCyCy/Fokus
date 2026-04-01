import { db } from "@/lib/db";

export default async function AdminOverviewPage() {
  const [
    userCount,
    gameCount,
    publishedCount,
    pendingGames,
    revenueAgg,
    purchaseCount,
  ] = await Promise.all([
    db.user.count(),
    db.game.count(),
    db.game.count({ where: { status: "PUBLISHED" } }),
    db.game.count({ where: { status: "PENDING" } }),
    db.purchase.aggregate({
      where: { status: "PAID" },
      _sum: { amountCents: true },
    }),
    db.purchase.count({ where: { status: "PAID" } }),
  ]);

  const grossTry = (revenueAgg._sum.amountCents ?? 0) / 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Admin özeti</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toplam gelir: tamamlanmış satın alımların brüt tutarı (₺). Geliştirici
          payı komisyon sonrası ayrı hesaplanır.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <li className="rounded-xl border border-white/[0.08] bg-card/80 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Kullanıcılar
          </p>
          <p className="mt-1 font-heading text-2xl font-bold">{userCount}</p>
        </li>
        <li className="rounded-xl border border-white/[0.08] bg-card/80 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Oyunlar (yayında)
          </p>
          <p className="mt-1 font-heading text-2xl font-bold">
            {publishedCount}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              / {gameCount}
            </span>
          </p>
        </li>
        <li className="rounded-xl border border-white/[0.08] bg-card/80 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Onay bekleyen oyun
          </p>
          <p className="mt-1 font-heading text-2xl font-bold">{pendingGames}</p>
        </li>
        <li className="rounded-xl border border-white/[0.08] bg-card/80 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Tamamlanan satış
          </p>
          <p className="mt-1 font-heading text-2xl font-bold">{purchaseCount}</p>
        </li>
        <li className="rounded-xl border border-white/[0.08] bg-card/80 p-4 sm:col-span-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Brüt satış geliri (₺)
          </p>
          <p className="mt-1 font-heading text-2xl font-bold">
            ₺{grossTry.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
          </p>
        </li>
      </ul>
    </div>
  );
}
