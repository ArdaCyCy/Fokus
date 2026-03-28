"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Fokus] Sayfa hatası:", error);
  }, [error]);

  return (
    <div className="container-shell flex min-h-[50vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <div className="max-w-md space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          Bir şeyler ters gitti
        </p>
        <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
          Bu sayfa yüklenirken hata oluştu
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Geçici bir sorun olabilir. Tekrar dene veya ana sayfaya dön.
        </p>
        {process.env.NODE_ENV === "development" && error.message ? (
          <pre className="mt-2 max-h-48 w-full overflow-auto rounded-md border border-border bg-muted/50 p-3 text-left text-xs text-muted-foreground">
            {error.message}
          </pre>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={() => reset()}>
          Tekrar dene
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Ana sayfa</Link>
        </Button>
      </div>
    </div>
  );
}
