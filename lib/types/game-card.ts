/** Oyun kartı için düz veri (Prisma veya demo kaynağından üretilir). */
export type GameCardData = {
  id: string;
  slug: string;
  title: string;
  developerName: string;
  coverImageUrl: string;
  priceCents: number;
  originalPriceCents: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  isTurkishMade: boolean;
  categoryNames?: string[];
};
