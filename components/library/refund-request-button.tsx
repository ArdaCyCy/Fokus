"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function RefundRequestButton({ purchaseId }: { purchaseId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <Button
      variant="outline"
      className="flex-1"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/refunds", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ purchaseId }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error ?? "İade başarısız");
          const toWallet = Boolean(data?.toWallet);
          window.alert(
            toWallet
              ? "İade tamamlandı. Tutar cüzdan bakiyene yansıdı."
              : "İade talebin alındı. Kartlı ödemelerde süreç banka / İyzico üzerinden işlenir."
          );
          router.refresh();
        } catch (err) {
          window.alert(err instanceof Error ? err.message : "İade hatası");
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? "İade ediliyor…" : "İade talep et"}
    </Button>
  );
}
