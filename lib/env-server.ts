/**
 * Canlı ortamda kritik değişkenleri doğrular. instrumentation.ts içinden çağrılır.
 *
 * Çalışma koşulu: VERCEL_ENV=production (Vercel Production) veya
 * NODE_ENV=production + FOKUS_ENFORCE_PRODUCTION_ENV=1 (kendi sunucun).
 *
 * Acil durum: SKIP_PRODUCTION_ENV_VALIDATION=1
 */

import { isClerkEnabled } from "@/lib/auth/clerk-config";
import { getPublicSiteUrl } from "@/lib/site-url";

function issue(msg: string): never {
  console.error(`[Fokus] Üretim ortamı hatası: ${msg}`);
  throw new Error(`Üretim yapılandırması eksik: ${msg}`);
}

export function validateProductionEnvironment(): void {
  if (process.env.SKIP_PRODUCTION_ENV_VALIDATION === "1") return;
  const vercelProd = process.env.VERCEL_ENV === "production";
  const selfHostedStrict =
    process.env.NODE_ENV === "production" &&
    process.env.FOKUS_ENFORCE_PRODUCTION_ENV === "1";
  if (!vercelProd && !selfHostedStrict) return;

  if (!process.env.DATABASE_URL?.trim()) {
    issue("DATABASE_URL tanımlı olmalıdır.");
  }

  const resolved = getPublicSiteUrl();
  if (!resolved.startsWith("https://")) {
    issue(
      "Canlıda site adresi https olmalıdır. Vercel’de Production için NEXT_PUBLIC_APP_URL’i https://alanadin.com veya https://proje.vercel.app olarak ayarlayın.",
    );
  }

  const clerkPub = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
  const clerkSec = process.env.CLERK_SECRET_KEY?.trim();
  const clerkPartial = Boolean(clerkPub) !== Boolean(clerkSec);
  if (clerkPartial) {
    issue("Clerk kullanılıyorsa hem NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY hem CLERK_SECRET_KEY gerekir.");
  }

  if (!isClerkEnabled()) {
    const demoSecret = process.env.DEMO_AUTH_SECRET?.trim() ?? "";
    if (demoSecret.length < 32) {
      issue(
        "Üretimde Clerk kapalıysa e-posta/şifre oturumu için DEMO_AUTH_SECRET zorunludur (en az 32 karakter, örn. openssl rand -hex 32).",
      );
    }
  }

  const iyzicoKey =
    process.env.IYZICO_API_KEY?.trim() || process.env.IYZIPAY_API_KEY?.trim();
  const iyzicoSecret =
    process.env.IYZICO_SECRET_KEY?.trim() ||
    process.env.IYZIPAY_SECRET_KEY?.trim();
  const iyzicoPartial = Boolean(iyzicoKey) !== Boolean(iyzicoSecret);
  if (iyzicoPartial) {
    issue(
      "İyzico anahtarlarından biri tanımlı: hem IYZICO_API_KEY hem IYZICO_SECRET_KEY birlikte olmalıdır.",
    );
  }

  const forceIyzico =
    process.env.NEXT_PUBLIC_CHECKOUT_PROVIDER?.toLowerCase() === "iyzico";
  if (forceIyzico && (!iyzicoKey || !iyzicoSecret)) {
    issue("NEXT_PUBLIC_CHECKOUT_PROVIDER=iyzico iken IYZICO_API_KEY ve IYZICO_SECRET_KEY gerekir.");
  }

  if (process.env.FOKUS_REQUIRE_CARD_CHECKOUT === "1" && (!iyzicoKey || !iyzicoSecret)) {
    issue("FOKUS_REQUIRE_CARD_CHECKOUT=1 iken İyzico API anahtarları gerekir.");
  }

  if (process.env.DEMO_MODE?.trim() === "true") {
    issue(
      "Canlı ortamda DEMO_MODE=true kullanılamaz (rol yükseltme ve güvenlik riski). Yerelde geliştirme için DEMO_MODE’u boş bırakın veya false yapın.",
    );
  }
  if (process.env.FOKUS_ALLOW_DEMO_WALLET_TOPUP?.trim() === "1") {
    issue(
      "Bu doğrulama açıkken FOKUS_ALLOW_DEMO_WALLET_TOPUP kullanılamaz (sınırsız sahte cüzdan). Önizleme/staging için Vercel Preview kullanın veya doğrulamayı kapatmadan önce bu değişkeni kaldırın; canlıda cüzdan yüklemesi İyzico ile yapılmalıdır.",
    );
  }

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const redisTok = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  const redisPartial = Boolean(redisUrl) !== Boolean(redisTok);
  if (redisPartial) {
    issue("Upstash kullanılıyorsa UPSTASH_REDIS_REST_URL ve UPSTASH_REDIS_REST_TOKEN birlikte olmalıdır.");
  }
}
