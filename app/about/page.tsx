import Link from "next/link";

import { LEGAL_PAGES } from "@/lib/mock/platform";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-heading text-3xl font-bold">Fokus hakkında</h1>
      <p className="mt-2 text-muted-foreground">
        Fokus, Türkiye odaklı indie oyun pazaryeridir. Bağımsız geliştiricileri destekler; oyunculara güvenli bir
        satın alma ve kütüphane deneyimi sunar.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {LEGAL_PAGES.map((page) => (
          <Card key={page.slug} className="bg-card/70">
            <CardHeader>
              <CardTitle className="text-base">{page.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/about/${page.slug}`} className="text-sm text-accent hover:underline">
                Metni görüntüle
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
