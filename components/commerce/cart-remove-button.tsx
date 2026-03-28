"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CartRemoveButton({ gameId }: { gameId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-destructive"
      disabled={loading}
      aria-label="Sepetten çıkar"
      onClick={async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/cart", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gameId }),
          });
          if (!res.ok) throw new Error("Kaldırılamadı");
          router.refresh();
        } catch {
          window.alert("Sepetten kaldırılamadı. Tekrar dene.");
        } finally {
          setLoading(false);
        }
      }}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
