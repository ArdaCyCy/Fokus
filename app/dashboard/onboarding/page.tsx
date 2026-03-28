import Link from "next/link";

import { requireRole } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OnboardingForm } from "@/components/dashboard/onboarding-form";

export default async function DeveloperOnboardingPage() {
  const user = await requireRole("DEVELOPER", "/dashboard/onboarding");
  const profile = await db.developerProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Gelistirici onboarding</h1>
        <p className="text-sm text-muted-foreground">
          Vergi / ödeme bilgileri ve yayın öncesi kontroller. Canlı ödemelerde kimlik ve
          sözleşme doğrulaması operasyon tarafından tamamlanır.
        </p>
      </div>

      <Card className="bg-card/70">
        <CardHeader>
          <CardTitle>Durum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            KYC: <span className="font-medium">{profile.kycStatus}</span>
          </p>
          <p>
            Adim: <span className="font-medium">{profile.onboardingStep}</span> / 3
          </p>
          <p className="text-muted-foreground">
            Build tarama notu: {profile.buildScanNote ?? "— (entegrasyon bekleniyor)"}
          </p>
        </CardContent>
      </Card>

      <OnboardingForm
        initial={{
          taxId: profile.taxId ?? "",
          onboardingStep: profile.onboardingStep,
          kycStatus: profile.kycStatus,
        }}
      />

      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/dashboard">Panele don</Link>
        </Button>
      </div>
    </div>
  );
}
