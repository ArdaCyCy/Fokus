"use client";

import { useState } from "react";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export function GameScreenshotGrid({ urls }: { urls: string[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  if (urls.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {urls.slice(0, 4).map((src) => (
          <button
            key={src}
            type="button"
            className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            onClick={() => {
              setActive(src);
              setOpen(true);
            }}
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover transition hover:opacity-90"
              sizes="(max-width:768px) 50vw, 25vw"
            />
          </button>
        ))}
      </div>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setActive(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-hidden border-border p-0">
          <DialogTitle className="sr-only">Ekran görüntüsü</DialogTitle>
          {active ? (
            <div className="relative aspect-video w-full bg-black md:aspect-[16/9]">
              <Image
                src={active}
                alt=""
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
