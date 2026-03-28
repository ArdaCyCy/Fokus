import { z } from "zod";

/** Vitrin / demo oyun kartı — ileride API gövdesi için aynı şema kullanılabilir. */
export const demoGameSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  developer: z.string().min(1),
  coverUrl: z.string().url(),
  priceCents: z.number().int().nonnegative(),
  originalPriceCents: z.number().int().positive().optional(),
  currency: z.literal("TRY"),
  rating: z.number().min(0).max(5),
  categories: z.array(z.string()).min(1),
  isTurkishMade: z.boolean(),
  featured: z.boolean(),
  isNew: z.boolean(),
});

export const demoGamesSchema = z.array(demoGameSchema);

export type DemoGame = z.infer<typeof demoGameSchema>;
