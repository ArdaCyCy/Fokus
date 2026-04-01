import Link from "next/link";

import { Button } from "@/components/ui/button";

export function StoreHero({
  seasonalBanner,
}: {
  seasonalBanner: string | null;
}) {
  return (
    <section
      id="kesfet"
      className="border-b border-white/[0.06] bg-gradient-to-b from-card/90 to-background px-4 py-16 md:py-20"
    >
      <div className="container-shell text-center">
        {seasonalBanner ? (
          <p className="mb-4 inline-block rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
            {seasonalBanner}
          </p>
        ) : null}
        <p className="mb-3 bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--success))] bg-clip-text text-sm font-semibold uppercase text-transparent">
          Fokus Mağazası
        </p>
        <h1 className="mx-auto max-w-3xl font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Türkiye&apos;nin indie oyunları burada
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Yerli yapımları keşfet, geliştiricileri destekle. Fokus mağazası,
          kütüphane, topluluk ve cüzdan akışıyla birlikte çalışır.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" variant="outline">
            <Link href="/news">Haberler</Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/dashboard">Geliştirici ol</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
