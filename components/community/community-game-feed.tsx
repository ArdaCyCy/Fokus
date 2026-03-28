"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { GameCard } from "@/components/games/game-card";
import type { GameCardData } from "@/lib/types/game-card";

export function CommunityGameFeed({
  initialGames,
  initialSkip,
  mode = "popular",
}: {
  initialGames: GameCardData[];
  initialSkip: number;
  mode?: "popular" | "new";
}) {
  const [games, setGames] = useState(initialGames);
  const [skip, setSkip] = useState(initialSkip);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialGames.length >= 12);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/community/discover?skip=${skip}&take=12&mode=${mode}`,
      );
      if (!res.ok) return;
      const data: {
        games: GameCardData[];
        nextSkip: number;
        hasMore: boolean;
      } = await res.json();
      setGames((prev) => {
        const seen = new Set(prev.map((g) => g.id));
        const merged = [...prev];
        for (const g of data.games) {
          if (!seen.has(g.id)) {
            seen.add(g.id);
            merged.push(g);
          }
        }
        return merged;
      });
      setSkip(data.nextSkip);
      setHasMore(data.hasMore);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, skip, mode]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "240px", threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  if (games.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/[0.1] bg-card/50 px-6 py-14 text-center text-sm text-muted-foreground">
        Önerilecek oyun bulunamadı.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">
        {games.map((g) => (
          <GameCard key={g.slug} game={g} />
        ))}
      </div>
      <div ref={sentinelRef} className="h-4 w-full" aria-hidden />
      {loading ? (
        <p className="text-center text-xs text-muted-foreground">
          Daha fazla yükleniyor…
        </p>
      ) : null}
      {!hasMore && games.length > 0 ? (
        <p className="text-center text-xs text-muted-foreground">
          Tüm öneriler gösterildi. Mağazada daha fazlasını keşfedebilirsin.
        </p>
      ) : null}
    </div>
  );
}
