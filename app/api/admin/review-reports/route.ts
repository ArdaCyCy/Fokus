import { ModerationStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { z } from "zod";

import { requireRole } from "@/lib/auth/permissions";
import { db } from "@/lib/db";

const patchSchema = z.object({
  reportId: z.string().cuid(),
  status: z.enum(["RESOLVED", "DISMISSED"]),
});

export async function GET() {
  await requireRole("ADMIN", "/admin/review-reports");
  const reports = await db.reviewReport.findMany({
    where: { status: ModerationStatus.PENDING },
    orderBy: { createdAt: "asc" },
    include: {
      review: {
        select: {
          id: true,
          rating: true,
          content: true,
          game: { select: { title: true, slug: true } },
        },
      },
      reporter: { select: { username: true, email: true } },
    },
    take: 100,
  });
  return Response.json({ reports });
}

export async function PATCH(req: NextRequest) {
  await requireRole("ADMIN", "/admin/review-reports");
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Geçersiz veri." }, { status: 400 });

  await db.reviewReport.update({
    where: { id: parsed.data.reportId },
    data: {
      status: parsed.data.status === "RESOLVED" ? ModerationStatus.RESOLVED : ModerationStatus.DISMISSED,
      resolvedAt: new Date(),
    },
  });
  return Response.json({ ok: true });
}
