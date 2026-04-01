import Image from "next/image";
import Link from "next/link";
import { Download, Library, Play, Trophy } from "lucide-react";

import { requireAppUser } from "@/lib/auth/app-user";
import { countLibrary, getLibrary } from "@/lib/data/account";
import { DownloadQueue } from "@/components/library/download-queue";
import { LibraryTabsShell } from "@/components/library/library-tabs-shell";
import { RefundRequestButton } from "@/components/library/refund-request-button";
import { StartDownloadButton } from "@/components/library/start-download-button";
import { StorePageHero } from "@/components/store/store-page-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { fallbackCoverWithWidth } from "@/lib/constants/covers";

const PAGE_SIZE = 12;

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const user = await requireAppUser("/library");
  const [library, total] = await Promise.all([
    getLibrary(user.id, { skip, take: PAGE_SIZE }),
    countLibrary(user.id),
  ]);
  const hasPrev = page > 1;
  const hasNext = skip + library.length < total;

  return (
    <div className="min-h-screen pb-16 pt-8">
      <div className="mx-auto max-w-6xl px-4">
        <StorePageHero
          eyebrow="Kütüphane"
          title="Koleksiyonun"
          description="Satın aldığın oyunlar, indirme kuyruğu ve demolar. Mağaza sayfasından yeni başlıklar ekleyebilirsin."
        />

        <Card className="mb-6 border-dashed border-white/[0.12] bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Oyun hediye et</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Cüzdan bakiyen ile hediye satın alabilir ve alıcıya claim linki gönderebilirsin.{" "}
            <Link href="/gifts" className="text-accent hover:underline">
              Hediye merkezine git
            </Link>
            .
          </CardContent>
        </Card>

        <LibraryTabsShell className="space-y-6">
          <TabsList className="h-auto flex-wrap gap-1 border border-white/[0.06] bg-card/90 p-1">
            <TabsTrigger
              value="games"
              className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              <Library className="size-4" />
              Oyunlarım
            </TabsTrigger>
            <TabsTrigger
              value="downloads"
              className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              <Download className="size-4" />
              İndirmeler
            </TabsTrigger>
          </TabsList>

          <TabsContent value="games" className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {total === 0
                  ? "Henüz satın alınmış oyun yok."
                  : `${skip + 1}–${skip + library.length} / ${total} oyun`}
              </p>
              <div className="flex flex-wrap gap-2">
                {hasPrev ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={
                        page === 2 ? "/library" : `/library?page=${page - 1}`
                      }
                    >
                      Önceki
                    </Link>
                  </Button>
                ) : null}
                {hasNext ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/library?page=${page + 1}`}>Sonraki</Link>
                  </Button>
                ) : null}
                <Button variant="secondary" size="sm" asChild>
                  <Link href="/">Mağazaya git</Link>
                </Button>
              </div>
            </div>

            {total === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-card/50 px-6 py-16 text-center">
                <p className="text-muted-foreground">
                  Kütüphanen boş. İlk oyununu mağazadan seç.
                </p>
                <Button asChild className="mt-6">
                  <Link href="/">Keşfet</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {library.map((entry) => (
                  <Card
                    key={entry.id}
                    className="group overflow-hidden border-white/[0.07] bg-card/90 shadow-lg transition hover:border-accent/35 hover:shadow-accent/5"
                  >
                    <Link
                      href={`/games/${entry.game.slug}`}
                      className="relative block aspect-video overflow-hidden"
                    >
                      <Image
                        src={
                          entry.game.coverImageUrl ??
                          fallbackCoverWithWidth(800)
                        }
                        alt=""
                        fill
                        className="object-cover transition duration-300 group-hover:scale-[1.03]"
                        sizes="(max-width:768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-md bg-black/65 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm opacity-0 transition group-hover:opacity-100">
                        <Play className="size-3.5" />
                        Mağaza sayfası
                      </span>
                    </Link>
                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-2 text-base leading-snug">
                        {entry.game.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <p className="text-xs text-muted-foreground">
                        Satın alma:{" "}
                        {entry.paidAt
                          ? new Date(entry.paidAt).toLocaleDateString("tr-TR", {
                              dateStyle: "medium",
                            })
                          : "—"}
                      </p>
                      <div className="flex items-start gap-2 rounded-md border border-white/[0.06] bg-black/20 px-2.5 py-2 text-xs text-muted-foreground">
                        <Trophy
                          className="mt-0.5 size-3.5 shrink-0 text-accent"
                          aria-hidden
                        />
                        <span>
                          Başarım ilerlemesi istemci ile senkronize olacak.
                        </span>
                      </div>
                      <p className="text-xs text-emerald-400/90">
                        Lisans aktif
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button className="flex-1 gap-1.5" size="sm" asChild>
                          <Link href={`/games/${entry.game.slug}`}>
                            <Play className="size-4" />
                            Detay / Oyna
                          </Link>
                        </Button>
                        <StartDownloadButton gameId={entry.game.id} />
                      </div>
                      <RefundRequestButton purchaseId={entry.id} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="downloads">
            <div id="indirmeler" className="scroll-mt-28">
              <DownloadQueue />
            </div>
          </TabsContent>
        </LibraryTabsShell>
      </div>
    </div>
  );
}
