import { NextRequest } from "next/server";
import { z } from "zod";

import { enforceApiRateLimit } from "@/lib/api-rate-limit";
import { getOrCreateRequestId, jsonWithRequestId } from "@/lib/api-observability";
import { requireAppUser } from "@/lib/auth/app-user";
import { db } from "@/lib/db";

const bodySchema = z.object({
  reviewId: z.string().cuid(),
  helpful: z.boolean(),
});

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const limited = await enforceApiRateLimit(req, { key: "review-vote", limit: 60, window: "1 m" });
  if (limited) {
    limited.headers.set("X-Request-Id", requestId);
    return limited;
  }

  const user = await requireAppUser("/games");
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return jsonWithRequestId({ error: "Geçersiz veri." }, { status: 400 }, requestId);
  }

  const review = await db.review.findUnique({
    where: { id: parsed.data.reviewId },
    select: { id: true },
  });
  if (!review) return jsonWithRequestId({ error: "İnceleme bulunamadı." }, { status: 404 }, requestId);

  await db.reviewHelpfulVote.upsert({
    where: {
      reviewId_userId: { reviewId: parsed.data.reviewId, userId: user.id },
    },
    create: {
      reviewId: parsed.data.reviewId,
      userId: user.id,
      helpful: parsed.data.helpful,
    },
    update: { helpful: parsed.data.helpful },
  });

  const helpfulYes = await db.reviewHelpfulVote.count({
    where: { reviewId: parsed.data.reviewId, helpful: true },
  });
  const helpfulNo = await db.reviewHelpfulVote.count({
    where: { reviewId: parsed.data.reviewId, helpful: false },
  });

  return jsonWithRequestId({ ok: true, helpfulYes, helpfulNo }, undefined, requestId);
}
