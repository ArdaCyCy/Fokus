import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/app-user";
import { db } from "@/lib/db";

/** Oturum açıkken periyodik ping ile çevrimiçi durumu güncellenir. */
export async function POST() {
  const user = await requireAppUser("/");
  await db.user.update({
    where: { id: user.id },
    data: { lastSeenAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
