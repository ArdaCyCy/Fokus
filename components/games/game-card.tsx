import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

import type { GameCardData } from "@/lib/types/game-card";
import { formatTryFromCents } from "@/lib/format/currency";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { GameCardWishlistButton } from "@/components/games/game-card-wishlist";

function discountPercent(game: GameCardData): number | null {
  if (
    !game.originalPriceCents ||
    game.originalPriceCents <= game.priceCents
  ) {
    return null;
  }
  return Math.round(
    (1 - game.priceCents / game.originalPriceCents) * 100
  );
}

export function GameCard({ game }: { game: GameCardData }) {
  const off = discountPercent(game);

  return (
    <div className="group relative">
      <Link href={`/games/${game.slug}`} className="block">
        <Card className="h-full overflow-hidden rounded-xl border border-white/[0.06] bg-card/90 shadow-md shadow-black/30 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/45 hover:shadow-lg hover:shadow-[0_12px_40px_-12px_hsl(var(--accent)/0.25)]">
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={game.coverImageUrl}
              alt=""
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width:768px) 100vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
            <div className="absolute left-2 top-2 z-[2] flex flex-wrap gap-1">
              {game.isTurkishMade ? (
                <Badge variant="success" className="text-[10px]">
                  Türk Yapımı
                </Badge>
              ) : null}
              {off != null ? (
                <Badge variant="secondary" className="text-[10px]">
                  %{off} indirim
                </Badge>
              ) : null}
            </div>
          </div>
          <CardHeader className="space-y-1 pb-2">
            <h3 className="font-heading text-base font-semibold leading-tight text-foreground/95 transition-colors group-hover:text-accent">
              {game.title}
            </h3>
            <p className="text-xs text-muted-foreground">{game.developerName}</p>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-accent text-accent" aria-hidden />
                <span className="font-medium text-foreground">
                  {game.rating.toFixed(1)}
                </span>
                <span className="text-xs">/ 5</span>
              </div>
              {game.reviewCount > 0 ? (
                <span className="text-xs">({game.reviewCount} değerlendirme)</span>
              ) : null}
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap items-baseline gap-2 pt-0">
            <span
              className={
                off != null
                  ? "font-heading text-lg font-bold text-success"
                  : "font-heading text-lg font-bold text-foreground"
              }
            >
              {formatTryFromCents(game.priceCents)}
            </span>
            {game.originalPriceCents &&
            game.originalPriceCents > game.priceCents ? (
              <span className="text-sm line-through text-muted-foreground">
                {formatTryFromCents(game.originalPriceCents)}
              </span>
            ) : null}
          </CardFooter>
        </Card>
      </Link>
      <GameCardWishlistButton
        gameId={game.id}
        className="absolute right-3 top-3 z-10"
      />
    </div>
  );
}
