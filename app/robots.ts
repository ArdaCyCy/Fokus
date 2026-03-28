import type { MetadataRoute } from "next";

import { getAppBaseUrl } from "@/lib/commerce/checkout-config";

export default function robots(): MetadataRoute.Robots {
  const base = getAppBaseUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard/", "/api/"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
