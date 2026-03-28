import Link from "next/link";
import { MessageSquare, Newspaper, Store, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StorePageHero } from "@/components/store/store-page-hero";
import { CommunityGameFeed } from "@/components/community/community-game-feed";
import { db } from "@/lib/db";
import { isDatabaseUnavailableError } from "@/lib/db/connection-error";
import { getPublishedGames } from "@/lib/data/games";
import { gameListRowToCardData } from "@/lib/mappers/game-card";

export default async function CommunityPage() {
  let newsCount = 0;
  let userCount = 0;
  let suggested: ReturnType<typeof gameListRowToCardData>[] = [];
  let dbUnavailable = false;
  try {
    const [nc, uc, popularRows] = await Promise.all([
      db.newsPost.count(),
      db.user.count(),
      getPublishedGames({ mode: "popular", take: 12, skip: 0 }),
    ]);
    newsCount = nc;
    userCount = uc;
    suggested = popularRows.map(gameListRowToCardData);
  } catch (e) {
    if (isDatabaseUnavailableError(e)) {
      dbUnavailable = true;
    } else {
      throw e;
    }
  }

  return (
    <div className="min-h-screen pb-16 pt-8">
      <div className="mx-auto max-w-6xl px-4">
        <StorePageHero
          eyebrow="Sosyal"
          title="Topluluk"
          description="Duyurular, rehberler ve oyuncu pazarı. Aşağı kaydırarak önerilen oyunları keşfet; pazara doğrudan geçebilirsin."
        />

        {dbUnavailable ? (
          <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Veritabanı bağlantısı yok; istatistikler ve öneriler şimdilik gizlendi.{" "}
            <code className="rounded bg-black/30 px-1">DATABASE_URL</code> ve{" "}
            <code className="rounded bg-black/30 px-1">npx prisma db push</code> ile düzelt.
          </div>
        ) : null}

        <div className="mb-12 grid gap-5 md:grid-cols-3">
          <Card className="border-white/[0.07] bg-card/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="size-4 text-accent" />
                Tartışma merkezi
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Oyun bazlı forumlar ve topluluk başlıkları. Kayıtlı oyuncu:{" "}
              <span className="font-medium text-foreground">
                {userCount.toLocaleString("tr-TR")}
              </span>
            </CardContent>
          </Card>
          <Card className="border-white/[0.07] bg-card/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Newspaper className="size-4 text-accent" />
                Rehberler ve haberler
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Geliştirici duyuruları ve topluluk içerikleri. Yayında haber:{" "}
              <span className="font-medium text-foreground">{newsCount}</span>
            </CardContent>
          </Card>
          <Card className="border-white/[0.07] bg-card/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Store className="size-4 text-accent" />
                Topluluk pazarı
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              Envanter eşyaları ve alım-satım akışı.
              <Button asChild className="w-full">
                <Link href="/community/market">Pazara git</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <section
          id="gruplar"
          className="mb-12 scroll-mt-24 rounded-xl border border-white/[0.07] bg-card/80 p-6 md:p-8"
        >
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent/15">
              <Users className="size-6 text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-heading text-xl font-semibold text-foreground">
                Gruplar
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Oyuncu grupları ve kulüpler yakında burada listelenecek. Şimdilik
                topluluk pazarı ve tartışma akışlarıyla bağlantıda kal.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/community/market">Topluluk pazarı</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.06] pt-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-xl font-semibold text-foreground">
                Topluluk için önerilenler
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Popülerlik ve incelemeye göre — mağazada daha fazlasını görebilirsin.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/community/market">Pazara git</Link>
            </Button>
          </div>
          <CommunityGameFeed
            initialGames={suggested}
            initialSkip={suggested.length}
            mode="popular"
          />
        </section>
      </div>
    </div>
  );
}
