import { z } from "zod";

import { requireRole } from "@/lib/auth/permissions";
import { db } from "@/lib/db";

const bodySchema = z.object({
  taxId: z.string().max(64).optional(),
  onboardingStep: z.number().int().min(0).max(3),
});

export async function POST(req: Request) {
  const user = await requireRole("DEVELOPER", "/dashboard/onboarding");
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Geçersiz veri." }, { status: 400 });

  const kycStatus =
    parsed.data.onboardingStep >= 3 ? "VERIFIED" : parsed.data.onboardingStep >= 1 ? "PENDING" : "UNVERIFIED";

  await db.developerProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      taxId: parsed.data.taxId ?? null,
      onboardingStep: parsed.data.onboardingStep,
      kycStatus,
    },
    update: {
      taxId: parsed.data.taxId ?? null,
      onboardingStep: parsed.data.onboardingStep,
      kycStatus,
    },
  });
  return Response.json({ ok: true });
}
