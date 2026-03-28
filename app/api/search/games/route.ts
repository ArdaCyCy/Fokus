import { NextRequest } from "next/server";

import {
  countPublishedGames,
  getPublishedGames,
  type DiscoverMode,
  type SearchSort,
} from "@/lib/data/games";
import { gameListRowToCardData } from "@/lib/mappers/game-card";
import { enforceApiRateLimit } from "@/lib/api-rate-limit";
import { auditLog, getOrCreateRequestId, jsonWithRequestId } from "@/lib/api-observability";

function toInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const limited = await enforceApiRateLimit(req, {
    key: "search-games",
    limit: 60,
    window: "1 m",
  });
  if (limited) {
    limited.headers.set("X-Request-Id", requestId);
    return limited;
  }

  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim() ?? "";
  const cat = sp.get("cat")?.trim() || null;
  const modeRaw = sp.get("mode");
  const mode: DiscoverMode =
    modeRaw === "popular" || modeRaw === "discounted" ? modeRaw : "new";
  const sortParam = sp.get("sort");
  const sort: SearchSort =
    sortParam === "price_asc" ||
    sortParam === "price_desc" ||
    sortParam === "top_rated" ||
    sortParam === "newest" ||
    sortParam === "relevance"
      ? sortParam
      : "newest";

  const minPrice = Math.max(0, toInt(sp.get("min"), 0));
  const maxPriceRaw = toInt(sp.get("max"), 0);
  const maxPrice = maxPriceRaw > 0 ? maxPriceRaw : undefined;
  const onlyDiscounted = sp.get("discounted") === "1";
  const turkishOnly = sp.get("turkish") === "1";
  const page = Math.max(1, toInt(sp.get("page"), 1));
  const take = Math.min(24, Math.max(1, toInt(sp.get("take"), 12)));
  const skip = (page - 1) * take;

  const [rows, total] = await Promise.all([
    getPublishedGames({
      search: q,
      categorySlug: cat,
      mode,
      sort,
      minPriceCents: minPrice,
      maxPriceCents: maxPrice,
      onlyDiscounted,
      turkishOnly,
      skip,
      take,
    }),
    countPublishedGames({
      search: q,
      categorySlug: cat,
      mode,
      minPriceCents: minPrice,
      maxPriceCents: maxPrice,
      onlyDiscounted,
      turkishOnly,
    }),
  ]);

  auditLog("info", "search.games.success", {
    requestId,
    q,
    category: cat,
    mode,
    sort,
    page,
    take,
    results: rows.length,
    total,
  });
  return jsonWithRequestId(
    {
      page,
      take,
      total,
      hasMore: skip + rows.length < total,
      items: rows.map(gameListRowToCardData),
    },
    undefined,
    requestId
  );
}
