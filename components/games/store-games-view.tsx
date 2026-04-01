import Link from "next/link";

import {
  type DiscoverMode,
  countPublishedGames,
  getPublishedGames,
} from "@/lib/data/games";
import { gameListRowToCardData } from "@/lib/mappers/game-card";
import { DISCOVER_CATEGORY_FILTERS } from "@/lib/games/categories";
import { GameGrid } from "@/components/games/game-grid";
import { StoreBrowseSections } from "@/components/games/store-browse-sections";
import { StoreHero } from "@/components/games/store-hero";
import { Button } from "@/components/ui/button";
import { isSeasonalSaleActive, seasonalSaleLabel } from "@/lib/commerce/seasonal";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

function gamesListHref(
  basePath: "/" | "/games",
  opts: {
    q?: string;
    cat: string | null;
    mode: DiscoverMode;
    page?: number;
  },
) {
  const p = new URLSearchParams();
  if (opts.q?.trim()) p.set("q", opts.q.trim());
  if (opts.cat) p.set("cat", opts.cat);
  if (opts.mode !== "new") p.set("mode", opts.mode);
  if (opts.page && opts.page > 1) p.set("page", String(opts.page));
  const qs = p.toString();
  if (!qs.length) return basePath;
  return `${basePath}?${qs}`;
}

export async function StoreGamesView({
  searchParams,
  basePath,
}: {
  searchParams: Promise<{ q?: string; cat?: string; page?: string; mode?: string }>;
  basePath: "/" | "/games";
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const catParam = sp.cat?.trim() || null;
  const mode: DiscoverMode =
    sp.mode === "popular" || sp.mode === "discounted" ? sp.mode : "new";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  let rows: Awaited<ReturnType<typeof getPublishedGames>> = [];
  let total = 0;
  try {
    [rows, total] = await Promise.all([
      getPublishedGames({
        search: q,
        categorySlug: catParam,
        mode,
        skip,
        take: PAGE_SIZE,
      }),
      countPublishedGames({ search: q, categorySlug: catParam, mode }),
    ]);
  } catch (e) {
    console.error("[Fokus] Mağaza liste sorgusu başarısız:", e);
  }

  const cards = rows.map(gameListRowToCardData);
  const hasMore = skip + rows.length < total;
  const seasonalBanner = isSeasonalSaleActive() ? seasonalSaleLabel() : null;

  return (
    <>
      <StoreHero
        seasonalBanner={seasonalBanner}
        basePath={basePath}
        searchDefaults={{ q, catParam, mode }}
      />
      <div className="min-h-screen pb-16 pt-8">
        <div className="mx-auto max-w-6xl px-4">
          <StoreBrowseSections listBasePath={basePath} />

          <div className="mb-5 flex flex-wrap gap-2">
            {(
              [
                { key: "new", label: "Yeni ve popüler" },
                { key: "popular", label: "Çok satanlar" },
                { key: "discounted", label: "İndirimdekiler" },
              ] as const
            ).map((m) => (
              <Link
                key={m.key}
                href={gamesListHref(basePath, {
                  q,
                  cat: catParam,
                  mode: m.key,
                  page: 1,
                })}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
                  mode === m.key
                    ? "border-accent bg-accent text-accent-foreground shadow-[0_0_20px_hsl(var(--accent)/0.25)]"
                    : "border-white/[0.08] bg-card/90 text-foreground hover:border-accent/40",
                )}
              >
                {m.label}
              </Link>
            ))}
          </div>

          <div className="mb-10 flex flex-wrap gap-2">
            {DISCOVER_CATEGORY_FILTERS.map((f) => {
              const active = f.slug ? catParam === f.slug : !catParam;
              const href = gamesListHref(basePath, {
                q,
                cat: f.slug,
                mode,
                page: 1,
              });
              return (
                <Link
                  key={f.label}
                  href={href}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "border-accent/80 bg-white/[0.08] text-foreground"
                      : "border-white/[0.06] bg-transparent text-muted-foreground hover:border-accent/30 hover:text-foreground",
                  )}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>

          <GameGrid games={cards} />

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {total === 0
                ? "Kayıt yok."
                : `${skip + 1}–${skip + rows.length} / ${total} oyun`}
            </p>
            {hasMore ? (
              <Button variant="outline" asChild>
                <Link
                  href={gamesListHref(basePath, {
                    q,
                    cat: catParam,
                    mode,
                    page: page + 1,
                  })}
                >
                  Daha fazla yükle
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
