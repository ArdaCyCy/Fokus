import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAppUser } from "@/lib/auth/app-user";
import { db } from "@/lib/db";

const addSchema = z.object({
  email: z.string().email(),
});

export async function GET() {
  const user = await requireAppUser("/friends");
  const friendships = await db.friend.findMany({
    where: {
      OR: [{ senderId: user.id }, { receiverId: user.id }],
      acceptedAt: { not: null },
    },
    orderBy: { createdAt: "desc" },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          email: true,
          imageUrl: true,
          lastSeenAt: true,
          appearOffline: true,
        },
      },
      receiver: {
        select: {
          id: true,
          username: true,
          email: true,
          imageUrl: true,
          lastSeenAt: true,
          appearOffline: true,
        },
      },
    },
  });

  const blocks = await db.userBlock.findMany({
    where: {
      OR: [{ blockerId: user.id }, { blockedId: user.id }],
    },
    select: { blockerId: true, blockedId: true },
  });
  const hidden = new Set<string>();
  for (const b of blocks) {
    if (b.blockerId === user.id) hidden.add(b.blockedId);
    if (b.blockedId === user.id) hidden.add(b.blockerId);
  }

  const friends = friendships
    .map((f) => {
      const target = f.senderId === user.id ? f.receiver : f.sender;
      return { friendshipId: f.id, ...target };
    })
    .filter((f) => !hidden.has(f.id));

  return NextResponse.json({ friends });
}

export async function POST(req: Request) {
  const user = await requireAppUser("/friends");
  const parsed = addSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz e-posta." }, { status: 400 });
  }

  const target = await db.user.findFirst({
    where: { email: parsed.data.email.toLowerCase() },
    select: { id: true },
  });
  if (!target || target.id === user.id) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
  }

  const blocked = await db.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: user.id, blockedId: target.id },
        { blockerId: target.id, blockedId: user.id },
      ],
    },
    select: { id: true },
  });
  if (blocked) {
    return NextResponse.json({ error: "Engelli kullaniciya istek gonderilemez." }, { status: 403 });
  }

  const existing = await db.friend.findFirst({
    where: {
      OR: [
        { senderId: user.id, receiverId: target.id },
        { senderId: target.id, receiverId: user.id },
      ],
    },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ error: "Bu kisi zaten listende." }, { status: 409 });
  }

  await db.friend.create({
    data: { senderId: user.id, receiverId: target.id, acceptedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await requireAppUser("/friends");
  const url = new URL(req.url);
  const friendshipId = url.searchParams.get("friendshipId");
  if (!friendshipId) {
    return NextResponse.json({ error: "Eksik istek." }, { status: 400 });
  }

  await db.friend.deleteMany({
    where: {
      id: friendshipId,
      OR: [{ senderId: user.id }, { receiverId: user.id }],
    },
  });
  return NextResponse.json({ ok: true });
}
