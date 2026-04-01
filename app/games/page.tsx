import { StoreGamesView } from "@/components/games/store-games-view";

export default function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; page?: string; mode?: string }>;
}) {
  return <StoreGamesView searchParams={searchParams} basePath="/games" />;
}
