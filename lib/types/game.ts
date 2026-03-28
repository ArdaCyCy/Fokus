import type { Achievement, Game, Category, Review, User } from "@prisma/client";

export type GameWithCategoriesAndReviews = Game & {
  categories: { category: Category }[];
  parentGame: { slug: string; title: string } | null;
  achievements: Achievement[];
  reviews: (Review & {
    user: Pick<User, "username" | "imageUrl" | "email">;
  })[];
};

export type GamePlatforms = {
  windows?: boolean;
  mac?: boolean;
  linux?: boolean;
  /** Gamepad / tam controller destegi (magaza etiketi) */
  fullController?: boolean;
  /** Steam Deck uyumluluk rozetine benzer; seed/JSON ile set edilir */
  steamDeck?: "verified" | "playable" | "unsupported";
};

export type GameSystemRequirements = {
  minimum: Record<string, string>;
  recommended: Record<string, string>;
};
