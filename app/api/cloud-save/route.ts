import { NextRequest } from "next/server";
import { z } from "zod";

import { enforceApiRateLimit } from "@/lib/api-rate-limit";
import { requireAppUser } from "@/lib/auth/app-user";
import { db } from "@/lib/db";

const bodySchema = z.object({
  gameId: z.string().cuid(),
  slot: z.string().min(1).max(32).optional(),
  sizeBytes: z.number().int().min(0).max(100_000_000),
});

export async function GET() {
  const user = await requireAppUser("/library");
  const rows = await db.cloudSaveMetadata.findMany({
    where: { userId: user.id },
    include: { game: { select: { title: true, slug: true } } },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });
  return Response.json({ saves: rows });
}

export async function PUT(req: NextRequest) {
  const limited = await enforceApiRateLimit(req, { key: "cloud-save-put", limit: 30, window: "1 m" });
  if (limited) return limited;

  const user = await requireAppUser("/library");
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Geçersiz veri." }, { status: 400 });

  const owned = await db.purchase.findFirst({
    where: { userId: user.id, gameId: parsed.data.gameId, status: "PAID" },
    select: { id: true },
  });
  if (!owned) return Response.json({ error: "Oyun kütüphanede değil." }, { status: 403 });

  const slot = parsed.data.slot ?? "0";
  const row = await db.cloudSaveMetadata.upsert({
    where: {
      userId_gameId_slot: {
        userId: user.id,
        gameId: parsed.data.gameId,
        slot,
      },
    },
    create: {
      userId: user.id,
      gameId: parsed.data.gameId,
      slot,
      sizeBytes: parsed.data.sizeBytes,
    },
    update: { sizeBytes: parsed.data.sizeBytes },
  });
  return Response.json({ ok: true, save: row });
}
