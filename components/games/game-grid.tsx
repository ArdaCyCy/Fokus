"use client";

import type { GameCardData } from "@/lib/types/game-card";
import { GameCard } from "@/components/games/game-card";

export function GameGrid({ games }: { games: GameCardData[] }) {
  if (games.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/[0.1] bg-card/50 px-6 py-14 text-center text-sm leading-relaxed text-muted-foreground">
        Bu filtreye uygun yayımlanmış oyun bulunamadı. Farklı bir kategori veya
        arama terimi dene.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">
      {games.map((g) => (
        <GameCard key={g.slug} game={g} />
      ))}
    </div>
  );
}
