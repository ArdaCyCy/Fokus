import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const patterns = [
  "golge koprusu",
  "golge köprüsü",
  "neon pazar",
  "saha krali",
  "saha krali",
  "örnek indie",
  "ornek indie",
  "fokus 0.9",
  "demo notlari",
  "demo notları",
];

function containsFake(text) {
  const t = String(text || "").toLowerCase();
  return patterns.some((p) => t.includes(p));
}

async function main() {
  const [news, activities, notifications, walletTx, inventory] = await Promise.all([
    db.newsPost.findMany({ select: { id: true, title: true, body: true } }),
    db.activityEvent.findMany({ select: { id: true, message: true } }),
    db.notification.findMany({ select: { id: true, title: true } }),
    db.walletTransaction.findMany({ select: { id: true, description: true } }),
    db.inventoryItem.findMany({ select: { id: true, name: true } }),
  ]);

  const newsIds = news.filter((n) => containsFake(n.title) || containsFake(n.body)).map((n) => n.id);
  const activityIds = activities.filter((a) => containsFake(a.message)).map((a) => a.id);
  const notificationIds = notifications.filter((n) => containsFake(n.title)).map((n) => n.id);
  const walletIds = walletTx.filter((w) => containsFake(w.description)).map((w) => w.id);
  const inventoryIds = inventory.filter((i) => containsFake(i.name)).map((i) => i.id);

  await db.$transaction(async (tx) => {
    if (newsIds.length) await tx.newsPost.deleteMany({ where: { id: { in: newsIds } } });
    if (activityIds.length) await tx.activityEvent.deleteMany({ where: { id: { in: activityIds } } });
    if (notificationIds.length) await tx.notification.deleteMany({ where: { id: { in: notificationIds } } });
    if (walletIds.length) await tx.walletTransaction.deleteMany({ where: { id: { in: walletIds } } });
    if (inventoryIds.length) await tx.inventoryItem.deleteMany({ where: { id: { in: inventoryIds } } });
  });

  console.log(
    JSON.stringify(
      {
        deleted: {
          news: newsIds.length,
          activities: activityIds.length,
          notifications: notificationIds.length,
          walletTransactions: walletIds.length,
          inventoryItems: inventoryIds.length,
        },
      },
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

