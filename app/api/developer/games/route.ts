import { NextResponse } from "next/server";
import { z } from "zod";

import { requireRole } from "@/lib/auth/permissions";
import { db } from "@/lib/db";

const createSchema = z.object({
  title: z.string().min(2).max(120),
  shortDescription: z.string().max(180).optional(),
  descriptionMd: z.string().min(30).max(10000),
  priceCents: z.number().int().min(0).max(5000000),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  /** DLC / eklenti ise geliştiricinin başka bir oyununun id’si */
  parentGameId: z.string().optional(),
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
    },
    select: { id: true, slug: true },
  });

  return NextResponse.json({ ok: true, game });
}

export async function PATCH(req: Request) {
  const user = await requireRole("DEVELOPER", "/dashboard/games");
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
  }

  const { gameId, scheduledReleaseAt, buildScanNote, parentGameId, ...fields } =
    parsed.data;
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
    },
  });
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
