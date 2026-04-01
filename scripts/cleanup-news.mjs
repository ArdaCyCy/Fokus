import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const deleted = await db.newsPost.deleteMany({});
  console.log(`deleted_news=${deleted.count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

