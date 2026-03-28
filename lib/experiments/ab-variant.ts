export const AB_COOKIE = "fokus_ab";
export type AbVariant = "a" | "b";

export function pickAbVariant(existing: string | undefined): AbVariant {
  if (existing === "a" || existing === "b") return existing;
  return Math.random() < 0.5 ? "a" : "b";
}
