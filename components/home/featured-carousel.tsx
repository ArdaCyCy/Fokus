"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import type { GameCardData } from "@/lib/types/game-card";

export function FeaturedCarousel({ games }: { games: GameCardData[] }) {
  const items = games.length ? [...games, ...games] : [];

  if (games.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/[0.1] bg-card/40 px-4 py-10 text-center text-sm text-muted-foreground">
        Henüz vitrin için yayımlanmış oyun yok.{" "}
        <Link href="/games" className="text-accent underline-offset-4 hover:underline">
          Mağazaya göz at
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="relative isolate -mx-4 max-w-full overflow-hidden md:mx-0">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background via-background/80 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background via-background/80 to-transparent" />
      <div className="flex w-max gap-4 py-2 animate-carousel hover:[animation-play-state:paused]">
        {items.map((game, i) => (
          <motion.div
            key={`${game.id}-${i}`}
            whileHover={{ y: -4, transition: { duration: 0.22 } }}
            className="shrink-0"
          >
            <Link
              href={`/games/${game.slug}`}
              className="pointer-events-auto relative block h-44 w-72 max-h-52 max-w-[min(100%,24rem)] shrink-0 overflow-hidden rounded-xl border border-white/[0.07] bg-card shadow-lg shadow-black/40 transition-colors hover:border-accent/40 md:h-52 md:w-96 md:max-h-none md:max-w-none"
            >
              <Image
                src={game.coverImageUrl}
                alt=""
                fill
                sizes="(max-width:768px) min(288px,100vw), 384px"
                className="object-cover opacity-[0.92] transition duration-300 hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="font-heading text-lg font-semibold text-foreground drop-shadow-md">
                  {game.title}
                </p>
                <p className="text-xs text-muted-foreground">{game.developerName}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
