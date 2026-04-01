import Link from "next/link";

import type { DiscoverMode } from "@/lib/data/games";
import { Button } from "@/components/ui/button";

/**
 * Mağaza vitrin başlığı + arama (eski ana sayfa metni burada; ayrı “landing” yok).
 */
export function StoreHero({
  seasonalBanner,
  basePath,
  searchDefaults,
}: {
  seasonalBanner: string | null;
  basePath: "/" | "/games";
  searchDefaults: {
    q: string;
    catParam: string | null;
    mode: DiscoverMode;
  };
}) {
  const { q, catParam, mode } = searchDefaults;

  return (
    <section
      id="kesfet"
      className="border-b border-white/[0.06] bg-gradient-to-b from-card/90 to-background px-4 py-16 md:py-20"
    >
      <div className="container-shell text-center">
        {seasonalBanner ? (
          <p className="mb-4 inline-block rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
            {seasonalBanner}
          </p>
        ) : null}
        <p className="mb-3 bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--success))] bg-clip-text text-sm font-semibold uppercase text-transparent">
          Fokus Mağazası
        </p>
        <h1 className="mx-auto max-w-3xl font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Türkiye&apos;nin indie oyunları burada
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Yerli yapımları keşfet, geliştiricileri destekle. Fokus mağazası,
          kütüphane, topluluk ve cüzdan akışıyla birlikte çalışır.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" variant="outline">
            <Link href="/news">Haberler</Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/dashboard">Geliştirici ol</Link>
          </Button>
        </div>

        <div className="mx-auto mt-12 max-w-2xl text-left">
          <form action={basePath} method="get" className="w-full">
            {catParam ? (
              <input type="hidden" name="cat" value={catParam} />
            ) : null}
            {mode !== "new" ? (
              <input type="hidden" name="mode" value={mode} />
            ) : null}
            <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Gelişmiş arama için{" "}
            <Link
              href="/search"
              className="text-accent underline-offset-4 hover:underline"
            >
              arama sayfasına
            </Link>{" "}
            geç.
          </p>
        </div>
      </div>
    </section>
  );
}
