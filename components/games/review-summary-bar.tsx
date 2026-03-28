import { Star } from "lucide-react";

import { starHistogram, reviewSentiment } from "@/lib/games/review-summary";
import { cn } from "@/lib/utils";

export function ReviewSummaryBar({
  reviews,
  avgRating,
}: {
  reviews: { rating: number }[];
  avgRating: number;
}) {
  const count = reviews.length;
  const { sentiment, label } = reviewSentiment(avgRating, count);
  const hist = starHistogram(reviews);
  const order = [4, 3, 2, 1, 0] as const;

  if (count === 0) {
    return (
      <div className="rounded-lg border border-white/[0.06] bg-card px-4 py-3 text-sm text-muted-foreground">
        Henüz oyuncu incelemesi yok.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/[0.07] bg-card/95 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Genel incelemeler
          </p>
          <p
            className={cn(
              "font-heading text-lg font-bold",
              sentiment === "very_positive" || sentiment === "positive"
                ? "text-emerald-400"
                : sentiment === "mixed"
                  ? "text-amber-400"
                  : sentiment === "negative"
                    ? "text-red-400"
                    : "text-foreground"
            )}
          >
            {label}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Star className="size-5 fill-accent text-accent" aria-hidden />
          <span className="font-semibold text-foreground">
            {avgRating.toFixed(1)}
          </span>
          <span className="text-muted-foreground">
            / 5 · {count} inceleme
          </span>
        </div>
      </div>

      <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-black/50 ring-1 ring-white/[0.06]">
        {order.map((idx) => {
          const n = hist[idx];
          const pct = count > 0 ? (n / count) * 100 : 0;
          const tone =
            idx >= 3
              ? "bg-emerald-500"
              : idx === 2
                ? "bg-amber-500"
                : "bg-red-600";
          if (pct === 0) return null;
          return (
            <div
              key={idx}
              className={cn("h-full min-w-px", tone)}
              style={{ width: `${pct}%` }}
              title={`${idx + 1} yıldız · ${n} inceleme`}
            />
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Çubuk: 5★ (sol) → 1★ (sağ), genişlik oy sayısıyla orantılı.
      </p>
    </div>
  );
}
