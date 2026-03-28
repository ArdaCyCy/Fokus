/** Kapak yoksa veya görsel yüklenemezse kullanılan varsayılan mağaza görseli (donanım / konsol fotoğrafı değil). */
export const FALLBACK_GAME_COVER =
  "https://images.unsplash.com/photo-1509223197845-458d87318791?w=1200&q=80";

export function fallbackCoverWithWidth(w: number, q = 80): string {
  return `https://images.unsplash.com/photo-1509223197845-458d87318791?w=${w}&q=${q}`;
}
