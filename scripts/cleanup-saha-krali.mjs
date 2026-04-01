import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const game = await db.game.findUnique({
    where: { slug: "saha-krali" },
    select: { id: true, title: true },
  });
  if (!game) {
    console.log("no_saha_krali_found");
    return;
  }

  console.log("cleaning_game", game);

  // Satın almalar ve bağlı kazançlar
  await db.$transaction(async (tx) => {
    await tx.earning.deleteMany({ where: { gameId: game.id } });
    await tx.purchase.deleteMany({ where: { gameId: game.id } });
    await tx.review.deleteMany({ where: { gameId: game.id } });
    await tx.wishlist.deleteMany({ where: { gameId: game.id } });
    await tx.cartItem.deleteMany({ where: { gameId: game.id } });
    await tx.downloadItem.deleteMany({ where: { gameId: game.id } });
    await tx.inventoryItem.deleteMany({ where: { gameId: game.id } });
    await tx.achievement.deleteMany({ where: { gameId: game.id } });
    await tx.newsPost.deleteMany({ where: { gameId: game.id } });
    await tx.activityEvent.deleteMany({ where: { gameId: game.id } });
    await tx.cloudSaveMetadata.deleteMany({ where: { gameId: game.id } });
    await tx.gameCategory.deleteMany({ where: { gameId: game.id } });
    await tx.gift.deleteMany({ where: { gameId: game.id } });
    await tx.game.deleteMany({ where: { id: game.id } });
  });

  console.log("deleted_saha_krali");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

