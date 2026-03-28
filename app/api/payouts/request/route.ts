import { NextRequest } from "next/server";
import { z } from "zod";

import { enforceApiRateLimit } from "@/lib/api-rate-limit";
import { requireRole } from "@/lib/auth/permissions";
import { db } from "@/lib/db";

const bodySchema = z.object({
  amountCents: z.number().int().min(1000).max(10_000_000),
  note: z.string().max(280).optional(),
});

export async function POST(req: NextRequest) {
  const limited = await enforceApiRateLimit(req, { key: "payout-request", limit: 5, window: "1 m" });
  if (limited) return limited;

  const dev = await requireRole("DEVELOPER", "/dashboard/earnings");
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Geçersiz tutar." }, { status: 400 });

  const pending = await db.payoutRequest.aggregate({
    where: { developerId: dev.id, status: "PENDING" },
    _sum: { amountCents: true },
  });
  const pendingSum = pending._sum.amountCents ?? 0;
  if (pendingSum + parsed.data.amountCents > 50_000_000) {
    return Response.json({ error: "Bekleyen ödeme talepleri limiti aşıyor." }, { status: 400 });
  }

  const payout = await db.payoutRequest.create({
    data: {
      developerId: dev.id,
      amountCents: parsed.data.amountCents,
      note: parsed.data.note ?? null,
      status: "PENDING",
    },
  });
  return Response.json({ ok: true, id: payout.id });
}

export async function GET() {
  const dev = await requireRole("DEVELOPER", "/dashboard/earnings");
  const rows = await db.payoutRequest.findMany({
    where: { developerId: dev.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return Response.json({ payouts: rows });
}
