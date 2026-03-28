"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fieldClass =
  "mt-1.5 w-full rounded-md border border-white/[0.08] bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent";

export function ReviewComposer({
  gameId,
  initialRating,
  initialTitle,
  initialContent,
}: {
  gameId: string;
  initialRating?: number;
  initialTitle?: string | null;
  initialContent?: string | null;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(initialRating ?? 5);
  const [title, setTitle] = useState(initialTitle ?? "");
  const [content, setContent] = useState(initialContent ?? "");
  const [loading, setLoading] = useState(false);
  const isEdit = initialRating != null;

  return (
    <div className="rounded-lg border border-white/[0.08] bg-card/90 p-4 md:p-5">
      <h3 className="font-heading text-base font-semibold text-foreground">
        {isEdit ? "İncelemeni güncelle" : "İnceleme yaz"}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Bu oyunu satın aldığın için değerlendirme yapabilirsin. Her oyunda tek
        incelemen listelenir.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">Puan</p>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="rounded p-0.5 transition hover:scale-110"
                aria-label={`${n} yıldız`}
              >
                <Star
                  className={cn(
                    "size-8",
                    n <= rating
                      ? "fill-accent text-accent"
                      : "text-muted-foreground/35"
                  )}
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="rev-title" className="text-xs text-muted-foreground">
            Başlık (isteğe bağlı)
          </label>
          <input
            id="rev-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={fieldClass}
            placeholder="Kısa bir özet"
            maxLength={120}
          />
        </div>
        <div>
          <label htmlFor="rev-body" className="text-xs text-muted-foreground">
            İnceleme
          </label>
          <textarea
            id="rev-body"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={cn(fieldClass, "min-h-[120px] resize-y")}
            placeholder="Deneyimini paylaş…"
            maxLength={8000}
          />
        </div>
        <Button
          type="button"
          disabled={loading}
          className="w-full sm:w-auto"
          onClick={async () => {
            setLoading(true);
            try {
              const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  gameId,
                  rating,
                  title: title.trim() || null,
                  content: content.trim() || null,
                }),
              });
              const data = await res.json().catch(() => ({}));
              if (!res.ok) throw new Error(data?.error ?? "Kaydedilemedi");
              router.refresh();
            } catch (e) {
              window.alert(
                e instanceof Error ? e.message : "İnceleme kaydedilemedi."
              );
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "Kaydediliyor…" : isEdit ? "Güncelle" : "Yayımla"}
        </Button>
      </div>
    </div>
  );
}
