import { db } from "@/lib/db";

/** Öncelik: satın alma ve sepet, sonra kronoloji + stabil sıra (id). */
export async function getRecentActivity(userId: string, limit = 12) {
  const rows = await db.activityEvent.findMany({
    where: { userId },
    include: { game: { select: { title: true, slug: true } } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit * 2,
  });

  const weight = (t: string) =>
    t === "PURCHASE" ? 3 : t === "CART_ADD" || t === "REVIEW" ? 2 : 1;
  return [...rows]
    .sort((a, b) => {
      const dw = weight(b.type) - weight(a.type);
      if (dw !== 0) return dw;
      const ct = b.createdAt.getTime() - a.createdAt.getTime();
      if (ct !== 0) return ct;
      return b.id.localeCompare(a.id);
    })
    .slice(0, limit);
}
