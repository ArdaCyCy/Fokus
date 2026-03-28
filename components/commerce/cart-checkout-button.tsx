"use client";

import { useState } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import type { CheckoutProviderMode } from "@/lib/commerce/checkout-config";
import { cn } from "@/lib/utils";

export function CartCheckoutButton({
  provider,
  gameIds,
  couponCode,
  className,
  variant = "default",
  size = "default",
}: {
  provider: CheckoutProviderMode;
  gameIds: string[];
  couponCode?: string;
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}) {
  const [loading, setLoading] = useState(false);

  const label =
    provider === "iyzico" ? "Kart ile öde (İyzico)" : "Cüzdan bakiyesi ile öde";

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("w-full", className)}
      disabled={loading || gameIds.length === 0}
      onClick={async () => {
        setLoading(true);
        try {
          if (provider === "iyzico") {
            const res = await fetch("/api/checkout/iyzico", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                gameIds,
                couponCode: couponCode?.trim() || undefined,
              }),
            });
            const data = (await res.json()) as { error?: string; url?: string };
            if (!res.ok) throw new Error(data?.error ?? "Ödeme başlatılamadı");
            if (data.url) window.location.href = data.url;
            else throw new Error("Ödeme adresi alınamadı");
            return;
          }

          const idemKey = crypto.randomUUID();
          const res = await fetch("/api/checkout/wallet", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Idempotency-Key": idemKey,
            },
            body: JSON.stringify({
              gameIds,
              couponCode: couponCode?.trim() || undefined,
            }),
          });
          const data = (await res.json()) as { error?: string };
          if (!res.ok) throw new Error(data?.error ?? "Ödeme tamamlanamadı");
          window.location.href = "/library";
        } catch (err) {
          window.alert(err instanceof Error ? err.message : "Ödeme hatası.");
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? "İşleniyor…" : label}
    </Button>
  );
}
