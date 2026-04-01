import { StoreGamesView } from "@/components/games/store-games-view";

/** Kök URL doğrudan mağaza (yönlendirme yok; paylaşılan link adres çubuğunda kalır). */
export default function RootPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; page?: string; mode?: string }>;
}) {
  return <StoreGamesView searchParams={searchParams} basePath="/" />;
}
