/** Keşfet sayfası pill etiketleri → Category.slug eşlemesi */
export const DISCOVER_CATEGORY_FILTERS = [
  { label: "Tümü", slug: null },
  { label: "Aksiyon", slug: "aksiyon" },
  { label: "RPG", slug: "rpg" },
  { label: "Korku", slug: "korku" },
  { label: "Strateji", slug: "strateji" },
  { label: "Puzzle", slug: "puzzle" },
  { label: "Simülasyon", slug: "simulasyon" },
  { label: "Spor", slug: "spor" },
] as const;

export type DiscoverCategorySlug =
  (typeof DISCOVER_CATEGORY_FILTERS)[number]["slug"];
