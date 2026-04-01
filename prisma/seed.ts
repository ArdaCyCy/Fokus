import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Üretim / temiz ortam: yalnızca mağaza kategorileri.
 * Örnek oyun, kullanıcı veya yorum eklenmez (`SEED_DEMO=1` ile genişletilebilir).
 */
async function main() {
  const categories = [
    { slug: "aksiyon", name: "Aksiyon" },
    { slug: "rpg", name: "RPG" },
    { slug: "korku", name: "Korku" },
    { slug: "strateji", name: "Strateji" },
    { slug: "puzzle", name: "Puzzle" },
    { slug: "simulasyon", name: "Simülasyon" },
    { slug: "spor", name: "Spor" },
  ] as const;

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
  }

  if (process.env.SEED_DEMO === "1") {
    console.warn(
      "[seed] SEED_DEMO=1 tanımlı; tam demo seed bu repoda kaldırıldı. Eski veriyi kendin ekleyebilirsin.",
    );
  }

  console.log(
    `Seed tamam: ${categories.length} kategori (örnek oyun / kullanıcı yok).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
