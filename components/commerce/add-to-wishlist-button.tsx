"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AddToWishlistButton({
  gameId,
  className,
  iconOnly = false,
}: {
  gameId: string;
  className?: string;
  iconOnly?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  return (
    <Button
      type="button"
      variant={iconOnly ? "secondary" : "outline"}
      size={iconOnly ? "icon" : "default"}
      className={cn(
        "gap-2",
        className,
        iconOnly &&
          ok &&
          "border-red-500/60 bg-red-950/45 text-red-500 shadow-[0_0_18px_rgba(239,68,68,0.4)]"
      )}
      aria-label={ok ? "İstek listesine eklendi" : "İstek listesine ekle"}
      disabled={loading}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);
        setOk(false);
        try {
          const res = await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gameId }),
          });
          if (!res.ok) throw new Error("İstek listesine eklenemedi");
          setOk(true);
          window.setTimeout(() => setOk(false), 2000);
        } catch {
          window.alert("İşlem başarısız. Giriş yaptığından emin ol.");
        } finally {
          setLoading(false);
        }
      }}
    >
      <motion.span
        className="inline-flex"
        animate={
          ok
            ? { scale: [1, 1.28, 1], rotate: [0, -10, 10, 0] }
            : { scale: 1, rotate: 0 }
        }
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        <Heart
          className={cn(
            "size-4 transition-colors duration-300",
            ok && "fill-red-500 text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]"
          )}
        />
      </motion.span>
      {iconOnly
        ? null
        : loading
          ? "Ekleniyor…"
          : ok
            ? "Listeye eklendi!"
            : "İstek listesine ekle"}
    </Button>
  );
}
