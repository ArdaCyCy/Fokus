"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { FeaturedCarousel } from "@/components/home/featured-carousel";
import { GameCard } from "@/components/games/game-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GameCardData } from "@/lib/types/game-card";

const DEFAULT_CATEGORY = "Tümü";

export function HomePage({
  games,
  featured,
  newReleases,
  recommended,
  categories,
  seasonalBanner,
}: {
  games: GameCardData[];
  featured: GameCardData[];
  newReleases: GameCardData[];
  recommended: GameCardData[];
  categories: string[];
  seasonalBanner?: string | null;
}) {
  const categoryFilters = [DEFAULT_CATEGORY, ...categories];
  const highlights = featured;
  const [activeCategory, setActiveCategory] = useState<string>(DEFAULT_CATEGORY);

  const filtered =
    activeCategory === DEFAULT_CATEGORY
      ? games
      : games.filter((g) => (g.categoryNames ?? []).includes(activeCategory));

  return (
    <>
      {/*
        Hero: animasyonsuz — yalnızca görünürlük için (opacity:0 + whileInView riski yok).
      */}
      <section
        id="kesfet"
        className="border-b border-white/[0.06] bg-gradient-to-b from-card/90 to-background px-4 py-20 md:py-28"
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
            <Button asChild size="lg">
              <Link href="/games">Mağazaya git</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">Geliştirici ol</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-shell py-14">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold">Öne çıkanlar</h2>
            <p className="text-sm text-muted-foreground">
              Vitrinde öne çıkan indie yapımlar — kaydırarak keşfet.
            </p>
          </div>
        </div>
        <FeaturedCarousel games={featured} />
      </section>

      <section className="border-y border-white/[0.06] bg-muted/30 py-10">
        <div className="container-shell">
          <p className="mb-4 text-sm font-medium text-muted-foreground">
            Kategoriler
          </p>
          <div className="flex flex-wrap gap-2">
            {categoryFilters.map((cat) => (
              <motion.button
                key={cat}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  activeCategory === cat
                    ? "border-accent bg-accent text-accent-foreground shadow-[0_0_20px_hsl(var(--accent)/0.25)]"
                    : "border-border bg-background/60 text-foreground hover:border-accent/40 hover:bg-muted/40"
                )}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {recommended.length > 0 ? (
        <section className="container-shell py-14">
          <h2 className="font-heading text-2xl font-bold">Sizin için</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Popülerlik ve kategori çeşitliliğiyle harmanlanmış öneriler.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recommended.map((g) => (
              <GameCard key={`rec-${g.id}`} game={g} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="container-shell py-14">
        <h2 className="font-heading text-2xl font-bold">Yeni çıkanlar</h2>
        <p className="mt-1 text-sm text-muted-foreground">Son eklenen yapımlar.</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {newReleases.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      </section>

      <section className="container-shell py-14">
        <h2 className="font-heading text-2xl font-bold">Editör seçimleri</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Öne çıkan vitrin ve editör listesi.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((g) => (
            <GameCard key={`h-${g.id}`} game={g} />
          ))}
        </div>
      </section>

      <section className="container-shell py-14" id="kesfet-grid">
        <h2 className="font-heading text-2xl font-bold">
          {activeCategory === DEFAULT_CATEGORY
            ? "Tüm oyunlar"
            : `${activeCategory} oyunları`}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Seçtiğin kategoriye göre filtrelenmiş liste.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => (
            <GameCard key={`f-${g.id}`} game={g} />
          ))}
        </div>
      </section>

      <section
        id="gelistiriciler"
        className="mx-4 mb-16 rounded-xl border border-white/[0.08] bg-gradient-to-br from-card/90 to-background px-6 py-12 shadow-xl shadow-black/30 md:mx-auto md:max-w-6xl"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-2xl font-bold md:text-3xl">
            Geliştirici ol
          </h2>
          <p className="mt-3 text-muted-foreground">
            Oyununu Fokus&apos;a taşı; Türkiye ve dünyadan oyunculara ulaş.
            Geliştirici panelinde oyununu oluşturup yönetici onayına
            gönderebilirsin.
          </p>
          <Button asChild className="mt-8" size="lg">
            <Link href="/dashboard">Panele git</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
