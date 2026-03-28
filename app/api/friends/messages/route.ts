import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAppUser } from "@/lib/auth/app-user";
import { db } from "@/lib/db";

const postSchema = z.object({
  friendUserId: z.string().min(1),
  body: z.string().trim().min(1).max(2000),
});

async function areAcceptedFriends(a: string, b: string): Promise<boolean> {
  const f = await db.friend.findFirst({
    where: {
      acceptedAt: { not: null },
      OR: [
        { senderId: a, receiverId: b },
        { senderId: b, receiverId: a },
      ],
    },
    select: { id: true },
  });
  return Boolean(f);
}

export async function GET(req: NextRequest) {
  const user = await requireAppUser("/friends");
  const friendId = req.nextUrl.searchParams.get("friendUserId")?.trim();
  if (!friendId) {
    return NextResponse.json({ error: "friendUserId gerekli." }, { status: 400 });
  }
  if (!(await areAcceptedFriends(user.id, friendId))) {
    return NextResponse.json({ error: "Arkadaş değilsiniz." }, { status: 403 });
  }

  const messages = await db.friendMessage.findMany({
    where: {
      OR: [
        { senderId: user.id, receiverId: friendId },
        { senderId: friendId, receiverId: user.id },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: {
      id: true,
      senderId: true,
      body: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const user = await requireAppUser("/friends");
  const parsed = postSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz mesaj." }, { status: 400 });
  }
  const { friendUserId, body } = parsed.data;
  if (friendUserId === user.id) {
    return NextResponse.json({ error: "Kendine mesaj gönderilemez." }, { status: 400 });
  }
  if (!(await areAcceptedFriends(user.id, friendUserId))) {
    return NextResponse.json({ error: "Arkadaş değilsiniz." }, { status: 403 });
  }

  const msg = await db.friendMessage.create({
    data: {
      senderId: user.id,
      receiverId: friendUserId,
      body,
    },
    select: { id: true, senderId: true, body: true, createdAt: true },
  });

  return NextResponse.json({ message: msg });
}
