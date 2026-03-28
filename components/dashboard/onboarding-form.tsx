"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function OnboardingForm({
  initial,
}: {
  initial: { taxId: string; onboardingStep: number; kycStatus: string };
}) {
  const router = useRouter();
  const [taxId, setTaxId] = useState(initial.taxId);
  const [step, setStep] = useState(initial.onboardingStep);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    try {
      const res = await fetch("/api/developer/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taxId: taxId.trim(), onboardingStep: step }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Kaydedilemedi");
      router.refresh();
      window.alert("Kaydedildi.");
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Hata");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card/60 p-4">
      <label className="block text-sm">
        <span className="text-muted-foreground">Vergi no / KYC referans (demo)</span>
        <input
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={taxId}
          onChange={(e) => setTaxId(e.target.value)}
          placeholder="0000000000"
        />
      </label>
      <label className="block text-sm">
        <span className="text-muted-foreground">Tamamlanan adim (0-3)</span>
        <input
          type="number"
          min={0}
          max={3}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={step}
          onChange={(e) => setStep(Number.parseInt(e.target.value, 10) || 0)}
        />
      </label>
      <Button type="button" disabled={loading} onClick={save}>
        {loading ? "Kaydediliyor..." : "Kaydet"}
      </Button>
      {initial.kycStatus === "UNVERIFIED" ? (
        <p className="text-xs text-muted-foreground">
          Gercek KYC icin odeme partneri entegrasyonu sonraki fazda baglanir.
        </p>
      ) : null}
    </div>
  );
}
