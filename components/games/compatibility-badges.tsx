import type { GamePlatforms } from "@/lib/types/game";
import { Badge } from "@/components/ui/badge";

export function CompatibilityBadges({ platforms }: { platforms: GamePlatforms }) {
  const chips: { key: string; label: string; variant: "default" | "secondary" | "outline" }[] = [];

  const pcCount = [platforms.windows, platforms.mac, platforms.linux].filter(Boolean).length;
  if (pcCount >= 2) {
    chips.push({ key: "pc", label: "Coklu PC platformu", variant: "secondary" });
  } else if (platforms.windows) {
    chips.push({ key: "win", label: "Windows", variant: "secondary" });
  }

  if (platforms.fullController) {
    chips.push({ key: "pad", label: "Tam controller desteği", variant: "outline" });
  }

  if (platforms.steamDeck === "verified") {
    chips.push({ key: "deck-v", label: "Deck: Doğrulandı", variant: "default" });
  } else if (platforms.steamDeck === "playable") {
    chips.push({ key: "deck-p", label: "Deck: Oynanabilir", variant: "outline" });
  } else if (platforms.steamDeck === "unsupported") {
    chips.push({ key: "deck-n", label: "Deck: Desteklenmiyor", variant: "outline" });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((c) => (
        <Badge key={c.key} variant={c.variant} className="text-xs font-normal">
          {c.label}
        </Badge>
      ))}
    </div>
  );
}
