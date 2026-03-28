import { NextResponse } from "next/server";

import { getOptionalAppUser } from "@/lib/auth/app-user";
import { getLibrary } from "@/lib/data/account";

/** Navbar önizlemesi — giriş yoksa boş dizi (redirect yok). */
export async function GET() {
  const user = await getOptionalAppUser();
  if (!user) {
    return NextResponse.json({ games: [] });
  }
  const items = await getLibrary(user.id, { take: 6 });
  const games = items.map((e) => ({
    id: e.game.id,
    slug: e.game.slug,
    title: e.game.title,
    coverImageUrl: e.game.coverImageUrl,
  }));
  return NextResponse.json({ games });
}
