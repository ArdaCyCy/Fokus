import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import type { GameWithCategoriesAndReviews } from "@/lib/types/game";

const listInclude = {
  categories: { include: { category: true } },
  reviews: { select: { rating: true } },
} satisfies Prisma.GameInclude;

export type GameListRow = Prisma.GameGetPayload<{ include: typeof listInclude }>;
export type DiscoverMode = "new" | "popular" | "discounted";
export type SearchSort = "relevance" | "newest" | "price_asc" | "price_desc" | "top_rated";

export function averageRating(
  reviews: { rating: number }[]
): { rating: number; count: number } {
  if (reviews.length === 0) return { rating: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { rating: sum / reviews.length, count: reviews.length };
}

function buildWhere(
  search: string | undefined,
  categorySlug: string | null | undefined,
  mode: DiscoverMode,
  opts?: {
    minPriceCents?: number;
    maxPriceCents?: number;
    onlyDiscounted?: boolean;
    turkishOnly?: boolean;
  }
): Prisma.GameWhereInput {
  const q = search?.trim();
  const where: Prisma.GameWhereInput = { isPublished: true, status: "PUBLISHED" };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { developerName: { contains: q, mode: "insensitive" } },
    ];
  }

  if (categorySlug) {
    where.categories = {
      some: { category: { slug: categorySlug } },
    };
  }

  if (mode === "discounted") {
    where.originalPriceCents = { not: null };
  }

  if (opts?.onlyDiscounted) {
    where.originalPriceCents = { not: null };
  }
  if (typeof opts?.minPriceCents === "number" || typeof opts?.maxPriceCents === "number") {
    where.priceCents = {};
    if (typeof opts.minPriceCents === "number") where.priceCents.gte = opts.minPriceCents;
    if (typeof opts.maxPriceCents === "number") where.priceCents.lte = opts.maxPriceCents;
  }
  if (opts?.turkishOnly) where.isTurkishMade = true;

  return where;
}

export async function getPublishedGames(params: {
  search?: string;
  categorySlug?: string | null;
  mode?: DiscoverMode;
  sort?: SearchSort;
  minPriceCents?: number;
  maxPriceCents?: number;
  onlyDiscounted?: boolean;
  turkishOnly?: boolean;
  skip?: number;
  take?: number;
}): Promise<GameListRow[]> {
  const {
    search,
    categorySlug,
    mode = "new",
    sort = "newest",
    minPriceCents,
    maxPriceCents,
    onlyDiscounted,
    turkishOnly,
    skip = 0,
    take = 12,
  } = params;
  const orderBy: Prisma.GameOrderByWithRelationInput[] =
    mode === "popular" || sort === "top_rated"
      ? [{ reviews: { _count: "desc" } }, { releasedAt: "desc" }, { createdAt: "desc" }]
      : sort === "price_asc"
        ? [{ priceCents: "asc" }, { createdAt: "desc" }]
        : sort === "price_desc"
          ? [{ priceCents: "desc" }, { createdAt: "desc" }]
          : [{ releasedAt: "desc" }, { createdAt: "desc" }];

  return db.game.findMany({
    where: buildWhere(search, categorySlug, mode, {
      minPriceCents,
      maxPriceCents,
      onlyDiscounted,
      turkishOnly,
    }),
    include: listInclude,
    orderBy,
    skip,
    take,
  });
}

export async function countPublishedGames(params: {
  search?: string;
  categorySlug?: string | null;
  mode?: DiscoverMode;
  minPriceCents?: number;
  maxPriceCents?: number;
  onlyDiscounted?: boolean;
  turkishOnly?: boolean;
}): Promise<number> {
  const { mode = "new" } = params;
  return db.game.count({
    where: buildWhere(params.search, params.categorySlug, mode, {
      minPriceCents: params.minPriceCents,
      maxPriceCents: params.maxPriceCents,
      onlyDiscounted: params.onlyDiscounted,
      turkishOnly: params.turkishOnly,
    }),
  });
}

/** Yakında çıkacaklar (planlı tarih gelecekte). */
export async function getUpcomingPublishedGames(
  take = 12
): Promise<GameListRow[]> {
  return db.game.findMany({
    where: {
      isPublished: true,
      status: "PUBLISHED",
      scheduledReleaseAt: { gt: new Date() },
    },
    orderBy: { scheduledReleaseAt: "asc" },
    take,
    include: listInclude,
  });
}

/** Ücretsiz / demo adayları (fiyat 0 veya başlıkta demo). */
export async function getDemosPublishedGames(take = 8): Promise<GameListRow[]> {
  return db.game.findMany({
    where: {
      isPublished: true,
      status: "PUBLISHED",
      OR: [
        { priceCents: 0 },
        { title: { contains: "demo", mode: "insensitive" } },
      ],
    },
    include: listInclude,
    orderBy: { releasedAt: "desc" },
    take,
  });
}

/** Belirli bir aralıkta en çok inceleme alan yayımlanmış oyunlar (hafta / ay / yıl). */
export async function getPopularByReviewsSince(params: {
  since: Date;
  skip?: number;
  take?: number;
}): Promise<GameListRow[]> {
  const { since, skip = 0, take = 12 } = params;
  const grouped = await db.review.groupBy({
    by: ["gameId"],
    where: { createdAt: { gte: since } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    skip,
    take,
  });
  const ids = grouped.map((g) => g.gameId);
  if (ids.length === 0) return [];
  const games = await db.game.findMany({
    where: {
      id: { in: ids },
      isPublished: true,
      status: "PUBLISHED",
    },
    include: listInclude,
  });
  const order = new Map(ids.map((id, i) => [id, i] as const));
  return games.slice().sort((a, b) => {
    const ia = order.get(a.id) ?? 999;
    const ib = order.get(b.id) ?? 999;
    return ia - ib;
  });
}

/** Ana oyuna bağlı yayımlanmış DLC / eklentiler. */
export async function getPublishedDlcGames(
  take = 12,
  skip = 0
): Promise<GameListRow[]> {
  return db.game.findMany({
    where: {
      isPublished: true,
      status: "PUBLISHED",
      parentGameId: { not: null },
    },
    include: listInclude,
    orderBy: [{ releasedAt: "desc" }, { createdAt: "desc" }],
    skip,
    take,
  });
}

/** Verilen ana oyuna bağlı yayımlanmış DLC'ler. */
export async function getPublishedDlcsForParent(
  parentGameId: string,
  take = 12,
): Promise<GameListRow[]> {
  return db.game.findMany({
    where: {
      isPublished: true,
      status: "PUBLISHED",
      parentGameId,
    },
    include: listInclude,
    orderBy: [{ releasedAt: "desc" }, { createdAt: "desc" }],
    take,
  });
}

export async function getPublishedGameBySlug(
  slug: string
): Promise<GameWithCategoriesAndReviews | null> {
  return db.game.findFirst({
    where: { slug, isPublished: true, status: "PUBLISHED" },
    include: {
      categories: { include: { category: true } },
      parentGame: { select: { slug: true, title: true } },
      achievements: { orderBy: { title: "asc" } },
      reviews: {
        include: {
          user: { select: { username: true, imageUrl: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

/**
 * URL parçası tire içermeyen uzun bir id gibi görünüyorsa (ör. Prisma cuid),
 * önce slug ile eşleşme yoksa `id` ile yayımlanmış oyun aranır.
 */
export function isLikelyDatabaseGameId(param: string): boolean {
  if (param.length < 24 || param.length > 32) return false;
  if (param.includes("-")) return false;
  return /^[a-z][a-z0-9]+$/i.test(param);
}

/** Yayımlanmış oyunun kanonik slug'ı (ID ile gelen istekleri /games/[slug]'a yönlendirmek için). */
export async function getPublishedSlugByGameId(
  id: string
): Promise<string | null> {
  const row = await db.game.findFirst({
    where: { id, isPublished: true, status: "PUBLISHED" },
    select: { slug: true },
  });
  return row?.slug ?? null;
}

/** Metadata: slug veya id ile başlık/açıklama. */
export async function getPublishedGameMetaByParam(
  param: string
): Promise<{
  title: string;
  shortDescription: string | null;
  description: string | null;
} | null> {
  const bySlug = await db.game.findFirst({
    where: { slug: param, isPublished: true, status: "PUBLISHED" },
    select: { title: true, shortDescription: true, description: true },
  });
  if (bySlug) return bySlug;
  if (!isLikelyDatabaseGameId(param)) return null;
  return db.game.findFirst({
    where: { id: param, isPublished: true, status: "PUBLISHED" },
    select: { title: true, shortDescription: true, description: true },
  });
}
