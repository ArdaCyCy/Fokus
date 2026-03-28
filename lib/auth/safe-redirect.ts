/** Giriş sonrası açık yönlendirme: yalnızca aynı site içi path. */
export function safeAuthRedirectUrl(
  raw: string | null | undefined,
  fallback = "/games"
): string {
  if (!raw || typeof raw !== "string") return fallback;
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return fallback;
  return t;
}
