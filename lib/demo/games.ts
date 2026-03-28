import { demoGamesSchema, type DemoGame } from "@/lib/validations/game";

const raw: DemoGame[] = [
  {
    id: "1",
    slug: "golge-koprusu",
    title: "Gölge Köprüsü",
    developer: "Anka Studios",
    coverUrl:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    priceCents: 12900,
    originalPriceCents: 18900,
    currency: "TRY",
    rating: 4.7,
    categories: ["Aksiyon", "Korku"],
    isTurkishMade: true,
    featured: true,
    isNew: true,
  },
  {
    id: "2",
    slug: "neon-pazar",
    title: "Neon Pazar",
    developer: "Liman Interactive",
    coverUrl:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
    priceCents: 8900,
    currency: "TRY",
    rating: 4.4,
    categories: ["Strateji", "Puzzle"],
    isTurkishMade: true,
    featured: true,
    isNew: false,
  },
  {
    id: "3",
    slug: "kusatma-tahtasi",
    title: "Kuşatma Tahtası",
    developer: "Kale Bit",
    coverUrl:
      "https://images.unsplash.com/photo-1614296129915-f8587af89020?w=800&q=80",
    priceCents: 15900,
    originalPriceCents: 19900,
    currency: "TRY",
    rating: 4.6,
    categories: ["Strateji", "RPG"],
    isTurkishMade: false,
    featured: true,
    isNew: true,
  },
  {
    id: "4",
    slug: "ruzgar-koleksiyoncusu",
    title: "Rüzgar Bulmacaları",
    developer: "Ege Lume",
    coverUrl:
      "https://images.unsplash.com/photo-1515709996191-47f6383b4458?w=800&q=80",
    priceCents: 6900,
    currency: "TRY",
    rating: 4.8,
    categories: ["Puzzle"],
    isTurkishMade: true,
    featured: false,
    isNew: true,
  },
  {
    id: "5",
    slug: "demir-yolculugu",
    title: "Demir Yolculuğu",
    developer: "Vagon Team",
    coverUrl:
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80",
    priceCents: 7900,
    currency: "TRY",
    rating: 4.2,
    categories: ["Puzzle", "Strateji"],
    isTurkishMade: false,
    featured: false,
    isNew: false,
  },
  {
    id: "6",
    slug: "ay-isigi-protokolu",
    title: "Ay Işığı Protokolü",
    developer: "Luna Byte",
    coverUrl:
      "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&q=80",
    priceCents: 9900,
    originalPriceCents: 12900,
    currency: "TRY",
    rating: 4.5,
    categories: ["RPG", "Aksiyon"],
    isTurkishMade: true,
    featured: true,
    isNew: false,
  },
];

export const DEMO_GAMES: DemoGame[] = demoGamesSchema.parse(raw);

export { formatTryFromCents } from "@/lib/format/currency";
