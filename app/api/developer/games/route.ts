import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";

import { requireRole } from "@/lib/auth/permissions";
import { db } from "@/lib/db";

const jsonRecord = z.record(z.string(), z.unknown()).optional();

const createSchema = z.object({
  title: z.string().min(2).max(120),
  shortDescription: z.string().max(180).optional(),
  descriptionMd: z.string().min(30).max(10000),
  priceCents: z.number().int().min(0).max(5000000),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  /** DLC / eklenti ise geliştiricinin başka bir oyununun id’si */
  parentGameId: z.string().optional(),
  categorySlugs: z.array(z.string().min(1)).max(12).optional(),
  platforms: jsonRecord,
  systemRequirements: jsonRecord,
  screenshotUrls: z.array(z.string().url()).max(16).optional(),
  isTurkishMade: z.boolean().optional(),
});

const updateSchema = z.object({
  gameId: z.string().min(1),
  title: z.string().min(2).max(120).optional(),
  shortDescription: z.string().max(180).optional(),
  descriptionMd: z.string().min(30).max(10000).optional(),
  priceCents: z.number().int().min(0).max(5000000).optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PENDING"]).optional(),
  releaseChannel: z.enum(["STABLE", "BETA", "ALPHA"]).optional(),
  scheduledReleaseAt: z.string().datetime().nullable().optional(),
  buildScanNote: z.string().max(500).nullable().optional(),
  parentGameId: z.string().min(1).nullable().optional(),
  categorySlugs: z.array(z.string().min(1)).max(12).optional(),
  platforms: jsonRecord,
  systemRequirements: jsonRecord,
  screenshotUrls: z.array(z.string().url()).max(16).optional(),
  isTurkishMade: z.boolean().optional(),
});

const deleteSchema = z.object({
  gameId: z.string().min(1),
});

async function resolveParentId(
  userId: string,
  parentId: string | undefined
): Promise<string | undefined> {
  const id = parentId?.trim();
  if (!id) return undefined;
  const parent = await db.game.findFirst({
    where: { id, developerSlug: userId },
    select: { id: true },
  });
  if (!parent) {
    throw new Error("PARENT_NOT_FOUND");
  }
  return id;
}

async function syncGameCategories(
  gameId: string,
  slugs: string[] | undefined
): Promise<void> {
  if (slugs === undefined) return;
  await db.gameCategory.deleteMany({ where: { gameId } });
  if (slugs.length === 0) return;
  const cats = await db.category.findMany({
    where: { slug: { in: slugs } },
    select: { id: true },
  });
  if (cats.length === 0) return;
  await db.gameCategory.createMany({
    data: cats.map((c) => ({ gameId, categoryId: c.id })),
    skipDuplicates: true,
  });
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET() {
  const user = await requireRole("DEVELOPER", "/dashboard/games");
  const games = await db.game.findMany({
    where: { developerSlug: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      priceCents: true,
      viewCount: true,
      status: true,
      updatedAt: true,
      slug: true,
      parentGameId: true,
    },
  });
  return NextResponse.json({ games });
}

export async function POST(req: Request) {
  const user = await requireRole("DEVELOPER", "/dashboard/upload");
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
  }

  const {
    title,
    shortDescription,
    descriptionMd,
    priceCents,
    coverImageUrl,
    parentGameId: parentRaw,
    categorySlugs,
    platforms,
    systemRequirements,
    screenshotUrls,
    isTurkishMade,
  } = parsed.data;

  let parentGameId: string | undefined;
  try {
    parentGameId = await resolveParentId(user.id, parentRaw || undefined);
  } catch {
    return NextResponse.json(
      { error: "Ana oyun bulunamadı veya bu hesaba ait değil." },
      { status: 400 }
    );
  }

  const baseSlug = slugify(title);
  const uniqueSlug = `${baseSlug}-${Math.floor(Math.random() * 10000)}`;

  const game = await db.game.create({
    data: {
      title,
      slug: uniqueSlug,
      shortDescription: shortDescription || null,
      descriptionMd,
      developerName: user.username ?? "Fokus Geliştirici",
      developerSlug: user.id,
      priceCents,
      coverImageUrl: coverImageUrl || null,
      parentGameId: parentGameId ?? null,
      status: "DRAFT",
      isPublished: false,
      platforms:
        platforms === undefined
          ? undefined
          : (platforms as unknown as Prisma.InputJsonValue),
      systemRequirements:
        systemRequirements === undefined
          ? undefined
          : (systemRequirements as unknown as Prisma.InputJsonValue),
      screenshotUrls: screenshotUrls ?? [],
      isTurkishMade: isTurkishMade ?? false,
    },
    select: { id: true, slug: true },
  });

  await syncGameCategories(game.id, categorySlugs);

  return NextResponse.json({ ok: true, game });
}

export async function PATCH(req: Request) {
  const user = await requireRole("DEVELOPER", "/dashboard/games");
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
  }

  const {
    gameId,
    scheduledReleaseAt,
    buildScanNote,
    parentGameId,
    categorySlugs,
    platforms,
    systemRequirements,
    screenshotUrls,
    isTurkishMade,
    ...fields
  } = parsed.data;
  const existing = await db.game.findFirst({
    where: { id: gameId, developerSlug: user.id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Oyun bulunamadı." }, { status: 404 });
  }

  let resolvedParent: string | null | undefined;
  if (parentGameId !== undefined) {
    if (parentGameId === null) {
      resolvedParent = null;
    } else if (parentGameId === gameId) {
      return NextResponse.json(
        { error: "Bir oyun kendi ana oyunu olamaz." },
        { status: 400 }
      );
    } else {
      try {
        resolvedParent = await resolveParentId(user.id, parentGameId);
      } catch {
        return NextResponse.json(
          { error: "Ana oyun bulunamadı veya bu hesaba ait değil." },
          { status: 400 }
        );
      }
    }
  }

  await db.game.update({
    where: { id: gameId },
    data: {
      ...fields,
      coverImageUrl: fields.coverImageUrl === "" ? null : fields.coverImageUrl,
      isPublished: fields.status === "PENDING" ? false : undefined,
      scheduledReleaseAt:
        scheduledReleaseAt === undefined
          ? undefined
          : scheduledReleaseAt
            ? new Date(scheduledReleaseAt)
            : null,
      ...(resolvedParent !== undefined
        ? { parentGameId: resolvedParent }
        : {}),
      ...(platforms !== undefined
        ? { platforms: platforms as unknown as Prisma.InputJsonValue }
        : {}),
      ...(systemRequirements !== undefined
        ? {
            systemRequirements: systemRequirements as unknown as Prisma.InputJsonValue,
          }
        : {}),
      ...(screenshotUrls !== undefined ? { screenshotUrls } : {}),
      ...(isTurkishMade !== undefined ? { isTurkishMade } : {}),
    },
  });
  await syncGameCategories(gameId, categorySlugs);
  if (buildScanNote !== undefined) {
    await db.developerProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, buildScanNote },
      update: { buildScanNote },
    });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await requireRole("DEVELOPER", "/dashboard/games");
  const url = new URL(req.url);
  const parsed = deleteSchema.safeParse({ gameId: url.searchParams.get("gameId") });
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
  const game = await db.game.findFirst({
    where: { id: parsed.data.gameId, developerSlug: user.id },
    select: { id: true, status: true },
  });
  if (!game) {
    return NextResponse.json({ error: "Oyun bulunamadı." }, { status: 404 });
  }
  if (game.status === "PUBLISHED") {
    return NextResponse.json(
      { error: "Yayındaki oyun silinemez." },
      { status: 400 }
    );
  }
  await db.game.delete({ where: { id: game.id } });
  return NextResponse.json({ ok: true });
}
