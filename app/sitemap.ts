import type { MetadataRoute } from "next";

import { getAppBaseUrl } from "@/lib/commerce/checkout-config";
import { db } from "@/lib/db";
import { LEGAL_PAGES } from "@/lib/legal/pages";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getAppBaseUrl();
  const now = new Date();

  const staticPaths = [
    "",
    "/games",
    "/search",
    "/community",
    "/community/market",
    "/support",
    "/news",
    "/cart",
    "/library",
    "/wishlist",
    "/wallet",
    "/about",
  ];

  let slugEntries: MetadataRoute.Sitemap = [];
  try {
    const slugs = await db.game.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });
    slugEntries = slugs.map((g) => ({
      url: `${base}/games/${g.slug}`,
      lastModified: g.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    /* Derleme / CI’da veritabanı yoksa yalnızca statik URL’ler */
  }

  const entries: MetadataRoute.Sitemap = [
    ...staticPaths.map((path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...slugEntries,
    ...LEGAL_PAGES.map((p) => ({
      url: `${base}/about/${p.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
  ];

  return entries;
}
