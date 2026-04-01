/** Kapak yoksa veya görsel yüklenemezse — picsum (Unsplash sık 404). */
export const FALLBACK_GAME_COVER =
  "https://picsum.photos/seed/fokus-default-cover/1200/675";

export function fallbackCoverWithWidth(w: number): string {
  const h = Math.max(1, Math.round((w * 9) / 16));
  return `https://picsum.photos/seed/fokus-fallback-${w}/${w}/${h}`;
}
