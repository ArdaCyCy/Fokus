"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function ReviewFeedback({
  reviewId,
  initialYes,
  initialNo,
}: {
  reviewId: string;
  initialYes: number;
  initialNo: number;
}) {
  const router = useRouter();
  const [yes, setYes] = useState(initialYes);
  const [no, setNo] = useState(initialNo);
  const [busy, setBusy] = useState(false);

  async function vote(helpful: boolean) {
    setBusy(true);
    try {
      const res = await fetch("/api/reviews/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, helpful }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Oy kaydedilemedi");
      setYes(data.helpfulYes ?? yes);
      setNo(data.helpfulNo ?? no);
      router.refresh();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Hata");
    } finally {
      setBusy(false);
    }
  }

  async function report() {
    const reason = window.prompt("Rapor nedeni (min 3 karakter):");
    if (!reason || reason.trim().length < 3) return;
    setBusy(true);
    try {
      const res = await fetch("/api/reviews/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, reason: reason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Rapor gonderilemedi");
      window.alert("Rapor alindi. Moderasyon inceleyecek.");
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Hata");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3 text-xs">
      <span className="text-muted-foreground">
        Yararlı: {yes} · Yararsız: {no}
      </span>
      <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => vote(true)}>
        Yararlı
      </Button>
      <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => vote(false)}>
        Yararsız
      </Button>
      <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={report} className="text-destructive">
        Raporla
      </Button>
    </div>
  );
}
