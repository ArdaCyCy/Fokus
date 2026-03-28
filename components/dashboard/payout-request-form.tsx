"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function PayoutRequestForm() {
  const router = useRouter();
  const [amountTry, setAmountTry] = useState("100");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    const tryNum = Number.parseFloat(amountTry.replace(",", "."));
    if (!Number.isFinite(tryNum) || tryNum < 10) {
      window.alert("Minimum 10 TL talep edilebilir.");
      return;
    }
    const amountCents = Math.round(tryNum * 100);
    setLoading(true);
    try {
      const res = await fetch("/api/payouts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents, note: note.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Talep oluşturulamadı");
      window.alert(
        "Ödeme talebin kaydedildi. Tutar, platform onayı ve ödeme takvimine göre işlenecek."
      );
      setNote("");
      router.refresh();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Hata");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4 text-sm">
      <p className="font-medium">Hakediş ödeme talebi</p>
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          className="h-9 w-32 rounded-md border border-border bg-background px-2"
          value={amountTry}
          onChange={(e) => setAmountTry(e.target.value)}
          placeholder="TRY"
        />
        <input
          type="text"
          className="h-9 min-w-[200px] flex-1 rounded-md border border-border bg-background px-2"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Not (isteğe bağlı)"
        />
        <Button type="button" size="sm" disabled={loading} onClick={submit}>
          {loading ? "..." : "Talep et"}
        </Button>
      </div>
    </div>
  );
}
