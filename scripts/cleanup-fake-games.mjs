import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const db = new PrismaClient();

const slugs = [
  "bir-oyun-slug",
  "ornek-indie-macerasi",
  "golge-koprusu",
  "neon-pazar",
  "kusatma-tahtasi",
  "ruzgar-koleksiyoncusu",
  "demir-yolculugu",
  "ay-isigi-protokolu",
];

const titles = [
  "Örnek Indie Macerası",
  "Gölge Köprüsü",
  "Neon Pazar",
  "Kuşatma Tahtası",
  "Rüzgar Bulmacaları",
  "Demir Yolculuğu",
  "Ay Işığı Protokolü",
];

try {
  const games = await db.game.findMany({
    where: {
      OR: [{ slug: { in: slugs } }, { title: { in: titles } }],
    },
    select: { id: true },
  });
  const ids = games.map((g) => g.id);
  if (ids.length === 0) {
    console.log("deleted_games=0");
  } else {
    await db.purchase.deleteMany({ where: { gameId: { in: ids } } });
    const deleted = await db.game.deleteMany({ where: { id: { in: ids } } });
    console.log(`deleted_games=${deleted.count}`);
  }
} finally {
  await db.$disconnect();
}

