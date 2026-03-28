import Link from "next/link";

import {
  countPublishedGames,
  getDemosPublishedGames,
  getPopularByReviewsSince,
  getPublishedDlcGames,
  getPublishedGames,
  getUpcomingPublishedGames,
} from "@/lib/data/games";
import { gameListRowToCardData } from "@/lib/mappers/game-card";
import { GameMiniRail } from "@/components/games/game-mini-rail";

export async function StoreBrowseSections() {
  const now = new Date();
  const weekSince = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthSince = new Date(now);
  monthSince.setMonth(monthSince.getMonth() - 1);
  const yearSince = new Date(now);
  yearSince.setFullYear(yearSince.getFullYear() - 1);

  const [
    newRows,
    upcomingRows,
    demoRows,
    publishedTotal,
    popularSlice,
    weekPopularRows,
    monthPopularRows,
    yearPopularRows,
    dlcRows,
  ] = await Promise.all([
    getPublishedGames({ mode: "new", take: 10, skip: 0 }),
    getUpcomingPublishedGames(10),
    getDemosPublishedGames(8),
    countPublishedGames({}),
    getPublishedGames({ mode: "popular", take: 6, skip: 0 }),
    getPopularByReviewsSince({ since: weekSince, take: 8 }),
    getPopularByReviewsSince({ since: monthSince, take: 8 }),
    getPopularByReviewsSince({ since: yearSince, take: 8 }),
    getPublishedDlcGames(10, 0),
  ]);

  const newCards = newRows.map(gameListRowToCardData);
  const upcomingCards = upcomingRows.map(gameListRowToCardData);
  const demoCards = demoRows.map(gameListRowToCardData);
  const popularCards = popularSlice.map(gameListRowToCardData);
  const weekCards = weekPopularRows.map(gameListRowToCardData);
  const monthCards = monthPopularRows.map(gameListRowToCardData);
  const yearCards = yearPopularRows.map(gameListRowToCardData);
  const dlcCards = dlcRows.map(gameListRowToCardData);

  return (
    <div className="mb-12 space-y-2">
      <div className="mb-8 grid grid-cols-2 gap-3 rounded-xl border border-white/[0.06] bg-black/25 px-4 py-4 sm:grid-cols-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Yayındaki başlık
          </p>
          <p className="mt-1 font-heading text-xl font-bold text-accent">
            {publishedTotal.toLocaleString("tr-TR")}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Öne çıkan (liste)
          </p>
          <p className="mt-1 font-heading text-xl font-bold text-foreground">
            {popularCards.length}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Demo / ücretsiz
          </p>
          <p className="mt-1 font-heading text-xl font-bold text-foreground">
            {demoCards.length}+
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Yakında
          </p>
          <p className="mt-1 font-heading text-xl font-bold text-foreground">
            {upcomingCards.length}
          </p>
        </div>
      </div>

      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        Göz at
      </p>

      <GameMiniRail
        title="Yeni çıkanlar"
        subtitle="Son yayımlanan yapımlar"
        games={newCards}
        seeAllHref="/games?mode=new"
      />
      <GameMiniRail
        title="Çok satanlar"
        subtitle="İnceleme ve etkileşime göre öne çıkanlar"
        games={popularCards}
        seeAllHref="/games?mode=popular"
      />
      {upcomingCards.length > 0 ? (
        <GameMiniRail
          title="Çok yakında"
          subtitle="Planlı çıkış tarihi olan oyunlar"
          games={upcomingCards}
          seeAllHref="/games"
        />
      ) : null}
      <GameMiniRail
        title="Demolar ve ücretsiz"
        subtitle="Fiyatı sıfır veya demo içeren başlıklar"
        games={demoCards}
        seeAllHref="/search?q=demo"
      />

      <p className="mb-4 mt-10 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        Sıralamalar ve istatistikler
      </p>
      <GameMiniRail
        title="Haftanın en popülerleri"
        subtitle="Son 7 günde en çok inceleme alanlar"
        games={weekCards}
        seeAllHref="/games?mode=popular"
      />
      <GameMiniRail
        title="Ayın en popülerleri"
        subtitle="Son 30 güne göre inceleme yoğunluğu"
        games={monthCards}
        seeAllHref="/games?mode=popular"
      />
      <GameMiniRail
        title="Yılın en popülerleri"
        subtitle="Son 12 aya göre topluluk ilgisi"
        games={yearCards}
        seeAllHref="/games?mode=popular"
      />

      {dlcCards.length > 0 ? (
        <GameMiniRail
          title="DLC ve eklentiler"
          subtitle="Ana oyuna bağlı yayımlanmış içerikler"
          games={dlcCards}
          seeAllHref="/games"
        />
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-center text-sm text-muted-foreground">
          <p className="font-medium text-foreground">DLC ve eklentiler</p>
          <p className="mt-1 text-xs">
            Geliştiriciler ana oyunlarına DLC bağladığında bu şerit otomatik
            dolar. Ana oyunları{" "}
            <Link href="/games" className="text-accent underline">
              mağazadan
            </Link>{" "}
            keşfet.
          </p>
        </div>
      )}
    </div>
  );
}
