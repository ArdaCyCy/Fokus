import { NextRequest } from "next/server";
import { z } from "zod";

import { enforceApiRateLimit } from "@/lib/api-rate-limit";
import { requireAppUser } from "@/lib/auth/app-user";
import { db } from "@/lib/db";

const bodySchema = z.object({
  userId: z.string().cuid(),
});

export async function POST(req: NextRequest) {
  const limited = await enforceApiRateLimit(req, { key: "friend-block", limit: 30, window: "1 m" });
  if (limited) return limited;

  const me = await requireAppUser("/friends");
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Geçersiz veri." }, { status: 400 });
  if (parsed.data.userId === me.id) {
    return Response.json({ error: "Kendinizi engelleyemezsiniz." }, { status: 400 });
  }

  await db.userBlock.upsert({
    where: {
      blockerId_blockedId: { blockerId: me.id, blockedId: parsed.data.userId },
    },
    create: { blockerId: me.id, blockedId: parsed.data.userId },
    update: {},
  });
  return Response.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const me = await requireAppUser("/friends");
  const userId = new URL(req.url).searchParams.get("userId");
  const parsed = bodySchema.safeParse({ userId });
  if (!parsed.success) return Response.json({ error: "Eksik userId." }, { status: 400 });
  await db.userBlock.deleteMany({
    where: { blockerId: me.id, blockedId: parsed.data.userId },
  });
  return Response.json({ ok: true });
}
