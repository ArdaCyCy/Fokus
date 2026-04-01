import { NextResponse } from "next/server";

import { db } from "@/lib/db";

/** Mağaza filtreleri ve geliştirici formu için herkese açık kategori listesi. */
export async function GET() {
  try {
    const rows = await db.category.findMany({
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    });
    return NextResponse.json({ categories: rows });
  } catch {
    return NextResponse.json({ categories: [] }, { status: 200 });
  }
}
