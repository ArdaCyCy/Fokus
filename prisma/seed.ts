import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../lib/auth/password";

const prisma = new PrismaClient();

const cover = (id: string) =>
  `https://images.unsplash.com/${id}?w=1200&q=80`;

async function main() {
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "aksiyon" },
      update: {},
      create: { slug: "aksiyon", name: "Aksiyon" },
    }),
    prisma.category.upsert({
      where: { slug: "rpg" },
      update: {},
      create: { slug: "rpg", name: "RPG" },
    }),
    prisma.category.upsert({
      where: { slug: "korku" },
      update: {},
      create: { slug: "korku", name: "Korku" },
    }),
    prisma.category.upsert({
      where: { slug: "strateji" },
      update: {},
      create: { slug: "strateji", name: "Strateji" },
    }),
    prisma.category.upsert({
      where: { slug: "puzzle" },
      update: {},
      create: { slug: "puzzle", name: "Puzzle" },
    }),
    prisma.category.upsert({
      where: { slug: "simulasyon" },
      update: {},
      create: { slug: "simulasyon", name: "Simülasyon" },
    }),
    prisma.category.upsert({
      where: { slug: "spor" },
      update: {},
      create: { slug: "spor", name: "Spor" },
    }),
  ]);

  const bySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  const screenshots = (ids: string[]) =>
    ids.map((id) => `https://images.unsplash.com/${id}?w=1000&q=80`);

  const games = [
    {
      slug: "bir-oyun-slug",
      title: "Örnek Indie Macerası",
      developerName: "Fokus Studios TR",
      developerSlug: "seed_dev_focus_studios",
      shortDescription:
        "Test için kullanabileceğin örnek slug — `bir-oyun-slug`.",
      descriptionMd: `## Hikâye

Karanlık bir metropolde geçen kısa bir **indie** macerası. Bu metin \`react-markdown\` ile işlenir.

- Keşif odaklı bölümler

> Fokus vitrininde örnek oyun.`,
      coverImageUrl: cover("photo-1542751371-adc38448a05e"),
      screenshotUrls: screenshots([
        "photo-1610484826967-09c7254aa65c",
        "photo-1493711662062-fa541adb3fc8",
        "photo-1511512578047-dfb367046420",
        "photo-1552820728-8b83bb6b773f",
      ]),
      priceCents: 9900,
      originalPriceCents: 14900,
      isTurkishMade: true,
      releasedAt: new Date("2025-11-01"),
      catSlugs: ["aksiyon", "korku"] as const,
      platforms: {
        windows: true,
        mac: true,
        linux: false,
        fullController: true,
        steamDeck: "playable" as const,
      },
      systemRequirements: {
        minimum: {
          "İşletim Sistemi": "Windows 10 (64-bit)",
          İşlemci: "Intel Core i3",
          Bellek: "8 GB RAM",
          "Ekran Kartı": "DirectX 11 uyumlu",
          Depolama: "12 GB",
        },
        recommended: {
          "İşletim Sistemi": "Windows 11",
          İşlemci: "Intel Core i5",
          Bellek: "16 GB RAM",
          "Ekran Kartı": "GTX 1060 / RX 580",
          Depolama: "12 GB SSD",
        },
      },
    },
    {
      slug: "golge-koprusu",
      title: "Gölge Köprüsü",
      developerName: "Anka Studios",
      developerSlug: "anka-studios",
      shortDescription: "Sisli bir kasabada geçen aksiyon-korku deneyimi.",
      descriptionMd:
        "## Özet\n\nYerel efsaneleri takip eden bir kaşifsin. Köprüde bekleyen sırlar seni bekliyor.",
      coverImageUrl: cover("photo-1614296129915-f8587af89020"),
      screenshotUrls: screenshots([
        "photo-1557672172-298e090bd0f1",
        "photo-1509198397868-475647b2a1e5",
        "photo-1485846234645-a62644f84728",
        "photo-1440404653325-ab127d49abc1",
      ]),
      priceCents: 12900,
      originalPriceCents: 18900,
      isTurkishMade: true,
      releasedAt: new Date("2025-09-15"),
      catSlugs: ["aksiyon", "korku"] as const,
      platforms: { windows: true, mac: false, linux: true },
      systemRequirements: {
        minimum: {
          "İşletim Sistemi": "Windows 10",
          İşlemci: "4 çekirdek",
          Bellek: "8 GB RAM",
          Depolama: "20 GB",
        },
        recommended: {
          "İşletim Sistemi": "Windows 11",
          İşlemci: "6 çekirdek",
          Bellek: "16 GB RAM",
          Depolama: "20 GB SSD",
        },
      },
    },
    {
      slug: "neon-pazar",
      title: "Neon Pazar",
      developerName: "Liman Interactive",
      developerSlug: "liman-interactive",
      shortDescription: "Gelecek şehrinde kaynak ve diplomasi.",
      descriptionMd: "## Ticaret ve strateji\n\nPazarları yönet, ittifak kur.",
      coverImageUrl: cover("photo-1511512578047-dfb367046420"),
      screenshotUrls: screenshots([
        "photo-1460925895917-afdab827c52f",
        "photo-1504384308090-c894fdcc538d",
        "photo-1551288049-bebda4e38f71",
        "photo-1553877522-43269d4ea984",
      ]),
      priceCents: 8900,
      isTurkishMade: true,
      releasedAt: new Date("2025-08-01"),
      catSlugs: ["strateji", "puzzle"] as const,
      platforms: { windows: true, mac: true, linux: false },
      systemRequirements: {
        minimum: {
          "İşletim Sistemi": "Windows 10",
          Bellek: "6 GB RAM",
          Depolama: "5 GB",
        },
        recommended: {
          "İşletim Sistemi": "Windows 11",
          Bellek: "12 GB RAM",
          Depolama: "5 GB SSD",
        },
      },
    },
    {
      slug: "kusatma-tahtasi",
      title: "Kuşatma Tahtası",
      developerName: "Kale Bit",
      developerSlug: "kale-bit",
      shortDescription: "Tur tabanlı kale savunması.",
      descriptionMd: "## Savun ve genişle\n\nKuleler inşa et, dalgaları püskürt.",
      coverImageUrl: cover("photo-1610484826967-09c7254aa65c"),
      screenshotUrls: screenshots([
        "photo-1538481199709-c9c9c2d78d4c",
        "photo-1580234811497-9b28b319146b",
        "photo-1518709268805-4e9042af2176",
        "photo-1493711662062-fa541adb3fc8",
      ]),
      priceCents: 15900,
      originalPriceCents: 19900,
      isTurkishMade: false,
      releasedAt: new Date("2025-10-20"),
      catSlugs: ["strateji", "rpg"] as const,
      platforms: { windows: true, mac: true, linux: true },
      systemRequirements: {
        minimum: {
          "İşletim Sistemi": "macOS 12 / Windows 10",
          Bellek: "8 GB RAM",
          Depolama: "4 GB",
        },
        recommended: {
          Bellek: "16 GB RAM",
          Depolama: "4 GB SSD",
        },
      },
    },
    {
      slug: "ruzgar-koleksiyoncusu",
      title: "Rüzgar Bulmacaları",
      developerName: "Ege Lume",
      developerSlug: "ege-lume",
      shortDescription: "Rüzgar ve mekanik bulmacaları bir arada.",
      descriptionMd: "## Sakin bulmaca deneyimi\n\nMekanikleri öğren, koleksiyonunu tamamla.",
      coverImageUrl: cover("photo-1515709996191-47f6383b4458"),
      screenshotUrls: screenshots([
        "photo-1515709996191-47f6383b4458",
        "photo-1523475472560-d2de7047d845",
        "photo-1509223197845-458d87318791",
        "photo-1587620962725-abab7fe55159",
      ]),
      priceCents: 6900,
      isTurkishMade: true,
      releasedAt: new Date("2026-01-05"),
      catSlugs: ["puzzle"] as const,
      platforms: { windows: true, mac: true, linux: false },
      systemRequirements: {
        minimum: {
          "İşletim Sistemi": "Windows 10",
          Bellek: "4 GB RAM",
          Depolama: "2 GB",
        },
        recommended: {
          Bellek: "8 GB RAM",
          Depolama: "2 GB SSD",
        },
      },
    },
    {
      slug: "demir-yolculugu",
      title: "Demir Yolculuğu",
      developerName: "Vagon Team",
      developerSlug: "vagon-team",
      shortDescription: "Puzzle ve lojistik stratejisi.",
      descriptionMd: "## Rayları düzenle\n\nTrenleri zamanında hedefe ulaştır.",
      coverImageUrl: cover("photo-1552820728-8b83bb6b773f"),
      screenshotUrls: screenshots([
        "photo-1474487548417-35cb2641ebe9",
        "photo-1518709268805-4e9042af2176",
        "photo-1544620347-c4fd4a3d5957",
        "photo-1441928339340-21c26366b496",
      ]),
      priceCents: 7900,
      isTurkishMade: false,
      releasedAt: new Date("2025-07-10"),
      catSlugs: ["puzzle", "strateji"] as const,
      platforms: { windows: true, mac: false, linux: true },
      systemRequirements: {
        minimum: {
          "İşletim Sistemi": "Linux / Windows 10",
          Bellek: "8 GB RAM",
          Depolama: "6 GB",
        },
        recommended: {
          Bellek: "8 GB RAM",
          Depolama: "6 GB SSD",
        },
      },
    },
    {
      slug: "saha-krali",
      title: "Saha Kralı",
      developerName: "Kıta Spor Lab",
      developerSlug: "kita-spor-lab",
      shortDescription: "Yerel lig modlu spor menajerliği.",
      descriptionMd: "## Kulübünü yönet\n\nTransfer, taktik ve taraftar moralini dengele.",
      coverImageUrl: cover("photo-1461896836934-ffe607ba8211"),
      screenshotUrls: screenshots([
        "photo-1431324155629-1a6deb1dec8d",
        "photo-1574629810360-7efbbe195018",
        "photo-1508098682722-e99c43a406b2",
        "photo-1459865264687-595dec65263f",
      ]),
      priceCents: 11900,
      originalPriceCents: 13900,
      isTurkishMade: true,
      releasedAt: new Date("2025-12-01"),
      catSlugs: ["spor", "simulasyon"] as const,
      platforms: { windows: true, mac: true, linux: false },
      systemRequirements: {
        minimum: {
          "İşletim Sistemi": "Windows 10",
          Bellek: "8 GB RAM",
          Depolama: "10 GB",
        },
        recommended: {
          Bellek: "16 GB RAM",
          Depolama: "10 GB SSD",
        },
      },
    },
  ] as const;

  for (const g of games) {
    const {
      catSlugs,
      platforms,
      systemRequirements,
      screenshotUrls,
      ...gameData
    } = g;

    const game = await prisma.game.upsert({
      where: { slug: gameData.slug },
      create: {
        ...gameData,
        screenshotUrls,
        platforms,
        systemRequirements,
        isPublished: true,
        status: "PUBLISHED",
      },
      update: {
        ...gameData,
        screenshotUrls,
        platforms,
        systemRequirements,
        isPublished: true,
        status: "PUBLISHED",
      },
    });

    await prisma.gameCategory.deleteMany({ where: { gameId: game.id } });
    for (const cs of catSlugs) {
      const cat = bySlug[cs];
      if (cat) {
        await prisma.gameCategory.create({
          data: { gameId: game.id, categoryId: cat.id },
        });
      }
    }
  }

  const dev = await prisma.user.upsert({
    where: { clerkId: "seed_dev_focus_studios" },
    update: { role: "DEVELOPER", username: "focus_studios", email: "dev@fokus.example" },
    create: {
      clerkId: "seed_dev_focus_studios",
      role: "DEVELOPER",
      username: "focus_studios",
      email: "dev@fokus.example",
      walletBalanceCents: 0,
    },
  });

  const seedDevPwd = process.env.SEED_DEV_PASSWORD?.trim();
  if (seedDevPwd && seedDevPwd.length >= 8) {
    await prisma.user.update({
      where: { id: dev.id },
      data: { passwordHash: hashPassword(seedDevPwd) },
    });
  }

  // Geliştiriciye bir taslak oyun da ekleyelim (dashboard testleri için)
  await prisma.game.upsert({
    where: { slug: "taslak-oyun" },
    create: {
      slug: "taslak-oyun",
      title: "Taslak Oyun",
      developerName: dev.username ?? "focus_studios",
      developerSlug: dev.id,
      shortDescription: "Dashboard testleri için taslak oyun.",
      descriptionMd: "## Taslak\n\nBu oyun admin onayina gonderilmeden yayina alinmaz.",
      priceCents: 4900,
      currency: "TRY",
      isPublished: false,
      status: "DRAFT",
      coverImageUrl: cover("photo-1493711662062-fa541adb3fc8"),
      screenshotUrls: screenshots(["photo-1493711662062-fa541adb3fc8"]),
      platforms: { windows: true, mac: false, linux: false },
      systemRequirements: { minimum: { Bellek: "4 GB RAM", Depolama: "2 GB" } },
    },
    update: { status: "DRAFT", isPublished: false },
  });

  const u1 = await prisma.user.upsert({
    where: { clerkId: "seed_user_focus_1" },
    update: {},
    create: {
      clerkId: "seed_user_focus_1",
      username: "oyuncu_ayse",
      email: "ayse@example.com",
      walletBalanceCents: 50000,
    },
  });
  const u2 = await prisma.user.upsert({
    where: { clerkId: "seed_user_focus_2" },
    update: {},
    create: {
      clerkId: "seed_user_focus_2",
      username: "indie_can",
      email: "can@example.com",
      walletBalanceCents: 25000,
    },
  });

  // Cüzdan işlem geçmişi (topup) seed
  await prisma.walletTransaction.deleteMany({
    where: {
      userId: { in: [u1.id, u2.id] },
      description: "Baslangic yuklemesi",
    },
  });
  await prisma.walletTransaction.createMany({
    data: [
      { userId: u1.id, amountCents: 50000, type: "TOPUP", description: "Baslangic yuklemesi" },
      { userId: u2.id, amountCents: 25000, type: "TOPUP", description: "Baslangic yuklemesi" },
    ],
  });

  // Haberler seed
  const g1 = await prisma.game.findUnique({ where: { slug: "golge-koprusu" }, select: { id: true, title: true } });
  const g2 = await prisma.game.findUnique({ where: { slug: "neon-pazar" }, select: { id: true, title: true } });
  await prisma.newsPost.deleteMany({
    where: {
      authorId: dev.id,
      title: { in: ["Bahar Etkinligi Basladi", "1.1 Denge Guncellemesi"] },
    },
  });
  await prisma.newsPost.createMany({
    data: [
      {
        authorId: dev.id,
        gameId: g1?.id ?? null,
        kind: "EVENT",
        title: "Bahar Etkinligi Basladi",
        body: "Hafta sonu boyunca gorevleri tamamlayanlara ozel profil cercevesi hediye.",
      },
      {
        authorId: dev.id,
        gameId: g2?.id ?? null,
        kind: "PATCH_NOTE",
        title: "1.1 Denge Guncellemesi",
        body: "Performans iyilestirmeleri, ekonomi dengelemesi ve hata duzeltmeleri.",
      },
    ],
  });

  // Bildirim seed
  await prisma.notification.deleteMany({
    where: {
      userId: { in: [u1.id, u2.id] },
      title: { in: ["Fokus'a hos geldin!", "Topluluk pazarinda yeni ilanlar var."] },
    },
  });
  await prisma.notification.createMany({
    data: [
      { userId: u1.id, type: "INFO", title: "Fokus'a hos geldin!" },
      { userId: u2.id, type: "INFO", title: "Topluluk pazarinda yeni ilanlar var." },
    ],
  });

  // Envanter + pazar ilanı seed (u2 satar, u1 gorebilir)
  let inv = await prisma.inventoryItem.findFirst({
    where: { userId: u2.id, name: "Neon Cerceve" },
  });
  if (!inv) {
    inv = await prisma.inventoryItem.create({
      data: { userId: u2.id, name: "Neon Cerceve", gameId: g2?.id ?? null },
    });
  }
  await prisma.marketListing.upsert({
    where: { inventoryItemId: inv.id },
    create: { sellerId: u2.id, inventoryItemId: inv.id, priceCents: 1250 },
    update: { soldAt: null, priceCents: 1250 },
  });

  const gDemo = await prisma.game.findUnique({
    where: { slug: "bir-oyun-slug" },
  });
  if (gDemo) {
    await prisma.review.upsert({
      where: {
        userId_gameId: { userId: u1.id, gameId: gDemo.id },
      },
      update: { rating: 5, content: "Cok iyi atmosfer!", title: "Bayildim" },
      create: {
        userId: u1.id,
        gameId: gDemo.id,
        rating: 5,
        title: "Bayildim",
        content: "Cok iyi atmosfer!",
      },
    });
    await prisma.review.upsert({
      where: {
        userId_gameId: { userId: u2.id, gameId: gDemo.id },
      },
      update: { rating: 4, content: "Kisa ama etkileyici.", title: "Guzel" },
      create: {
        userId: u2.id,
        gameId: gDemo.id,
        rating: 4,
        title: "Guzel",
        content: "Kisa ama etkileyici.",
      },
    });

    await prisma.achievement.deleteMany({ where: { gameId: gDemo.id } });
    await prisma.achievement.createMany({
      data: [
        {
          gameId: gDemo.id,
          slug: "first-step",
          title: "Ilk adim",
          description: "Oyuna giris yap.",
        },
        {
          gameId: gDemo.id,
          slug: "explorer",
          title: "Kasif",
          description: "Tum bolgeleri kesfet.",
        },
      ],
    });
  }

  const gGolge = await prisma.game.findUnique({
    where: { slug: "golge-koprusu" },
  });
  if (gGolge) {
    await prisma.review.upsert({
      where: {
        userId_gameId: { userId: u1.id, gameId: gGolge.id },
      },
      update: { rating: 5, title: "Tavsiye", content: "Korku sevenlere." },
      create: {
        userId: u1.id,
        gameId: gGolge.id,
        rating: 5,
        title: "Tavsiye",
        content: "Korku sevenlere.",
      },
    });
  }

}

main()
  .then(() => console.log("Seed tamam."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
