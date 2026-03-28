import { NextRequest } from "next/server";
import { z } from "zod";
import { PurchaseStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { enforceApiRateLimit } from "@/lib/api-rate-limit";
import { getOrCreateRequestId, jsonWithRequestId } from "@/lib/api-observability";
import { getOptionalAppUser } from "@/lib/auth/app-user";
import { db } from "@/lib/db";

const bodySchema = z.object({
  gameId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional().nullable(),
  content: z.string().max(8000).optional().nullable(),
});

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const limited = await enforceApiRateLimit(req, {
    key: "review-write",
    limit: 20,
    window: "1 m",
  });
  if (limited) {
    limited.headers.set("X-Request-Id", requestId);
    return limited;
  }

  const user = await getOptionalAppUser();
  if (!user) {
    return jsonWithRequestId(
      { error: "İnceleme yazmak için giriş yapmalısın." },
      { status: 401 },
      requestId
    );
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return jsonWithRequestId(
      { error: "Geçersiz veri.", issues: parsed.error.flatten() },
      { status: 400 },
      requestId
    );
  }

  const { gameId, rating, title, content } = parsed.data;

  const [game, purchase] = await Promise.all([
    db.game.findFirst({
      where: { id: gameId, isPublished: true, status: "PUBLISHED" },
      select: { id: true, slug: true, title: true },
    }),
    db.purchase.findFirst({
      where: {
        userId: user.id,
        gameId,
        status: PurchaseStatus.PAID,
      },
      select: { id: true },
    }),
  ]);

  if (!game) {
    return jsonWithRequestId({ error: "Oyun bulunamadı." }, { status: 404 }, requestId);
  }
  if (!purchase) {
    return jsonWithRequestId(
      { error: "Sadece satın aldığın oyunları inceleyebilirsin." },
      { status: 403 },
      requestId
    );
  }

  await db.review.upsert({
    where: { userId_gameId: { userId: user.id, gameId } },
    create: {
      userId: user.id,
      gameId,
      rating,
      title: title?.trim() || null,
      content: content?.trim() || null,
    },
    update: {
      rating,
      title: title?.trim() || null,
      content: content?.trim() || null,
    },
  });

  await db.activityEvent.create({
    data: {
      userId: user.id,
      gameId,
      type: "REVIEW",
      message: `${game.title} için inceleme güncellendi`,
    },
  });

  revalidatePath(`/games/${game.slug}`);

  return jsonWithRequestId({ ok: true }, { status: 200 }, requestId);
}
