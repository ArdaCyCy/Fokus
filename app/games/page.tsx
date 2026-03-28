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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

function gamesListHref(opts: {
  q?: string;
  cat: string | null;
  mode: DiscoverMode;
  page?: number;
}) {
  const p = new URLSearchParams();
  if (opts.q?.trim()) p.set("q", opts.q.trim());
  if (opts.cat) p.set("cat", opts.cat);
  if (opts.mode !== "new") p.set("mode", opts.mode);
  if (opts.page && opts.page > 1) p.set("page", String(opts.page));
  const qs = p.toString();
  return qs.length ? `/games?${qs}` : "/games";
}

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; page?: string; mode?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const catParam = sp.cat?.trim() || null;
  const mode: DiscoverMode =
    sp.mode === "popular" || sp.mode === "discounted" ? sp.mode : "new";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [rows, total] = await Promise.all([
    getPublishedGames({
      search: q,
      categorySlug: catParam,
      mode,
      skip,
      take: PAGE_SIZE,
    }),
    countPublishedGames({ search: q, categorySlug: catParam, mode }),
  ]);

  const cards = rows.map(gameListRowToCardData);
  const hasMore = skip + rows.length < total;

  return (
    <div className="min-h-screen pb-16 pt-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 rounded-xl border border-white/[0.06] bg-gradient-to-br from-card via-card/90 to-background p-6 shadow-lg shadow-black/25 md:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Dijital mağaza
              </p>
              <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Mağaza
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Yayımlanmış indie oyunları keşfet; kategori ve sıralama ile süz.
                İstek listeni üst menüdeki kalp simgesinden aç. Gelişmiş arama
                için{" "}
                <Link
                  href="/search"
                  className="text-accent underline-offset-4 hover:underline"
                >
                  arama sayfasına
                </Link>{" "}
                geç.
              </p>
            </div>
            <form
              action="/games"
              method="get"
              className="w-full shrink-0 lg:max-w-md xl:max-w-lg"
            >
              {catParam ? (
                <input type="hidden" name="cat" value={catParam} />
              ) : null}
              {mode !== "new" ? (
                <input type="hidden" name="mode" value={mode} />
              ) : null}
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Mağazada ara
              </p>
              <div className="flex w-full min-w-0 flex-row gap-2">
                <input
                  type="search"
                  name="q"
                  defaultValue={q}
                  placeholder="Oyun veya geliştirici ara…"
                  className="h-11 min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-background/80 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-label="Mağazada ara"
                />
                <Button type="submit" className="h-11 shrink-0 px-5">
                  Ara
                </Button>
              </div>
            </form>
          </div>
        </div>

        <StoreBrowseSections />

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
              href={gamesListHref({ q, cat: catParam, mode: m.key, page: 1 })}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
                mode === m.key
                  ? "border-accent bg-accent text-accent-foreground shadow-[0_0_20px_hsl(var(--accent)/0.25)]"
                  : "border-white/[0.08] bg-card/90 text-foreground hover:border-accent/40"
              )}
            >
              {m.label}
            </Link>
          ))}
        </div>

        <div className="mb-10 flex flex-wrap gap-2">
          {DISCOVER_CATEGORY_FILTERS.map((f) => {
            const active = f.slug ? catParam === f.slug : !catParam;
            const href = gamesListHref({
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
                    : "border-white/[0.06] bg-transparent text-muted-foreground hover:border-accent/30 hover:text-foreground"
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
                href={gamesListHref({
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
  );
}
