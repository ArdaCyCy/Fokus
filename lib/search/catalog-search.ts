import { countPublishedGames, getPublishedGames } from "@/lib/data/games";
import type { GameListRow } from "@/lib/data/games";

/**
 * OpenSearch/Elasticsearch geçişi için tek giriş noktası.
 * Şu an Prisma + PostgreSQL ile aynı davranışı üretir.
 */
export async function catalogSearch(params: {
  q?: string;
  categorySlug?: string | null;
  skip?: number;
  take?: number;
}): Promise<{ items: GameListRow[]; total: number }> {
  const take = params.take ?? 24;
  const skip = params.skip ?? 0;
  const [items, total] = await Promise.all([
    getPublishedGames({
      search: params.q,
      categorySlug: params.categorySlug,
      mode: "new",
      sort: "relevance",
      skip,
      take,
    }),
    countPublishedGames({
      search: params.q,
      categorySlug: params.categorySlug,
      mode: "new",
    }),
  ]);
  return { items, total };
}
