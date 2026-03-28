import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/app-user";
import { getLibrary } from "@/lib/data/account";

export async function GET() {
  const user = await requireAppUser("/library");
  const items = await getLibrary(user.id);
  return NextResponse.json({ items });
}
