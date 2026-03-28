import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAppUser } from "@/lib/auth/app-user";
import { db } from "@/lib/db";

const bodySchema = z.object({
  title: z.string().min(5).max(140),
  body: z.string().min(20).max(5000),
  kind: z.enum(["PATCH_NOTE", "EVENT", "NEWS"]),
  gameId: z.string().optional(),
});

export async function GET() {
  const posts = await db.newsPost.findMany({
    orderBy: { publishedAt: "desc" },
    take: 50,
    include: {
      game: { select: { title: true } },
      author: { select: { username: true } },
    },
  });
  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  const user = await requireAppUser("/dashboard/news");
  if (user.role !== "DEVELOPER" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
  }
  const data = parsed.data;
  if (data.gameId) {
    const game = await db.game.findFirst({
      where: {
        id: data.gameId,
        ...(user.role === "ADMIN" ? {} : { developerSlug: user.id }),
      },
      select: { id: true },
    });
    if (!game) {
      return NextResponse.json({ error: "Oyun bulunamadı." }, { status: 404 });
    }
  }

  await db.newsPost.create({
    data: {
      authorId: user.id,
      gameId: data.gameId || null,
      title: data.title,
      body: data.body,
      kind: data.kind,
    },
  });
  return NextResponse.json({ ok: true });
}
