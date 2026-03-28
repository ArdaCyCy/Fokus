import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAppUser } from "@/lib/auth/app-user";
import { db } from "@/lib/db";

const patchSchema = z.object({
  notificationId: z.string().min(1).optional(),
  markAll: z.boolean().optional(),
});

export async function GET() {
  const user = await requireAppUser("/notifications");
  const items = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ items });
}

export async function PATCH(req: Request) {
  const user = await requireAppUser("/notifications");
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  if (parsed.data.markAll) {
    await db.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  }
  if (!parsed.data.notificationId) return NextResponse.json({ error: "Eksik id." }, { status: 400 });
  await db.notification.updateMany({
    where: { id: parsed.data.notificationId, userId: user.id },
    data: { readAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
