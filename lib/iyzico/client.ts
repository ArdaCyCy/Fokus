import { createRequire } from "module";

/**
 * .env.local örneği (sandbox):
 *   IYZICO_API_KEY=sandbox-xxx
 *   IYZICO_SECRET_KEY=sandbox-yyy
 *   IYZICO_URI=https://sandbox-api.iyzipay.com
 *
 * Üretim:
 *   IYZICO_URI=https://api.iyzipay.com
 *
 * Alternatif isimler (iyzipay paketi varsayılanları): IYZIPAY_API_KEY, IYZIPAY_SECRET_KEY, IYZIPAY_URI
 */
const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Iyzipay = require("iyzipay") as any;

// iyzipay CJS — tip güvenliği yerine çalışma zamanı kullanımı.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getIyzicoClient(): any {
  const apiKey =
    process.env.IYZICO_API_KEY?.trim() || process.env.IYZIPAY_API_KEY?.trim();
  const secretKey =
    process.env.IYZICO_SECRET_KEY?.trim() ||
    process.env.IYZIPAY_SECRET_KEY?.trim();
  const uri =
    process.env.IYZICO_URI?.trim() ||
    process.env.IYZIPAY_URI?.trim() ||
    "https://sandbox-api.iyzipay.com";
  if (!apiKey || !secretKey) return null;
  return new Iyzipay({ apiKey, secretKey, uri });
}

export function isIyzicoConfigured(): boolean {
  return getIyzicoClient() !== null;
}

export function iyzicoCheckoutFormInitialize(
  request: Record<string, unknown>,
): Promise<Record<string, string>> {
  const client = getIyzicoClient();
  if (!client) {
    return Promise.reject(new Error("iyzico_not_configured"));
  }
  return new Promise((resolve, reject) => {
    client.checkoutFormInitialize.create(
      request,
      (err: Error | null, result: Record<string, string>) => {
        if (err) reject(err);
        else resolve(result);
      },
    );
  });
}

export function iyzicoCheckoutFormRetrieve(request: {
  locale: string;
  token: string;
  conversationId?: string;
}): Promise<Record<string, string>> {
  const client = getIyzicoClient();
  if (!client) {
    return Promise.reject(new Error("iyzico_not_configured"));
  }
  const payload: Record<string, string> = {
    locale: request.locale,
    token: request.token,
  };
  if (request.conversationId) payload.conversationId = request.conversationId;
  return new Promise((resolve, reject) => {
    client.checkoutForm.retrieve(
      payload,
      (err: Error | null, result: Record<string, string>) => {
        if (err) reject(err);
        else resolve(result);
      },
    );
  });
}
