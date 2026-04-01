import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PurchaseStatus } from "@prisma/client";
import { Apple, Eye, Monitor, Star, Terminal } from "lucide-react";

import {
  getPublishedDlcsForParent,
  getPublishedGameBySlug,
  averageRating,
} from "@/lib/data/games";
import { getSimilarPublishedGames } from "@/lib/recommendations";
import { getOptionalAppUser } from "@/lib/auth/app-user";
import { db } from "@/lib/db";
import { formatTryFromCents } from "@/lib/format/currency";
import type {
  GamePlatforms,
  GameSystemRequirements,
} from "@/lib/types/game";
import { specLabelTr } from "@/lib/games/spec-labels";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GameDescriptionMarkdown } from "@/components/games/game-description-markdown";
import { GameDetailPurchase } from "@/components/games/game-detail-purchase";
import { GameMediaViewer } from "@/components/games/game-media-viewer";
import { GameCard } from "@/components/games/game-card";
import { CompatibilityBadges } from "@/components/games/compatibility-badges";
import { ReviewFeedback } from "@/components/games/review-feedback";
import { ReviewSummaryBar } from "@/components/games/review-summary-bar";
import { ReviewComposer } from "@/components/games/review-composer";
import { resolveCheckoutProvider } from "@/lib/commerce/checkout-config";
import { fallbackCoverWithWidth } from "@/lib/constants/covers";
import { gameListRowToCardData } from "@/lib/mappers/game-card";
import { cn } from "@/lib/utils";

function asPlatforms(v: unknown): GamePlatforms {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const o = v as Record<string, unknown>;
  const deck = o.steamDeck;
  return {
    windows: Boolean(o.windows),
    mac: Boolean(o.mac),
    linux: Boolean(o.linux),
    fullController: Boolean(o.fullController),
    steamDeck:
      deck === "verified" || deck === "playable" || deck === "unsupported"
        ? deck
        : undefined,
  };
}

function asSystemRequirements(
  v: unknown
): GameSystemRequirements | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const min = o.minimum;
  const rec = o.recommended;
  if (!min || !rec || typeof min !== "object" || typeof rec !== "object")
    return null;
  return {
    minimum: min as Record<string, string>,
    recommended: rec as Record<string, string>,
  };
}

function discountPercent(priceCents: number, originalCents?: number | null) {
  if (
    originalCents == null ||
    originalCents <= priceCents
  ) {
    return null;
  }
  return Math.round((1 - priceCents / originalCents) * 100);
}

function PlatformRow({ platforms }: { platforms: GamePlatforms }) {
  const items = [
    { key: "windows" as const, label: "Windows", Icon: Monitor },
    { key: "mac" as const, label: "macOS", Icon: Apple },
    { key: "linux" as const, label: "Linux", Icon: Terminal },
  ].filter((x) => platforms[x.key]);

  if (items.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">Platform bilgisi yok.</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
      {items.map(({ label, Icon }) => (
        <span key={label} className="flex items-center gap-1.5">
          <Icon className="size-4 shrink-0 text-foreground" aria-hidden />
          {label}
        </span>
      ))}
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = await getPublishedGameBySlug(slug);
  if (!game) return { title: "Oyun bulunamadı" };
  return {
    title: `${game.title} · Fokus`,
    description: game.shortDescription ?? game.description ?? undefined,
  };
}

export default async function GameDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ r?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const reviewSortRaw = sp.r;
  const reviewSort =
    reviewSortRaw === "helpful" || reviewSortRaw === "rating"
      ? reviewSortRaw
      : "newest";

  const game = await getPublishedGameBySlug(slug);
  if (!game) notFound();

  void db.game
    .update({
      where: { id: game.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {});

  const displayViews = game.viewCount + 1;

  const viewer = await getOptionalAppUser();
  let owned = false;
  let myReview: {
    rating: number;
    title: string | null;
    content: string | null;
  } | null = null;
  if (viewer) {
    const [pur, rev] = await Promise.all([
      db.purchase.findFirst({
        where: {
          userId: viewer.id,
          gameId: game.id,
          status: PurchaseStatus.PAID,
        },
        select: { id: true },
      }),
      db.review.findUnique({
        where: {
          userId_gameId: { userId: viewer.id, gameId: game.id },
        },
        select: { rating: true, title: true, content: true },
      }),
    ]);
    owned = Boolean(pur);
    myReview = rev;
  }

  const categoryIds = game.categories.map((c) => c.category.id);
  const reviewUserIds = [...new Set(game.reviews.map((r) => r.userId))];
  const reviewIds = game.reviews.map((r) => r.id);
  const [similarRows, dlcRows, verifiedPurchases, helpfulVotes] =
    await Promise.all([
    getSimilarPublishedGames({ gameId: game.id, categoryIds, take: 6 }),
    !game.parentGameId
      ? getPublishedDlcsForParent(game.id, 8)
      : Promise.resolve([]),
    reviewUserIds.length > 0
      ? db.purchase.findMany({
          where: {
            gameId: game.id,
            status: PurchaseStatus.PAID,
            userId: { in: reviewUserIds },
          },
          select: { userId: true },
        })
      : Promise.resolve([]),
    reviewIds.length > 0
      ? db.reviewHelpfulVote.findMany({
          where: { reviewId: { in: reviewIds } },
          select: { reviewId: true, helpful: true },
        })
      : Promise.resolve([]),
  ]);
  const verifiedReviewerIds = new Set(verifiedPurchases.map((p) => p.userId));
  const helpfulCounts = new Map<string, { yes: number; no: number }>();
  for (const id of reviewIds) helpfulCounts.set(id, { yes: 0, no: 0 });
  for (const v of helpfulVotes) {
    const row = helpfulCounts.get(v.reviewId);
    if (!row) continue;
    if (v.helpful) row.yes += 1;
    else row.no += 1;
  }

  const sortedReviews = [...game.reviews].sort((a, b) => {
    if (reviewSort === "helpful") {
      const ya = helpfulCounts.get(a.id)?.yes ?? 0;
      const yb = helpfulCounts.get(b.id)?.yes ?? 0;
      if (yb !== ya) return yb - ya;
      return b.createdAt.getTime() - a.createdAt.getTime();
    }
    if (reviewSort === "rating") {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.createdAt.getTime() - a.createdAt.getTime();
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const similarCards = similarRows.map(gameListRowToCardData);
  const dlcCards = dlcRows.map(gameListRowToCardData);

  const channelLabel =
    game.releaseChannel === "BETA"
      ? "Beta"
      : game.releaseChannel === "ALPHA"
        ? "Alfa"
        : "Stable";

  const platforms = asPlatforms(game.platforms);
  const sys = asSystemRequirements(game.systemRequirements);
  const cover =
    game.coverImageUrl ?? fallbackCoverWithWidth(1600);
  const allMedia = Array.from(
    new Set(
      [cover, ...(game.screenshotUrls ?? [])].filter(
        (u): u is string => typeof u === "string" && u.trim().length > 0
      )
    )
  );

  const { rating, count } = averageRating(game.reviews);
  const ratingDisplay = count > 0 ? Math.round(rating * 10) / 10 : null;

  const md =
    game.descriptionMd?.trim() ||
    game.shortDescription ||
    game.description ||
    "_Henüz açıklama eklenmedi._";

  const devSearchHref = `/?q=${encodeURIComponent(game.developerName)}`;
  const primaryCat = game.categories[0]?.category;

  const specKeys =
    sys != null
      ? [...new Set([...Object.keys(sys.minimum), ...Object.keys(sys.recommended)])]
      : [];

  const released = game.releasedAt
    ? new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(game.releasedAt)
    : "Belirtilmedi";

  const offPct = discountPercent(
    game.priceCents,
    game.originalPriceCents ?? undefined
  );
  const checkoutProvider = resolveCheckoutProvider();

  return (
    <div className="min-h-screen bg-background pb-20 pt-6">
      <div className="mx-auto max-w-6xl px-4">
        <nav className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <Link
            href="/"
            className="text-accent transition hover:underline"
          >
            Mağaza
          </Link>
          {primaryCat ? (
            <>
              <span aria-hidden>/</span>
              <Link
                href={`/?cat=${encodeURIComponent(primaryCat.slug)}`}
                className="transition hover:text-foreground hover:underline"
              >
                {primaryCat.name}
              </Link>
            </>
          ) : null}
          <span aria-hidden>/</span>
          <span className="font-medium text-foreground">{game.title}</span>
        </nav>

        <header className="mb-8 overflow-hidden rounded-xl border border-white/[0.07] bg-gradient-to-b from-card via-card/90 to-background shadow-xl shadow-black/30">
          <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:gap-6">
            <div className="relative mx-auto size-28 shrink-0 overflow-hidden rounded-md border border-white/10 shadow-lg md:mx-0 md:size-36">
              <Image
                src={cover}
                alt=""
                fill
                className="object-cover"
                sizes="144px"
                priority
              />
            </div>
            <div className="min-w-0 flex-1 text-center md:text-left">
              <h1 className="font-heading text-2xl font-bold leading-tight text-foreground md:text-3xl">
                {game.title}
              </h1>
              {game.parentGame ? (
                <p className="mt-1 text-xs text-muted-foreground md:text-left">
                  Bu içerik bir DLC / eklentidir. Ana oyun:{" "}
                  <Link
                    href={`/games/${game.parentGame.slug}`}
                    className="font-medium text-accent hover:underline"
                  >
                    {game.parentGame.title}
                  </Link>
                </p>
              ) : null}
              {game.shortDescription ? (
                <p className="mt-2 text-sm text-muted-foreground md:max-w-2xl">
                  {game.shortDescription}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                {game.isTurkishMade ? (
                  <Badge variant="success" className="text-[11px]">
                    Türk yapımı
                  </Badge>
                ) : null}
                <Badge variant="outline" className="text-[11px]">
                  {channelLabel}
                </Badge>
                {offPct != null ? (
                  <Badge className="bg-[hsl(88_54%_38%)] text-[11px] font-semibold text-[hsl(222_22%_10%)]">
                    %{offPct} indirim
                  </Badge>
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground md:justify-start">
                <span className="flex items-center gap-1.5">
                  <Eye className="size-3.5" aria-hidden />
                  {displayViews.toLocaleString("tr-TR")} görüntüleme
                </span>
                {ratingDisplay != null ? (
                  <span className="flex items-center gap-1.5">
                    <Star className="size-3.5 fill-accent text-accent" />
                    {ratingDisplay.toFixed(1)} · {count} inceleme
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="space-y-10 lg:col-span-3">
            <GameMediaViewer urls={allMedia} gameTitle={game.title} />

            <ReviewSummaryBar reviews={game.reviews} avgRating={rating} />

            <section className="space-y-4">
              <h2 className="border-b border-white/[0.06] pb-2 font-heading text-lg font-semibold uppercase tracking-wide text-muted-foreground">
                Bu oyunda
              </h2>
              <GameDescriptionMarkdown content={md} />
            </section>

            {game.achievements.length > 0 ? (
              <section className="space-y-4">
                <h2 className="border-b border-white/[0.06] pb-2 font-heading text-lg font-semibold uppercase tracking-wide text-muted-foreground">
                  Başarımlar
                </h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {game.achievements.map((a) => (
                    <li
                      key={a.id}
                      className="rounded-lg border border-white/[0.06] bg-card/80 px-3 py-2.5 text-sm"
                    >
                      <span className="font-medium text-foreground">
                        {a.title}
                      </span>
                      {a.description ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {a.description}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {sys && specKeys.length > 0 ? (
              <section className="space-y-4">
                <h2 className="border-b border-white/[0.06] pb-2 font-heading text-lg font-semibold uppercase tracking-wide text-muted-foreground">
                  Sistem gereksinimleri
                </h2>
                <div className="overflow-x-auto rounded-lg border border-white/[0.06] bg-card/60">
                  <table className="w-full min-w-[480px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-black/30">
                        <th className="px-4 py-3 font-medium text-muted-foreground">
                          Bileşen
                        </th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">
                          Minimum
                        </th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">
                          Önerilen
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {specKeys.map((key) => (
                        <tr
                          key={key}
                          className="border-b border-white/[0.04] last:border-0"
                        >
                          <td className="px-4 py-3 font-medium text-foreground">
                            {specLabelTr(key)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {sys.minimum[key] ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {sys.recommended[key] ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}

            <section className="space-y-4">
              <h2 className="border-b border-white/[0.06] pb-2 font-heading text-lg font-semibold uppercase tracking-wide text-muted-foreground">
                İncelemeler
              </h2>
              {viewer && owned ? (
                <ReviewComposer
                  gameId={game.id}
                  initialRating={myReview?.rating}
                  initialTitle={myReview?.title}
                  initialContent={myReview?.content}
                />
              ) : viewer ? (
                <p className="rounded-lg border border-dashed border-white/10 bg-black/20 px-4 py-3 text-sm text-muted-foreground">
                  İnceleme yazmak için bu oyunu satın almalısın.{" "}
                  <a href="#satinal" className="text-accent underline">
                    Satın alma kutusuna git
                  </a>
                  .
                </p>
              ) : (
                <p className="rounded-lg border border-dashed border-white/10 bg-black/20 px-4 py-3 text-sm text-muted-foreground">
                  İnceleme eklemek için{" "}
                  <Link
                    href={`/sign-in?redirect_url=${encodeURIComponent(`/games/${slug}${reviewSort === "newest" ? "" : `?r=${reviewSort}`}`)}`}
                    className="text-accent underline"
                  >
                    giriş yap
                  </Link>{" "}
                  ve oyunu satın al.
                </p>
              )}
              {game.reviews.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">Sırala:</span>
                  <Link
                    href={`/games/${slug}`}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      reviewSort === "newest"
                        ? "border-accent bg-accent/15 text-accent"
                        : "border-white/10 text-muted-foreground hover:border-accent/40"
                    )}
                  >
                    En yeni
                  </Link>
                  <Link
                    href={`/games/${slug}?r=helpful`}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      reviewSort === "helpful"
                        ? "border-accent bg-accent/15 text-accent"
                        : "border-white/10 text-muted-foreground hover:border-accent/40"
                    )}
                  >
                    En faydalı
                  </Link>
                  <Link
                    href={`/games/${slug}?r=rating`}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      reviewSort === "rating"
                        ? "border-accent bg-accent/15 text-accent"
                        : "border-white/10 text-muted-foreground hover:border-accent/40"
                    )}
                  >
                    En yüksek puan
                  </Link>
                </div>
              ) : null}
              {game.reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Henüz inceleme yok. İlk sen yaz!
                </p>
              ) : (
                <ul className="space-y-4">
                  {sortedReviews.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-lg border border-white/[0.06] bg-card/80 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 text-accent">
                          <Star className="size-4 fill-accent" />
                          <span className="font-medium text-foreground">
                            {r.rating}/5
                          </span>
                        </div>
                        {r.title ? (
                          <span className="font-heading font-semibold text-foreground">
                            {r.title}
                          </span>
                        ) : null}
                        <span className="text-xs text-muted-foreground">
                          —
                          {r.user.username ??
                            r.user.email?.split("@")[0] ??
                            "Anonim"}
                        </span>
                        {verifiedReviewerIds.has(r.userId) ? (
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-normal"
                          >
                            Doğrulanmış satın alma
                          </Badge>
                        ) : null}
                      </div>
                      {r.content ? (
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {r.content}
                        </p>
                      ) : null}
                      <ReviewFeedback
                        reviewId={r.id}
                        initialYes={helpfulCounts.get(r.id)?.yes ?? 0}
                        initialNo={helpfulCounts.get(r.id)?.no ?? 0}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="lg:col-span-2">
            <div className="lg:sticky lg:top-20">
              <Card
                id="satinal"
                className="scroll-mt-24 overflow-hidden border-white/[0.08] bg-card shadow-2xl shadow-black/40"
              >
                <CardHeader className="space-y-3 border-b border-white/[0.06] bg-black/25 pb-4">
                  <CardTitle className="font-heading text-xl leading-snug text-foreground">
                    {game.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Geliştirici:{" "}
                    <Link
                      href={devSearchHref}
                      className="font-medium text-accent hover:underline"
                    >
                      {game.developerName}
                    </Link>
                  </p>
                  {ratingDisplay != null ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="size-4 fill-accent text-accent" />
                      <span className="font-medium text-foreground">
                        {ratingDisplay.toFixed(1)} / 5
                      </span>
                      <span className="text-muted-foreground">
                        ({count} değerlendirme)
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Henüz puan yok.
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Çıkış: {released}
                    {game.scheduledReleaseAt &&
                    game.scheduledReleaseAt > new Date() ? (
                      <>
                        {" "}
                        · Planlı:{" "}
                        {new Intl.DateTimeFormat("tr-TR", {
                          dateStyle: "medium",
                        }).format(game.scheduledReleaseAt)}
                      </>
                    ) : null}
                  </p>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span
                      className={
                        offPct != null
                          ? "font-heading text-3xl font-bold text-success"
                          : "font-heading text-3xl font-bold text-foreground"
                      }
                    >
                      {formatTryFromCents(game.priceCents)}
                    </span>
                    {game.originalPriceCents &&
                    game.originalPriceCents > game.priceCents ? (
                      <span className="text-lg line-through text-muted-foreground">
                        {formatTryFromCents(game.originalPriceCents)}
                      </span>
                    ) : null}
                    {offPct != null ? (
                      <Badge variant="secondary" className="text-xs">
                        −%{offPct}
                      </Badge>
                    ) : null}
                  </div>

                  <GameDetailPurchase
                    gameId={game.id}
                    checkoutProvider={checkoutProvider}
                  />

                  <div className="space-y-2 border-t border-white/[0.06] pt-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Platformlar
                    </p>
                    <PlatformRow platforms={platforms} />
                    <CompatibilityBadges platforms={platforms} />
                  </div>

                  {game.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-2 border-t border-white/[0.06] pt-5">
                      {game.categories.map((gc) => (
                        <Link
                          key={gc.category.id}
                          href={`/?cat=${encodeURIComponent(gc.category.slug)}`}
                        >
                          <Badge
                            variant="secondary"
                            className="cursor-pointer transition hover:bg-muted"
                          >
                            {gc.category.name}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>

        {dlcCards.length > 0 ? (
          <section className="mt-20 border-t border-white/[0.08] pt-12">
            <h2 className="font-heading text-xl font-semibold text-foreground">
              DLC ve eklentiler
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Bu ürün için yayımlanmış ek içerikler.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {dlcCards.map((g) => (
                <GameCard key={`dlc-${g.id}`} game={g} />
              ))}
            </div>
          </section>
        ) : null}

        {similarCards.length > 0 ? (
          <section className="mt-20 border-t border-white/[0.08] pt-12">
            <h2 className="font-heading text-xl font-semibold text-foreground">
              Benzer içerikler
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Aynı kategorilerde öne çıkan yapımlar.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similarCards.map((g) => (
                <GameCard key={`sim-${g.id}`} game={g} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
