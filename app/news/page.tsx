import Link from "next/link";
import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { isDatabaseUnavailableError } from "@/lib/db/connection-error";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StorePageHero } from "@/components/store/store-page-hero";
import { Button } from "@/components/ui/button";

type NewsItem = Prisma.NewsPostGetPayload<{
  include: { game: { select: { title: true; slug: true } } };
}>;

function kindLabel(kind: "PATCH_NOTE" | "EVENT" | "NEWS") {
  if (kind === "PATCH_NOTE") return "Yama notu";
  if (kind === "EVENT") return "Etkinlik";
  return "Haber";
}

export default async function NewsPage() {
  let items: NewsItem[] = [];
  let dbUnavailable = false;
  try {
    items = await db.newsPost.findMany({
      orderBy: { publishedAt: "desc" },
      take: 50,
      include: {
        game: { select: { title: true, slug: true } },
      },
    });
  } catch (e) {
    if (isDatabaseUnavailableError(e)) {
      dbUnavailable = true;
    } else {
      throw e;
    }
  }

  return (
    <div className="min-h-screen pb-16 pt-8">
      <div className="mx-auto max-w-6xl px-4">
        <StorePageHero
          eyebrow="Güncellemeler"
          title="Haberler"
          description="Oyun yamaları, etkinlik duyuruları ve platform haberleri."
        />

        {dbUnavailable ? (
          <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Veritabanına bağlanılamıyor.{" "}
            <code className="rounded bg-black/30 px-1">DATABASE_URL</code> değerini{" "}
            <code className="rounded bg-black/30 px-1">.env.local</code> içinde kontrol et; ardından{" "}
            <code className="rounded bg-black/30 px-1">npx prisma db push</code> çalıştır.
          </div>
        ) : null}

        <div className="space-y-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className="border-white/[0.07] bg-card/95 transition hover:border-accent/25"
            >
              <CardHeader className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{kindLabel(item.kind)}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.publishedAt).toLocaleDateString("tr-TR", {
                      dateStyle: "medium",
                    })}
                  </span>
                </div>
                <CardTitle className="text-lg leading-snug">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Oyun:{" "}
                  {item.game ? (
                    <Link
                      href={`/games/${item.game.slug}`}
                      className="font-medium text-accent hover:underline"
                    >
                      {item.game.title}
                    </Link>
                  ) : (
                    "Fokus platformu"
                  )}
                </p>
                <p className="leading-relaxed text-muted-foreground">{item.body}</p>
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && !dbUnavailable ? (
            <div className="rounded-xl border border-dashed border-white/10 py-12 text-center text-sm text-muted-foreground">
              Henüz haber yok.
              <Button asChild variant="outline" className="mx-auto mt-4 block">
                <Link href="/">Mağazaya dön</Link>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
