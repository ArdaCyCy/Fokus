import Image from "next/image";
import Link from "next/link";
import { Clock3, Gamepad2, ImageIcon, LayoutGrid, MessageSquare, Trophy } from "lucide-react";

import { requireAppUser } from "@/lib/auth/app-user";
import { getRecentActivity } from "@/lib/data/activity";
import { getLibrary, getProfileReviews, getWishlist } from "@/lib/data/account";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InventoryManager } from "@/components/profile/inventory-manager";
import { ProfileAppearanceEditor } from "@/components/profile/profile-appearance-editor";
import { ProfilePresenceToggle } from "@/components/profile/profile-presence-toggle";
import { fallbackCoverWithWidth } from "@/lib/constants/covers";
import { ownPresenceBadge } from "@/lib/social/presence";
import { cn } from "@/lib/utils";

const asideLinkClass =
  "block rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground";

/** Oturum / Prisma verisi için önbelleği kapatır; eski RSC + Server Action uyumsuzluğunu azaltır. */
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireAppUser("/profile");
  const [activity, library, wishlist, reviews] = await Promise.all([
    getRecentActivity(user.id, 12),
    getLibrary(user.id, { take: 48 }),
    getWishlist(user.id),
    getProfileReviews(user.id, 12),
  ]);

  const presence = ownPresenceBadge({
    appearOffline: user.appearOffline ?? false,
    lastSeenAt: user.lastSeenAt ?? null,
  });
  const favorites = wishlist.slice(0, 8);

  return (
    <div className="min-h-screen pb-16 pt-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 overflow-hidden rounded-xl border border-white/[0.07] bg-card shadow-xl">
          <div
            className={cn(
              "relative h-44 bg-cover bg-center md:h-52",
              user.profileBackground
                ? undefined
                : "bg-gradient-to-r from-accent/25 via-card to-background"
            )}
            style={
              user.profileBackground
                ? { backgroundImage: `url(${user.profileBackground})` }
                : undefined
            }
          />
          <div className="relative -mt-14 flex flex-col gap-4 px-5 pb-6 md:-mt-16 md:flex-row md:items-end md:gap-6">
            <div className="relative mx-auto size-28 shrink-0 overflow-hidden rounded-full border-4 border-card bg-muted shadow-lg md:mx-0 md:size-32">
              {user.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- kullanıcı URL'leri remotePatterns dışında olabilir
                <img
                  src={user.imageUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 text-center md:pb-1 md:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <h1 className="font-heading text-2xl font-bold md:text-3xl">
                  {user.username ?? "Oyuncu"}
                </h1>
                <ProfilePresenceToggle
                  appearOffline={user.appearOffline ?? false}
                  lastSeenAt={user.lastSeenAt ?? null}
                />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Profil · Fokus
                {user.lastSeenAt &&
                !presence.online &&
                !presence.stealth ? (
                  <>
                    {" "}
                    · Son görülme:{" "}
                    {user.lastSeenAt.toLocaleString("tr-TR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </>
                ) : null}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
                <ProfileAppearanceEditor
                  initialAvatarUrl={user.imageUrl}
                  initialBackgroundUrl={user.profileBackground}
                />
                <Badge variant="outline" className="font-normal">
                  Çerçeve: {user.profileFrame || "Standart"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_200px]">
          <div className="min-w-0 space-y-10">
            <section>
              <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
                Favori oyunlar
              </h2>
              {favorites.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  İstek listene oyun ekleyerek burada gösterebilirsin.{" "}
                  <Link href="/wishlist" className="text-accent underline-offset-4 hover:underline">
                    İstek listesi
                  </Link>
                </p>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {favorites.map((w) => (
                    <Link
                      key={w.id}
                      href={`/games/${w.game.slug}`}
                      className="group relative h-28 w-44 shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-muted"
                    >
                      <Image
                        src={
                          w.game.coverImageUrl ?? fallbackCoverWithWidth(400)
                        }
                        alt=""
                        fill
                        className="object-cover transition group-hover:opacity-90"
                        sizes="176px"
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-xs font-medium text-white line-clamp-2">
                        {w.game.title}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
                Son etkinlikler
              </h2>
              {activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">Henüz etkinlik yok.</p>
              ) : (
                <div className="space-y-2">
                  {activity.map((item) => (
                    <Card
                      key={item.id}
                      className="border-white/[0.06] bg-card/90"
                    >
                      <CardContent className="flex items-start gap-3 p-4 text-sm">
                        {item.type === "PURCHASE" ||
                        item.type === "WISHLIST_ADD" ||
                        item.type === "REVIEW" ? (
                          <Trophy className="mt-0.5 size-4 shrink-0 text-accent" />
                        ) : (
                          <Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">
                            {item.game?.title ?? "Fokus"}
                          </p>
                          <p className="text-muted-foreground">{item.message}</p>
                        </div>
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString("tr-TR")}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <section id="profile-oyunlar" className="scroll-mt-24">
              <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
                Oyunlar
              </h2>
              {library.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-muted-foreground">
                  Kütüphanende oyun yok.
                  <Button asChild className="mx-auto mt-4 block">
                    <Link href="/">Mağaza</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {library.map((entry) => (
                    <Card
                      key={entry.id}
                      className="overflow-hidden border-white/[0.07] bg-card/90"
                    >
                      <Link
                        href={`/games/${entry.game.slug}`}
                        className="relative block aspect-video"
                      >
                        <Image
                          src={
                            entry.game.coverImageUrl ??
                            fallbackCoverWithWidth(800)
                          }
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width:768px) 100vw, 33vw"
                        />
                      </Link>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          {entry.game.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        Satın alma:{" "}
                        {entry.paidAt
                          ? new Date(entry.paidAt).toLocaleDateString("tr-TR")
                          : "—"}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <section id="profile-envanter" className="scroll-mt-24">
              <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
                Envanter
              </h2>
              <InventoryManager />
            </section>

            <section id="profile-ekran" className="scroll-mt-24">
              <Card className="border-white/[0.07] bg-card/90">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ImageIcon className="size-4 text-accent" />
                    Ekran görüntüleri
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Oyunlardan aldığın kareleri burada yönetebileceksin. Yakında
                  yükleme ve gizlilik seçenekleri.
                </CardContent>
              </Card>
            </section>

            <section id="profile-incelemeler" className="scroll-mt-24">
              <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
                İncelemeler
              </h2>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Henüz inceleme yazmadın.
                </p>
              ) : (
                <ul className="space-y-3">
                  {reviews.map((r) => (
                    <li key={r.id}>
                      <Card className="border-white/[0.07] bg-card/90">
                        <CardContent className="p-4 text-sm">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <Link
                              href={`/games/${r.game.slug}`}
                              className="font-medium text-accent hover:underline"
                            >
                              {r.game.title}
                            </Link>
                            <span className="text-xs text-muted-foreground">
                              {r.rating}/10 ·{" "}
                              {new Date(r.createdAt).toLocaleDateString("tr-TR")}
                            </span>
                          </div>
                          {r.title ? (
                            <p className="mt-1 font-medium text-foreground">
                              {r.title}
                            </p>
                          ) : null}
                          {r.content ? (
                            <p className="mt-1 text-muted-foreground line-clamp-4">
                              {r.content}
                            </p>
                          ) : null}
                        </CardContent>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-0.5 rounded-xl border border-white/[0.07] bg-card/80 p-2">
              <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Profil bölümleri
              </p>
              <Link href="#profile-oyunlar" className={asideLinkClass}>
                <span className="flex items-center gap-2">
                  <Gamepad2 className="size-4 text-accent" />
                  Oyunlar
                </span>
              </Link>
              <Link href="#profile-envanter" className={asideLinkClass}>
                <span className="flex items-center gap-2">
                  <LayoutGrid className="size-4 text-accent" />
                  Envanter
                </span>
              </Link>
              <Link href="#profile-ekran" className={asideLinkClass}>
                <span className="flex items-center gap-2">
                  <ImageIcon className="size-4 text-accent" />
                  Ekran görüntüleri
                </span>
              </Link>
              <Link href="#profile-incelemeler" className={asideLinkClass}>
                <span className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-accent" />
                  İncelemeler
                </span>
              </Link>
            </nav>
          </aside>
        </div>
      </div>
    </div>
  );
}
