"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function GameMediaViewer({
  urls,
  gameTitle,
}: {
  urls: string[];
  gameTitle: string;
}) {
  const list = urls.filter(Boolean);
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const safeIndex = Math.min(index, Math.max(0, list.length - 1));
  const active = list[safeIndex] ?? list[0];

  const go = useCallback(
    (delta: number) => {
      if (list.length === 0) return;
      setIndex((i) => {
        const next = (i + delta + list.length) % list.length;
        return next;
      });
    },
    [list.length]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (list.length === 0) return null;

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-card shadow-2xl shadow-black/40">
        <div className="relative aspect-video w-full max-w-full bg-black">
          <Image
            key={active}
            src={active}
            alt={`${gameTitle} — görsel ${safeIndex + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 66vw"
            priority
          />
          {list.length > 1 ? (
            <>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute left-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/55 text-white shadow-lg backdrop-blur hover:bg-black/70"
                aria-label="Önceki görsel"
                onClick={() => go(-1)}
              >
                <ChevronLeft className="size-5" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute right-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/55 text-white shadow-lg backdrop-blur hover:bg-black/70"
                aria-label="Sonraki görsel"
                onClick={() => go(1)}
              >
                <ChevronRight className="size-5" />
              </Button>
            </>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute bottom-3 right-3 z-10 h-9 w-9 rounded-md border border-white/15 bg-black/50 text-white backdrop-blur hover:bg-black/65"
            aria-label="Tam ekran önizleme"
            onClick={() => setLightbox(true)}
          >
            <Maximize2 className="size-4" />
          </Button>
        </div>

        {list.length > 1 ? (
          <div className="border-t border-white/[0.06] bg-card/95 px-2 py-2">
            <div
              className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin [scrollbar-color:hsl(var(--muted))_transparent]"
              style={{ scrollbarWidth: "thin" }}
            >
              {list.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={cn(
                    "relative h-14 w-[88px] shrink-0 overflow-hidden rounded-md border-2 transition md:h-16 md:w-[104px]",
                    i === safeIndex
                      ? "border-accent ring-2 ring-accent/40"
                      : "border-transparent opacity-75 hover:opacity-100"
                  )}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="104px"
                  />
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent className="max-h-[95vh] w-[min(1200px,96vw)] overflow-hidden border-white/10 bg-black p-0">
          <DialogTitle className="sr-only">{gameTitle} — tam ekran görsel</DialogTitle>
          <div className="relative aspect-video w-full bg-black">
            {active ? (
              <Image
                src={active}
                alt=""
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
