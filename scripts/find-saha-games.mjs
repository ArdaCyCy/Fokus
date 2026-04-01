import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const games = await db.game.findMany({
    where: { title: { contains: "Saha", mode: "insensitive" } },
    select: { id: true, slug: true, title: true, status: true, isPublished: true },
  });
  console.log(JSON.stringify(games, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

