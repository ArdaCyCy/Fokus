import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const rows = await db.newsPost.findMany({
    orderBy: { publishedAt: "desc" },
    take: 30,
    select: { id: true, title: true, body: true, publishedAt: true },
  });
  console.log(
    JSON.stringify(
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        body: (r.body || "").slice(0, 120),
        publishedAt: r.publishedAt,
      })),
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

