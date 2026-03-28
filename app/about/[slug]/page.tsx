import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LEGAL_TOPIC_COPY } from "@/lib/legal/topic-copy";
import { LEGAL_PAGES } from "@/lib/mock/platform";

export function generateStaticParams() {
  return LEGAL_PAGES.map((p) => ({ slug: p.slug }));
}

export default async function LegalDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const current = LEGAL_PAGES.find((p) => p.slug === slug);
  if (!current) notFound();

  const copy = LEGAL_TOPIC_COPY[slug];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Card className="bg-card/70">
        <CardHeader>
          <CardTitle>{copy?.title ?? current.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          {copy ? (
            copy.paragraphs.map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <p>Bu konu için metin henüz eklenmedi.</p>
          )}
          <p className="border-t border-white/[0.06] pt-4 text-xs">
            Bu metinler bilgilendirme amaçlıdır. Şirket unvanı, adresi ve sözleşme
            şartları canlı ortamda hukuk danışmanlığı ile güncellenmelidir.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
