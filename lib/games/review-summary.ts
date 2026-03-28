/** Yıldız ortalamasına göre Steam benzeri özet metin. */
export type ReviewSentiment = "very_positive" | "positive" | "mixed" | "negative" | "none";

export function reviewSentiment(
  avgRating: number,
  count: number
): { sentiment: ReviewSentiment; label: string } {
  if (count === 0) return { sentiment: "none", label: "İnceleme yok" };
  const a = avgRating;
  if (a >= 4.5 && count >= 10)
    return { sentiment: "very_positive", label: "Çok olumlu" };
  if (a >= 4.2 && count >= 5)
    return { sentiment: "very_positive", label: "Çok olumlu" };
  if (a >= 4) return { sentiment: "positive", label: "Olumlu" };
  if (a >= 3) return { sentiment: "mixed", label: "Karışık" };
  return { sentiment: "negative", label: "Olumsuz" };
}

/** 1–5 yıldız dağılımı (Steam çubuğu için). */
export function starHistogram(reviews: { rating: number }[]): number[] {
  const buckets = [0, 0, 0, 0, 0];
  for (const r of reviews) {
    const rounded = Math.min(5, Math.max(1, Math.round(Number(r.rating))));
    buckets[rounded - 1] += 1;
  }
  return buckets;
}
