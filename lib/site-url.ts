/**
 * Ortak kök URL: NEXT_PUBLIC_APP_URL → Vercel deployment → yerel.
 * Sitemap, metadata, e-posta bağlantıları ve İyzico dönüşleri için tutarlı taban.
 */
export function getPublicSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw && /^https?:\/\//i.test(raw)) {
    try {
      const u = new URL(raw);
      if (u.hostname) return u.toString().replace(/\/$/, "");
    } catch {
      /* aşağıya düş */
    }
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//i, "").split("/")[0]?.toLowerCase();
    if (host && host !== "localhost" && !host.startsWith("127.")) {
      return `https://${host}`.replace(/\/$/, "");
    }
  }

  return "http://localhost:3000";
}
