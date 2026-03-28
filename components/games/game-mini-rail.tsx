import Image from "next/image";
import Link from "next/link";

import type { GameCardData } from "@/lib/types/game-card";
import { fallbackCoverWithWidth } from "@/lib/constants/covers";
import { ChevronRight } from "lucide-react";

export function GameMiniRail({
  title,
  subtitle,
  games,
  seeAllHref,
}: {
  title: string;
  subtitle?: string;
  games: GameCardData[];
  seeAllHref?: string;
}) {
  if (games.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground md:text-xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {seeAllHref ? (
          <Link
            href={seeAllHref}
            className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
          >
            Tümünü gör
            <ChevronRight className="size-3.5" />
          </Link>
        ) : null}
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-thin [scrollbar-color:hsl(var(--muted))_transparent] md:mx-0 md:px-0">
        {games.map((g) => (
          <Link
            key={g.id}
            href={`/games/${g.slug}`}
            className="group shrink-0 w-[140px] md:w-[160px]"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-white/[0.08] bg-card shadow-md transition group-hover:border-accent/50 group-hover:shadow-lg group-hover:shadow-accent/10">
              <Image
                src={g.coverImageUrl ?? fallbackCoverWithWidth(400)}
                alt=""
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
                sizes="160px"
              />
            </div>
            <p className="mt-2 line-clamp-2 text-xs font-medium leading-snug text-foreground group-hover:text-accent">
              {g.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
