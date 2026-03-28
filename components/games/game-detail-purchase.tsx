"use client";

import { AddToCartButton } from "@/components/commerce/add-to-cart-button";
import { CartCheckoutButton } from "@/components/commerce/cart-checkout-button";
import { AddToWishlistButton } from "@/components/commerce/add-to-wishlist-button";
import type { CheckoutProviderMode } from "@/lib/commerce/checkout-config";

export function GameDetailPurchase({
  gameId,
  checkoutProvider,
}: {
  gameId: string;
  checkoutProvider: CheckoutProviderMode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Hesabına lisans tanımlanır; kartlı ödemeler İyzico ödeme formu ile, bakiye
        ile ödemeler anında cüzdandan düşer.
      </p>
      <CartCheckoutButton
        provider={checkoutProvider}
        gameIds={[gameId]}
        variant="default"
        className="bg-[hsl(88_54%_40%)] font-semibold text-[hsl(222_22%_8%)] shadow-[0_0_20px_hsl(88_54%_40%/0.35] hover:bg-[hsl(88_54%_46%)]"
      />
      <AddToCartButton gameId={gameId} className="w-full" size="lg" />
      <AddToWishlistButton gameId={gameId} className="w-full" />
    </div>
  );
}
