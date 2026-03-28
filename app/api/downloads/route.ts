import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAppUser } from "@/lib/auth/app-user";
import { db } from "@/lib/db";

const addSchema = z.object({
  gameId: z.string().min(1),
});

const patchSchema = z.object({
  downloadId: z.string().min(1),
  action: z.enum(["toggle", "cancel", "tick"]),
});

export async function GET() {
  const user = await requireAppUser("/library");
  const items = await db.downloadItem.findMany({
    where: { userId: user.id, status: { not: "CANCELED" } },
    include: { game: { select: { title: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const user = await requireAppUser("/library");
  const parsed = addSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });

  const owned = await db.purchase.findFirst({
    where: { userId: user.id, gameId: parsed.data.gameId, status: "PAID" },
    select: { id: true },
  });
  if (!owned) return NextResponse.json({ error: "Bu oyun kütüphanede değil." }, { status: 400 });

  const g = await db.game.findUnique({
    where: { id: parsed.data.gameId },
    select: { releaseChannel: true },
  });
  const channel = g?.releaseChannel ?? "STABLE";

  await db.downloadItem.upsert({
    where: { userId_gameId: { userId: user.id, gameId: parsed.data.gameId } },
    create: {
      userId: user.id,
      gameId: parsed.data.gameId,
      channel,
      status: "DOWNLOADING",
      progress: 1,
      speedMbps: 24,
    },
    update: {
      channel,
      status: "DOWNLOADING",
      speedMbps: 24,
      progress: 1,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const user = await requireAppUser("/library");
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  const { downloadId, action } = parsed.data;

  const item = await db.downloadItem.findFirst({
    where: { id: downloadId, userId: user.id },
    select: { id: true, status: true, progress: true },
  });
  if (!item) return NextResponse.json({ error: "İndirme bulunamadı." }, { status: 404 });

  if (action === "cancel") {
    await db.downloadItem.update({
      where: { id: downloadId },
      data: { status: "CANCELED", speedMbps: 0 },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "toggle") {
    const paused = item.status === "PAUSED";
    await db.downloadItem.update({
      where: { id: downloadId },
      data: { status: paused ? "DOWNLOADING" : "PAUSED", speedMbps: paused ? 24 : 0 },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "tick") {
    const nextProgress = Math.min(100, item.progress + 12);
    await db.downloadItem.update({
      where: { id: downloadId },
      data: {
        progress: nextProgress,
        status: nextProgress >= 100 ? "COMPLETED" : "DOWNLOADING",
        speedMbps: nextProgress >= 100 ? 0 : 24 + Math.random() * 10,
      },
    });
  }
  return NextResponse.json({ ok: true });
}
