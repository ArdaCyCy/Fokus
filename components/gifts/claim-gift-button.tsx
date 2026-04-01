"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function ClaimGiftButton({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function claim() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/gifts/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = (await res.json()) as { error?: string; redirect?: string };
      if (!res.ok) throw new Error(json.error ?? "Claim başarısız.");
      router.push(json.redirect ?? "/library");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button onClick={claim} disabled={loading}>
        {loading ? "Claim ediliyor..." : "Hediyeyi kütüphaneme ekle"}
      </Button>
    </div>
  );
}

