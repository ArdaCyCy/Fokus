import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { enforceApiRateLimit } from "@/lib/api-rate-limit";
import { requireAppUser } from "@/lib/auth/app-user";
import { db } from "@/lib/db";
import { isWalletDemoTopupAllowed } from "@/lib/env";
import { isIyzicoConfigured } from "@/lib/iyzico/client";

const topupSchema = z.object({
  amountCents: z.number().int().min(1000).max(500000),
});

export async function GET() {
  const user = await requireAppUser("/wallet");
  const [txns, allowDemoTopup, iyzicoTopupAvailable] = await Promise.all([
    db.walletTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    Promise.resolve(isWalletDemoTopupAllowed()),
    Promise.resolve(isIyzicoConfigured()),
  ]);
  return NextResponse.json({
    balanceCents: user.walletBalanceCents,
    transactions: txns,
    allowDemoTopup,
    iyzicoTopupAvailable,
  });
}

export async function POST(req: NextRequest) {
  if (!isWalletDemoTopupAllowed()) {
    return NextResponse.json(
      {
        error:
          "Ücretsiz cüzdan yükleme bu ortamda kapalı. Bakiye için İyzico ile kart yükleme veya yönetici akışı kullanılmalıdır.",
      },
      { status: 403 },
    );
  }

  const limited = await enforceApiRateLimit(req, {
    key: "wallet-demo-topup",
    limit: 20,
    window: "1 m",
  });
  if (limited) return limited;

  const user = await requireAppUser("/wallet");
  const parsed = topupSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz tutar." }, { status: 400 });

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { walletBalanceCents: { increment: parsed.data.amountCents } },
    });
    await tx.walletTransaction.create({
      data: {
        userId: user.id,
        amountCents: parsed.data.amountCents,
        type: "TOPUP",
        description: "Cüzdan yükleme (geliştirme / test)",
      },
    });
  });
  return NextResponse.json({ ok: true });
}
