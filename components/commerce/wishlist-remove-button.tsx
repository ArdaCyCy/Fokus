"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { HeartOff } from "lucide-react";

import { Button } from "@/components/ui/button";

export function WishlistRemoveButton({ gameId }: { gameId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-1.5"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/wishlist", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gameId }),
          });
          if (!res.ok) throw new Error("Silinemedi");
          router.refresh();
        } catch {
          window.alert("Listeden kaldırılamadı.");
        } finally {
          setLoading(false);
        }
      }}
    >
      <HeartOff className="size-3.5" />
      {loading ? "…" : "Kaldır"}
    </Button>
  );
}
