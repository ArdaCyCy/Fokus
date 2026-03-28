import { PurchaseStatus } from "@prisma/client";

import { db } from "@/lib/db";

export async function getWishlist(userId: string) {
  return db.wishlist.findMany({
    where: { userId },
    include: {
      game: {
        select: {
          id: true,
          slug: true,
          title: true,
          priceCents: true,
          coverImageUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCartItems(userId: string) {
  return db.cartItem.findMany({
    where: { userId },
    include: {
      game: {
        select: {
          id: true,
          slug: true,
          title: true,
          priceCents: true,
          originalPriceCents: true,
          coverImageUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLibrary(
  userId: string,
  opts?: { skip?: number; take?: number }
) {
  const skip = opts?.skip ?? 0;
  const take = opts?.take ?? 24;
  return db.purchase.findMany({
    where: { userId, status: PurchaseStatus.PAID },
    include: {
      game: {
        select: {
          id: true,
          title: true,
          slug: true,
          coverImageUrl: true,
          releasedAt: true,
        },
      },
    },
    orderBy: { paidAt: "desc" },
    skip,
    take,
  });
}

export async function countLibrary(userId: string) {
  return db.purchase.count({
    where: { userId, status: PurchaseStatus.PAID },
  });
}

export async function getProfileReviews(userId: string, take = 24) {
  return db.review.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      game: {
        select: { slug: true, title: true, coverImageUrl: true },
      },
    },
  });
}
