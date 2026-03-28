import { NextResponse } from "next/server";

import { getPublishedGames } from "@/lib/data/games";
import { gameListRowToCardData } from "@/lib/mappers/game-card";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const skip = Math.max(0, Number.parseInt(searchParams.get("skip") ?? "0", 10) || 0);
  const rawTake = Number.parseInt(searchParams.get("take") ?? "12", 10) || 12;
  const take = Math.min(24, Math.max(1, rawTake));
  const modeRaw = searchParams.get("mode");
  const mode = modeRaw === "new" ? "new" : "popular";

  const rows = await getPublishedGames({
    mode,
    take,
    skip,
  });

  return NextResponse.json({
    games: rows.map(gameListRowToCardData),
    nextSkip: skip + rows.length,
    hasMore: rows.length === take,
  });
}
