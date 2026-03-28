import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Yük dengeleyici / uptime kontrolü. Kimlik gerektirmez.
 * DB importu yok — böylece Prisma/env yüklenmeden hafif yanıt verir.
 * ?db=1 ile veritabanı ping (yavaş; isteğe bağlı).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const pingDb = url.searchParams.get("db") === "1";

  if (!pingDb) {
    return NextResponse.json(
      { ok: true, service: "fokus", ts: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const { db } = await import("@/lib/db");
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { ok: true, service: "fokus", db: "up", ts: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { ok: false, service: "fokus", db: "down", ts: new Date().toISOString() },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
