import { fallbackCoverWithWidth } from "@/lib/constants/covers";

export type ActivityItem = {
  id: string;
  type: "played" | "achievement" | "purchase" | "review";
  game: string;
  detail: string;
  at: string;
};

export type LibraryGame = {
  id: string;
  title: string;
  coverUrl: string;
  playtimeHours: number;
  achievementsUnlocked: number;
  achievementsTotal: number;
  lastPlayed: string;
  installed: boolean;
  patchAvailable?: boolean;
};

export const PROFILE_ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    type: "achievement",
    game: "Gölge Köprüsü",
    detail: "\"Korkusuz\" başarımı açıldı",
    at: "2 saat önce",
  },
  {
    id: "a2",
    type: "played",
    game: "Neon Pazar",
    detail: "3.2 saat oynandı",
    at: "Dün",
  },
  {
    id: "a3",
    type: "purchase",
    game: "Saha Kralı",
    detail: "Demo satın alım tamamlandı",
    at: "3 gün önce",
  },
  {
    id: "a4",
    type: "review",
    game: "Örnek Indie Macerası",
    detail: "İnceleme bırakıldı (5/5)",
    at: "1 hafta önce",
  },
];

export const LIBRARY_GAMES: LibraryGame[] = [
  {
    id: "l1",
    title: "Örnek Indie Macerası",
    coverUrl: fallbackCoverWithWidth(800),
    playtimeHours: 12.4,
    achievementsUnlocked: 8,
    achievementsTotal: 24,
    lastPlayed: "Bugün",
    installed: true,
    patchAvailable: true,
  },
  {
    id: "l2",
    title: "Gölge Köprüsü",
    coverUrl: "https://images.unsplash.com/photo-1614296129915-f8587af89020?w=800&q=80",
    playtimeHours: 43.8,
    achievementsUnlocked: 31,
    achievementsTotal: 50,
    lastPlayed: "Dün",
    installed: true,
  },
  {
    id: "l3",
    title: "Neon Pazar",
    coverUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
    playtimeHours: 6.2,
    achievementsUnlocked: 4,
    achievementsTotal: 18,
    lastPlayed: "5 gün önce",
    installed: false,
  },
];

export const NEWS_FEED = [
  {
    id: "n1",
    title: "Fokus 0.9 demo notları",
    game: "Platform",
    kind: "Patch Note",
    date: "27 Mar 2026",
    body: "Mağaza filtreleri, yeni profil aktivite kartları ve indirme kuyruğu demo modu eklendi.",
  },
  {
    id: "n2",
    title: "Gölge Köprüsü bahar etkinliği",
    game: "Gölge Köprüsü",
    kind: "Etkinlik",
    date: "26 Mar 2026",
    body: "Hafta sonu etkinliğinde belirli görevleri tamamlayanlara özel profil çerçevesi.",
  },
  {
    id: "n3",
    title: "Neon Pazar 1.1 denge güncellemesi",
    game: "Neon Pazar",
    kind: "Haber",
    date: "25 Mar 2026",
    body: "Ekonomi dengelemesi ve performans iyileştirmeleri yayınlandı.",
  },
];

export const LEGAL_PAGES = [
  { slug: "privacy", title: "Gizlilik politikası" },
  { slug: "legal", title: "Yasal bilgi" },
  { slug: "accessibility", title: "Erişilebilirlik" },
  { slug: "subscription", title: "Abonelik sözleşmesi" },
  { slug: "refunds", title: "İade politikası" },
  { slug: "cookies", title: "Çerez politikası" },
] as const;
