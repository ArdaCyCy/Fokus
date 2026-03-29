import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXT_PUBLIC_APP_URL: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL").optional(),
  ),
  /** Açıkça true/false; boşsa geliştirmede true, NODE_ENV=production iken false kabul edilir. */
  DEMO_MODE: z.enum(["true", "false"]).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).optional().default("development"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  throw new Error(`Invalid environment variables: ${issues}`);
}

/** Boş / tanımsız URL’lerde yerel varsayılan (Prisma vb. için). */
export const env = {
  ...parsed.data,
  NEXT_PUBLIC_APP_URL:
    parsed.data.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000",
};

/**
 * Clerk oturumunda metadata yokken “herkes geliştirici” davranışı yalnızca geliştirme için.
 * Üretimde (NODE_ENV=production) varsayılan kapalı; açık DEMO_MODE=true tehlikelidir.
 */
export function isDemoMode(): boolean {
  const v = process.env.DEMO_MODE?.trim();
  if (v === "true") return true;
  if (v === "false") return false;
  return process.env.NODE_ENV !== "production";
}

/**
 * API’den ücretsiz cüzdan yükleme (sahte para). Üretimde kapalı; yalnızca
 * FOKUS_ALLOW_DEMO_WALLET_TOPUP=1 ile (kendi sunucun / staging) açılır.
 */
export function isWalletDemoTopupAllowed(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.FOKUS_ALLOW_DEMO_WALLET_TOPUP?.trim() === "1";
}
