import type { GameListRow } from "@/lib/data/games";
import { getPublishedGames } from "@/lib/data/games";
import { db } from "@/lib/db";

/** Populerlik + kategori cesitliligi — anon vitrin icin. */
export async function getHomeBlendedRecommendations(params: {
  take?: number;
}): Promise<GameListRow[]> {
  const take = params.take ?? 8;
  const pool = await getPublishedGames({ mode: "popular", sort: "top_rated", take: Math.max(take * 3, 24) });
  return diversifyByPrimaryCategory(pool, take);
}

function diversifyByPrimaryCategory(rows: GameListRow[], take: number): GameListRow[] {
  const picked: GameListRow[] = [];
  const usedId = new Set<string>();
  const usedPrimaryCat = new Set<string>();

  for (const row of rows) {
    if (picked.length >= take) break;
    const primary = row.categories[0]?.category.slug ?? "__none__";
    if (usedPrimaryCat.has(primary) && picked.length >= Math.ceil(take / 2)) continue;
    picked.push(row);
    usedId.add(row.id);
    usedPrimaryCat.add(primary);
  }

  for (const row of rows) {
    if (picked.length >= take) break;
    if (usedId.has(row.id)) continue;
    picked.push(row);
    usedId.add(row.id);
  }

  return picked.slice(0, take);
}

/** Ayni kategorilerden, mevcut oyundan baska yayinlanmis oyunlar. */
export async function getSimilarPublishedGames(params: {
  gameId: string;
  categoryIds: string[];
  take?: number;
}): Promise<GameListRow[]> {
  const take = params.take ?? 6;
  if (params.categoryIds.length === 0) {
    return getPublishedGames({
      mode: "popular",
      sort: "top_rated",
      take,
    });
  }

  return db.game.findMany({
    where: {
      id: { not: params.gameId },
      isPublished: true,
      status: "PUBLISHED",
      categories: { some: { categoryId: { in: params.categoryIds } } },
    },
    include: {
      categories: { include: { category: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: [{ reviews: { _count: "desc" } }, { releasedAt: "desc" }],
    take,
  });
}
