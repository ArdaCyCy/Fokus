import { FALLBACK_GAME_COVER } from "@/lib/constants/covers";
import { averageRating, type GameListRow } from "@/lib/data/games";
import type { GameCardData } from "@/lib/types/game-card";

export function gameListRowToCardData(row: GameListRow): GameCardData {
  const { rating, count } = averageRating(row.reviews);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    developerName: row.developerName,
    coverImageUrl: row.coverImageUrl ?? FALLBACK_GAME_COVER,
    priceCents: row.priceCents,
    originalPriceCents: row.originalPriceCents,
    currency: row.currency,
    rating: Math.round(rating * 10) / 10,
    reviewCount: count,
    isTurkishMade: row.isTurkishMade,
    categoryNames: row.categories.map((c) => c.category.name),
  };
}
