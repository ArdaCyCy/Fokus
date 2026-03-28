import { NextResponse } from "next/server";
import { z } from "zod";

import { requireRole } from "@/lib/auth/permissions";
import { db } from "@/lib/db";

const bodySchema = z.object({
  gameId: z.string().min(1),
  decision: z.enum(["APPROVE", "REJECT"]),
});

export async function PATCH(req: Request) {
  await requireRole("ADMIN", "/admin/games");
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const { gameId, decision } = parsed.data;
  const nextStatus = decision === "APPROVE" ? "PUBLISHED" : "REJECTED";
  await db.game.update({
    where: { id: gameId },
    data: {
      status: nextStatus,
      isPublished: decision === "APPROVE",
      releasedAt: decision === "APPROVE" ? new Date() : null,
    },
  });

  return NextResponse.json({ ok: true });
}
