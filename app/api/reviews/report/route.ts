import { ModerationStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { z } from "zod";

import { enforceApiRateLimit } from "@/lib/api-rate-limit";
import { auditLog, getOrCreateRequestId, jsonWithRequestId } from "@/lib/api-observability";
import { requireAppUser } from "@/lib/auth/app-user";
import { db } from "@/lib/db";

const bodySchema = z.object({
  reviewId: z.string().cuid(),
  reason: z.string().trim().min(3).max(500),
});

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const limited = await enforceApiRateLimit(req, { key: "review-report", limit: 10, window: "1 m" });
  if (limited) {
    limited.headers.set("X-Request-Id", requestId);
    return limited;
  }

  const reporter = await requireAppUser("/games");
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return jsonWithRequestId({ error: "Geçersiz veri." }, { status: 400 }, requestId);
  }

  const review = await db.review.findUnique({
    where: { id: parsed.data.reviewId },
    select: { id: true, userId: true },
  });
  if (!review) return jsonWithRequestId({ error: "İnceleme bulunamadı." }, { status: 404 }, requestId);
  if (review.userId === reporter.id) {
    return jsonWithRequestId({ error: "Kendi incelemenizi rapor edemezsiniz." }, { status: 400 }, requestId);
  }

  await db.reviewReport.create({
    data: {
      reviewId: review.id,
      reporterId: reporter.id,
      reason: parsed.data.reason,
      status: ModerationStatus.PENDING,
    },
  });
  auditLog("info", "review.reported", { requestId, reviewId: review.id, reporterId: reporter.id });
  return jsonWithRequestId({ ok: true }, undefined, requestId);
}
