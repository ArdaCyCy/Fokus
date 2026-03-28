"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AddToCartButton({
  gameId,
  className,
  size = "default",
}: {
  gameId: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      className={className}
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gameId }),
          });
          if (!res.ok) throw new Error("Sepete eklenemedi");
          window.alert("Sepete eklendi.");
        } catch {
          window.alert("İşlem başarısız. Giriş yaptığından emin ol.");
        } finally {
          setLoading(false);
        }
      }}
    >
      <ShoppingCart className="size-4" />
      {loading ? "Ekleniyor..." : "Sepete Ekle"}
    </Button>
  );
}
