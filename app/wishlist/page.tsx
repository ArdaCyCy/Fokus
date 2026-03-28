import Image from "next/image";
import Link from "next/link";
import { Tag } from "lucide-react";

import { requireAppUser } from "@/lib/auth/app-user";
import { getWishlist } from "@/lib/data/account";
import { formatTryFromCents } from "@/lib/format/currency";
import { WishlistRemoveButton } from "@/components/commerce/wishlist-remove-button";
import { StorePageHero } from "@/components/store/store-page-hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fallbackCoverWithWidth } from "@/lib/constants/covers";

export default async function WishlistPage() {
  const user = await requireAppUser("/wishlist");
  const list = await getWishlist(user.id);

  return (
    <div className="min-h-screen pb-16 pt-8">
      <div className="mx-auto max-w-6xl px-4">
        <StorePageHero
          eyebrow="Takip listesi"
          title="İstek listesi"
          description="İndirimleri takip etmek istediğin oyunlar. Satın aldığında otomatik listeden düşmez — istersen kaldır."
        />

        {list.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-card/50 px-6 py-16 text-center">
            <p className="text-muted-foreground">Listen boş.</p>
            <Button asChild className="mt-6">
              <Link href="/games">Mağazayı keşfet</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-4">
            {list.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-4 rounded-xl border border-white/[0.07] bg-card/95 p-4 shadow-md sm:flex-row sm:items-center"
              >
                <Link
                  href={`/games/${item.game.slug}`}
                  className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg border border-white/10 sm:w-52"
                >
                  <Image
                    src={
                      item.game.coverImageUrl ?? fallbackCoverWithWidth(600)
                    }
                    alt=""
                    fill
                    className="object-cover transition hover:opacity-95"
                    sizes="208px"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/games/${item.game.slug}`}
                    className="font-heading text-lg font-semibold text-foreground hover:text-accent"
                  >
                    {item.game.title}
                  </Link>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-lg font-bold text-success">
                      {formatTryFromCents(item.game.priceCents)}
                    </span>
                    <Badge variant="outline" className="gap-1 text-[11px]">
                      <Tag className="size-3" />
                      Takipte
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Fiyat değişikliklerinde bildirim için gelecekte e-posta /
                    uygulama tercihleri kullanılacak.
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col">
                  <Button asChild>
                    <Link href={`/games/${item.game.slug}`}>Mağaza sayfası</Link>
                  </Button>
                  <WishlistRemoveButton gameId={item.game.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
