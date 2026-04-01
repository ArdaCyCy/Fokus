import { notFound } from "next/navigation";

import { EditGameForm } from "@/components/dashboard/edit-game-form";
import { requireAppUser } from "@/lib/auth/app-user";
import { db } from "@/lib/db";
import { StorePageHero } from "@/components/store/store-page-hero";

export default async function EditDeveloperGamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const user = await requireAppUser(`/dashboard/games/${gameId}/edit`);

  const game = await db.game.findFirst({
    where:
      user.role === "ADMIN"
        ? { id: gameId }
        : { id: gameId, developerSlug: user.id },
    select: {
      id: true,
      title: true,
      shortDescription: true,
      descriptionMd: true,
      priceCents: true,
      coverImageUrl: true,
      parentGameId: true,
      status: true,
      platforms: true,
      systemRequirements: true,
      screenshotUrls: true,
      isTurkishMade: true,
      categories: { select: { category: { select: { slug: true } } } },
    },
  });

  if (!game) notFound();

  const initial = {
    id: game.id,
    title: game.title,
    shortDescription: game.shortDescription,
    descriptionMd: game.descriptionMd,
    priceCents: game.priceCents,
    coverImageUrl: game.coverImageUrl,
    parentGameId: game.parentGameId,
    status: game.status,
    platformsJson: JSON.stringify(game.platforms ?? {}, null, 2),
    systemRequirementsJson: JSON.stringify(
      game.systemRequirements ?? {},
      null,
      2,
    ),
    screenshotsText: game.screenshotUrls.join("\n"),
    isTurkishMade: game.isTurkishMade,
    categorySlugs: game.categories.map((c) => c.category.slug),
  };

  return (
    <div className="space-y-8">
      <StorePageHero
        eyebrow="Geliştirici"
        title="Oyunu düzenle"
        description={game.title}
        className="mb-0"
      />
      <EditGameForm initial={initial} />
    </div>
  );
}
