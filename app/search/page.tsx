import Link from "next/link";

import { Button } from "@/components/ui/button";
import { GameGrid } from "@/components/games/game-grid";
import { DISCOVER_CATEGORY_FILTERS } from "@/lib/games/categories";
import { cn } from "@/lib/utils";
import {
  countPublishedGames,
  getPublishedGames,
  type DiscoverMode,
  type SearchSort,
} from "@/lib/data/games";
import { gameListRowToCardData } from "@/lib/mappers/game-card";

const PAGE_SIZE = 12;

function searchHref(opts: {
  q?: string;
  cat?: string | null;
  mode?: "new" | "popular" | "discounted";
  sort?: SearchSort;
  min?: string;
  max?: string;
  discounted?: boolean;
  turkish?: boolean;
  page?: number;
}) {
  const p = new URLSearchParams();
  if (opts.q?.trim()) p.set("q", opts.q.trim());
  if (opts.cat) p.set("cat", opts.cat);
  if (opts.mode && opts.mode !== "new") p.set("mode", opts.mode);
  if (opts.sort && opts.sort !== "newest") p.set("sort", opts.sort);
  if (opts.min?.trim()) p.set("min", opts.min.trim());
  if (opts.max?.trim()) p.set("max", opts.max.trim());
  if (opts.discounted) p.set("discounted", "1");
  if (opts.turkish) p.set("turkish", "1");
  if (opts.page && opts.page > 1) p.set("page", String(opts.page));
  const qs = p.toString();
  return qs ? `/search?${qs}` : "/search";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const pick = (k: string): string => {
    const v = sp[k];
    return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
  };
  const q = pick("q");
  const cat = pick("cat") || null;
  const modeRaw = pick("mode");
  const mode: DiscoverMode =
    modeRaw === "popular" || modeRaw === "discounted" ? modeRaw : "new";
  const sortParam = pick("sort");
  const sort: SearchSort =
    sortParam === "price_asc" ||
    sortParam === "price_desc" ||
    sortParam === "top_rated" ||
    sortParam === "relevance" ||
    sortParam === "newest"
      ? sortParam
      : "newest";
  const min = pick("min");
  const max = pick("max");
  const minPrice = Number.parseInt(min || "0", 10);
  const maxPrice = Number.parseInt(max || "0", 10);
  const discounted = pick("discounted") === "1";
  const turkish = pick("turkish") === "1";
  const page = Math.max(1, Number.parseInt(pick("page") || "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [rows, total] = await Promise.all([
    getPublishedGames({
      search: q,
      categorySlug: cat,
      mode,
      sort,
      minPriceCents: Number.isFinite(minPrice) && minPrice > 0 ? minPrice : 0,
      maxPriceCents: Number.isFinite(maxPrice) && maxPrice > 0 ? maxPrice : undefined,
      onlyDiscounted: discounted,
      turkishOnly: turkish,
      skip,
      take: PAGE_SIZE,
    }),
    countPublishedGames({
      search: q,
      categorySlug: cat,
      mode,
      minPriceCents: Number.isFinite(minPrice) && minPrice > 0 ? minPrice : 0,
      maxPriceCents: Number.isFinite(maxPrice) && maxPrice > 0 ? maxPrice : undefined,
      onlyDiscounted: discounted,
      turkishOnly: turkish,
    }),
  ]);
  const cards = rows.map(gameListRowToCardData);
  const hasMore = skip + rows.length < total;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Gelişmiş arama
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Oyunları isim, kategori, fiyat ve indirim durumuna göre süzebilirsin.
        </p>
      </div>

      <form action="/search" method="get" className="mb-6 grid gap-3 rounded-xl border border-border bg-card/60 p-4 md:grid-cols-6">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Oyun veya geliştirici ara…"
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm md:col-span-2"
        />
        <input
          type="number"
          name="min"
          min={0}
          step={100}
          defaultValue={min}
          placeholder="Min fiyat (kuruş)"
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
        />
        <input
          type="number"
          name="max"
          min={0}
          step={100}
          defaultValue={max}
          placeholder="Max fiyat (kuruş)"
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
        />
        <select
          name="sort"
          defaultValue={sort}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value="newest">En yeni</option>
          <option value="top_rated">En popüler</option>
          <option value="price_asc">Fiyat artan</option>
          <option value="price_desc">Fiyat azalan</option>
          <option value="relevance">İlgililik</option>
        </select>
        <Button type="submit" className="h-10">Filtrele</Button>

        {cat ? <input type="hidden" name="cat" value={cat} /> : null}
        {mode !== "new" ? <input type="hidden" name="mode" value={mode} /> : null}
      </form>

      <div className="mb-4 flex flex-wrap gap-2">
        {DISCOVER_CATEGORY_FILTERS.map((f) => {
          const active = f.slug ? cat === f.slug : !cat;
          return (
            <Link
              key={f.label}
              href={searchHref({ q, cat: f.slug, mode, sort, min, max, discounted, turkish, page: 1 })}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium",
                active ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card/80"
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href={searchHref({ q, cat, mode, sort, min, max, discounted: !discounted, turkish, page: 1 })}
          className={cn("rounded-full border px-4 py-2 text-sm", discounted ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card/80")}
        >
          Sadece indirimdekiler
        </Link>
        <Link
          href={searchHref({ q, cat, mode, sort, min, max, discounted, turkish: !turkish, page: 1 })}
          className={cn("rounded-full border px-4 py-2 text-sm", turkish ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card/80")}
        >
          Sadece Türkiye yapımı
        </Link>
      </div>

      <GameGrid games={cards} />

      <div className="mt-10 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total === 0 ? "Sonuç bulunamadı." : `${skip + 1}–${skip + rows.length} / ${total} oyun`}
        </p>
        {hasMore ? (
          <Button variant="outline" asChild>
            <Link href={searchHref({ q, cat, mode, sort, min, max, discounted, turkish, page: page + 1 })}>
              Daha fazla yükle
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
