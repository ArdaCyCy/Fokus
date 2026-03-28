import { gameListRowToCardData } from "@/lib/mappers/game-card";
import { getPublishedGames } from "@/lib/data/games";
import { getHomeBlendedRecommendations } from "@/lib/recommendations";
import { isSeasonalSaleActive, seasonalSaleLabel } from "@/lib/commerce/seasonal";
import { HomePage } from "@/components/home/home-page";

/** DB şeması `prisma db push` / migrate sonrası güncellenene kadar build sırasında istatistik toplanmasın. */
export const dynamic = "force-dynamic";

export default async function Page() {
  let rows: Awaited<ReturnType<typeof getPublishedGames>> = [];
  let recommendedRows: Awaited<ReturnType<typeof getHomeBlendedRecommendations>> =
    [];

  try {
    rows = await getPublishedGames({ take: 30, mode: "new" });
  } catch (e) {
    console.error("[Fokus] Ana sayfa: oyun listesi yüklenemedi:", e);
  }
  try {
    recommendedRows = await getHomeBlendedRecommendations({ take: 8 });
  } catch (e) {
    console.error("[Fokus] Ana sayfa: öneriler yüklenemedi:", e);
  }

  const games = rows.map(gameListRowToCardData);
  const recommended = recommendedRows.map(gameListRowToCardData);
  const featured = games.slice(0, 8);
  const newReleases = games.slice(0, 6);
  const categories = Array.from(
    new Set(
      rows.flatMap((r) =>
        (r.categories ?? [])
          .map((c) => c.category?.name)
          .filter((n): n is string => Boolean(n)),
      ),
    ),
  ).slice(0, 10);

  return (
    <HomePage
      games={games}
      featured={featured}
      newReleases={newReleases}
      recommended={recommended}
      categories={categories}
      seasonalBanner={isSeasonalSaleActive() ? seasonalSaleLabel() : null}
    />
  );
}
