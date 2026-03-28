import { AddToWishlistButton } from "@/components/commerce/add-to-wishlist-button";
import { cn } from "@/lib/utils";

export function GameCardWishlistButton({
  gameId,
  className,
}: {
  gameId: string;
  className?: string;
}) {
  return (
    <AddToWishlistButton
      gameId={gameId}
      iconOnly
      className={cn(
        "size-9 border border-border/80 bg-background/90 shadow-md backdrop-blur hover:bg-background",
        className
      )}
    />
  );
}
