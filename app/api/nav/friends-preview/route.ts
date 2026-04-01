import { NextResponse } from "next/server";

import { getOptionalAppUser } from "@/lib/auth/app-user";
import { db } from "@/lib/db";
import { appearsOnlineForFriends } from "@/lib/social/presence";

/** Navbar arkadaşlar önizlemesi — giriş yoksa çevrim içi sayısı 0. */
export async function GET() {
  const user = await getOptionalAppUser();
  if (!user) {
    return NextResponse.json({ signedIn: false, onlineCount: 0 });
  }

  const friendships = await db.friend.findMany({
    where: {
      OR: [{ senderId: user.id }, { receiverId: user.id }],
      acceptedAt: { not: null },
    },
    include: {
      sender: {
        select: {
          id: true,
          lastSeenAt: true,
          appearOffline: true,
        },
      },
      receiver: {
        select: {
          id: true,
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
      const target = f.senderId === user.id ? f.sender : f.receiver;
      return target;
    })
    .filter((f) => !hidden.has(f.id));

  const onlineCount = friends.filter((f) =>
    appearsOnlineForFriends({
      appearOffline: f.appearOffline,
      lastSeenAt: f.lastSeenAt,
    }),
  ).length;

  return NextResponse.json({ signedIn: true, onlineCount });
}
