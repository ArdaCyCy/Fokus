import Link from "next/link";
import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

async function setPayoutStatus(payoutId: string, status: "PAID" | "REJECTED") {
  await requireRole("ADMIN", "/admin/payouts");
  await db.payoutRequest.update({
    where: { id: payoutId },
    data: {
      status,
      paidAt: status === "PAID" ? new Date() : null,
    },
  });
  revalidatePath("/admin/payouts");
}

async function actionMarkPaid(formData: FormData) {
  "use server";
  const id = formData.get("id");
  if (typeof id !== "string") return;
  await setPayoutStatus(id, "PAID");
}

async function actionMarkRejected(formData: FormData) {
  "use server";
  const id = formData.get("id");
  if (typeof id !== "string") return;
  await setPayoutStatus(id, "REJECTED");
}

export default async function AdminPayoutsPage() {
  await requireRole("ADMIN", "/admin/payouts");

  const [pending, history] = await Promise.all([
    db.payoutRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: {
        developer: { select: { id: true, email: true, username: true } },
      },
    }),
    db.payoutRequest.findMany({
      where: { status: { not: "PENDING" } },
      orderBy: { createdAt: "desc" },
      take: 40,
      include: {
        developer: { select: { id: true, email: true, username: true } },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold">Ödeme talepleri</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild size="sm">
            <Link href="/admin/games">Oyun onayı</Link>
          </Button>
          <Button variant="outline" asChild size="sm">
            <Link href="/admin/review-reports">İnceleme raporları</Link>
          </Button>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Bekleyen ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">Bekleyen talep yok.</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((p) => (
              <li key={p.id}>
                <Card className="bg-card/70">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      ₺{(p.amountCents / 100).toLocaleString("tr-TR")}
                    </CardTitle>
                    <CardDescription>
                      {p.developer.username ?? p.developer.email ?? p.developer.id}{" "}
                      · {new Date(p.createdAt).toLocaleString("tr-TR")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {p.note ? (
                      <p className="text-muted-foreground">{p.note}</p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      <form action={actionMarkPaid}>
                        <input type="hidden" name="id" value={p.id} />
                        <Button type="submit" size="sm">
                          Ödendi işaretle
                        </Button>
                      </form>
                      <form action={actionMarkRejected}>
                        <input type="hidden" name="id" value={p.id} />
                        <Button type="submit" size="sm" variant="destructive">
                          Reddet
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Geçmiş
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Kayıt yok.</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card/40 text-sm">
            {history.map((p) => (
              <li
                key={p.id}
                className="flex flex-col gap-1 px-3 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
              >
                <span>
                  {p.developer.username ?? p.developer.email ?? p.developer.id}
                </span>
                <span>
                  ₺{(p.amountCents / 100).toLocaleString("tr-TR")} ·{" "}
                  <span className="font-medium">{p.status}</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(p.createdAt).toLocaleDateString("tr-TR")}
                  {p.paidAt
                    ? ` → ${new Date(p.paidAt).toLocaleDateString("tr-TR")}`
                    : null}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
