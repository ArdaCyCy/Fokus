import type { DemoGame } from "@/lib/validations/game";
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

export function demoGameToCardData(d: DemoGame): GameCardData {
  return {
    id: d.id,
    slug: d.slug,
    title: d.title,
    developerName: d.developer,
    coverImageUrl: d.coverUrl,
    priceCents: d.priceCents,
    originalPriceCents: d.originalPriceCents ?? null,
    currency: d.currency,
    rating: d.rating,
    reviewCount: 0,
    isTurkishMade: d.isTurkishMade,
    categoryNames: d.categories,
  };
}
