/** Ödeme kanalı: İyzico ödeme formu veya cüzdan bakiyesi. */
export type CheckoutProviderMode = "iyzico" | "wallet";

function envTruthy(v: string | undefined): boolean {
  if (!v) return false;
  return ["1", "true", "yes", "on"].includes(v.toLowerCase());
}

function iyzicoKeysPresent(): boolean {
  const k =
    process.env.IYZICO_API_KEY?.trim() || process.env.IYZIPAY_API_KEY?.trim();
  const s =
    process.env.IYZICO_SECRET_KEY?.trim() ||
    process.env.IYZIPAY_SECRET_KEY?.trim();
  return Boolean(k && s);
}

/** Sunucu: İyzico anahtarları varsa ve kapatılmadıysa kart, aksi halde cüzdan. */
export function resolveCheckoutProvider(): CheckoutProviderMode {
  const forced = process.env.NEXT_PUBLIC_CHECKOUT_PROVIDER?.toLowerCase();
  if (forced === "wallet") return "wallet";
  if (forced === "iyzico") {
    if (!iyzicoKeysPresent()) {
      console.warn(
        "NEXT_PUBLIC_CHECKOUT_PROVIDER=iyzico fakat IYZICO_API_KEY / IYZICO_SECRET_KEY eksik; cüzdan moduna düşülüyor.",
      );
      return "wallet";
    }
    return "iyzico";
  }
  if (envTruthy(process.env.FORCE_WALLET_CHECKOUT)) return "wallet";
  return iyzicoKeysPresent() ? "iyzico" : "wallet";
}

export function getAppBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw && /^https?:\/\//i.test(raw)) return raw.replace(/\/$/, "");
  return "http://localhost:3000";
}
