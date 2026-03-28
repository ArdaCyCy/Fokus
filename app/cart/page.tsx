import Image from "next/image";
import Link from "next/link";

import { requireAppUser } from "@/lib/auth/app-user";
import { getCartItems } from "@/lib/data/account";
import { evaluateCoupon } from "@/lib/commerce/coupons";
import {
  TR_VAT_RATE_PERCENT,
  vatAmountFromGrossInclusiveCents,
} from "@/lib/commerce/vat";
import { resolveCheckoutProvider } from "@/lib/commerce/checkout-config";
import { formatTryFromCents } from "@/lib/format/currency";
import { CartCheckoutButton } from "@/components/commerce/cart-checkout-button";
import { CartRemoveButton } from "@/components/commerce/cart-remove-button";
import { StorePageHero } from "@/components/store/store-page-hero";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fallbackCoverWithWidth } from "@/lib/constants/covers";

function discountPct(price: number, original?: number | null) {
  if (original == null || original <= price) return null;
  return Math.round((1 - price / original) * 100);
}

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ coupon?: string }>;
}) {
  const sp = await searchParams;
  const couponCode = sp.coupon?.trim() ?? "";
  const user = await requireAppUser("/cart");
  const items = await getCartItems(user.id);
  const total = items.reduce((acc, i) => acc + i.game.priceCents, 0);
  const coupon = evaluateCoupon(total, couponCode);
  const discount = coupon?.valid ? coupon.discountCents : 0;
  const chargedTotal = Math.max(0, total - discount);
  const vat = vatAmountFromGrossInclusiveCents(chargedTotal);
  const checkoutProvider = resolveCheckoutProvider();

  return (
    <div className="min-h-screen pb-16 pt-8">
      <div className="mx-auto max-w-6xl px-4">
        <StorePageHero
          eyebrow="Ödeme"
          title="Sepet"
          description="Satın alma öncesi son kontrol. Kupon uygulayabilir, ürünleri çıkarabilirsin."
        />

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-card/50 px-6 py-16 text-center">
            <p className="text-muted-foreground">Sepetin boş.</p>
            <Button asChild className="mt-6">
              <Link href="/games">Mağazayı gez</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
            <Card className="border-white/[0.07] bg-card/95 lg:col-span-3">
              <CardHeader className="border-b border-white/[0.06]">
                <CardTitle className="text-lg">Ürünler ({items.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-white/[0.06]">
                  {items.map((item) => {
                    const off = discountPct(
                      item.game.priceCents,
                      item.game.originalPriceCents
                    );
                    return (
                      <li
                        key={item.id}
                        className="flex gap-4 p-4 transition hover:bg-white/[0.03]"
                      >
                        <Link
                          href={`/games/${item.game.slug}`}
                          className="relative size-24 shrink-0 overflow-hidden rounded-md border border-white/10"
                        >
                          <Image
                            src={
                              item.game.coverImageUrl ??
                              fallbackCoverWithWidth(400)
                            }
                            alt=""
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/games/${item.game.slug}`}
                            className="font-medium text-foreground hover:text-accent"
                          >
                            {item.game.title}
                          </Link>
                          <div className="mt-2 flex flex-wrap items-baseline gap-2">
                            <span
                              className={
                                off != null
                                  ? "text-lg font-bold text-success"
                                  : "text-lg font-bold"
                              }
                            >
                              {formatTryFromCents(item.game.priceCents)}
                            </span>
                            {item.game.originalPriceCents &&
                            item.game.originalPriceCents >
                              item.game.priceCents ? (
                              <>
                                <span className="text-sm line-through text-muted-foreground">
                                  {formatTryFromCents(
                                    item.game.originalPriceCents
                                  )}
                                </span>
                                {off != null ? (
                                  <span className="text-xs font-medium text-emerald-400">
                                    −%{off}
                                  </span>
                                ) : null}
                              </>
                            ) : null}
                          </div>
                        </div>
                        <CartRemoveButton gameId={item.game.id} />
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>

            <Card className="h-fit border-white/[0.07] bg-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Özet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <form action="/cart" method="get" className="space-y-2">
                  <label htmlFor="coupon" className="text-xs text-muted-foreground">
                    Kupon kodu
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="coupon"
                      name="coupon"
                      defaultValue={couponCode}
                      placeholder="FOCUS10"
                      className="h-10 flex-1 rounded-md border border-white/[0.08] bg-background/60 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <Button type="submit" variant="outline" size="sm">
                      Uygula
                    </Button>
                  </div>
                </form>
                <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                  <span className="text-muted-foreground">Ara toplam</span>
                  <span className="font-medium">{formatTryFromCents(total)}</span>
                </div>
                {couponCode ? (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Kupon</span>
                    <span
                      className={
                        coupon?.valid ? "text-emerald-400" : "text-red-400"
                      }
                    >
                      {coupon?.valid
                        ? `−${formatTryFromCents(coupon.discountCents)} (${coupon.code})`
                        : (coupon?.reason ?? "Geçersiz kupon")}
                    </span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>Ödenecek (KDV dahil)</span>
                  <span className="text-success">
                    {formatTryFromCents(chargedTotal)}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Tutar KDV dahildir. Tahmini KDV payı (brüt üzerinden %
                  {TR_VAT_RATE_PERCENT}): {formatTryFromCents(vat.vatCents)}.
                </p>
                <p className="text-xs text-muted-foreground">
                  Geliştirici paylaşımı: platform ücreti ortam değişkeni{" "}
                  <code className="text-foreground/80">PLATFORM_FEE_BPS</code> ile
                  yönetilir (varsayılan %15).
                </p>
                {checkoutProvider === "wallet" ? (
                  <p className="text-xs text-amber-200/90">
                    Kart ödemesi için{" "}
                    <code className="text-foreground/90">IYZICO_API_KEY</code> ve{" "}
                    <code className="text-foreground/90">IYZICO_SECRET_KEY</code>{" "}
                    tanımlayın veya{" "}
                    <code className="text-foreground/90">
                      NEXT_PUBLIC_CHECKOUT_PROVIDER=iyzico
                    </code>{" "}
                    ile zorlayın (anahtarlar mevcut olmalı).
                  </p>
                ) : null}
                <CartCheckoutButton
                  provider={checkoutProvider}
                  gameIds={items.map((i) => i.game.id)}
                  couponCode={
                    coupon?.valid ? coupon.code : undefined
                  }
                  className="bg-[hsl(88_54%_40%)] font-semibold text-[hsl(222_22%_8%)] hover:bg-[hsl(88_54%_46%)]"
                />
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/games">Alışverişe devam et</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
