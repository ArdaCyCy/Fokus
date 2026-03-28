import { createRequire } from "module";
import type { User } from "@prisma/client";

import { getAppBaseUrl } from "@/lib/commerce/checkout-config";
import type { CheckoutLine } from "@/lib/commerce/fulfill-cart";

const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const IyzipayConstants = require("iyzipay") as any;

function tryToString(cents: number): string {
  return (Math.max(0, cents) / 100).toFixed(2);
}

const SANDBOX_BUYER = {
  gsmNumber: "+905350000000",
  identityNumber: "74300864791",
  registrationAddress: "Türkiye",
  ip: "85.34.78.112",
  city: "Istanbul",
  country: "Turkey",
  zipCode: "34000",
} as const;

function buyerFromUser(user: User) {
  const name = (user.username ?? user.email ?? "Oyuncu").slice(0, 40);
  const email = user.email ?? "destek@fokus.local";
  return {
    id: user.id.slice(0, 20),
    name: name.slice(0, 1) || "A",
    surname: name.length > 1 ? name.slice(1, 32) : "User",
    gsmNumber: SANDBOX_BUYER.gsmNumber,
    email,
    identityNumber: SANDBOX_BUYER.identityNumber,
    lastLoginDate: new Date().toISOString().slice(0, 19).replace("T", " "),
    registrationDate: new Date(user.createdAt).toISOString().slice(0, 19).replace("T", " "),
    registrationAddress: SANDBOX_BUYER.registrationAddress,
    ip: SANDBOX_BUYER.ip,
    city: SANDBOX_BUYER.city,
    country: SANDBOX_BUYER.country,
    zipCode: SANDBOX_BUYER.zipCode,
  };
}

export function buildIyzicoBaseRequest(): Record<string, unknown> {
  const base = getAppBaseUrl();
  return {
    locale: IyzipayConstants.LOCALE.TR,
    currency: IyzipayConstants.CURRENCY.TRY,
    paymentGroup: IyzipayConstants.PAYMENT_GROUP.PRODUCT,
    callbackUrl: `${base}/api/payments/iyzico/callback`,
    enabledInstallments: [2, 3, 6, 9],
  };
}

export function buildCartCheckoutFormRequest(params: {
  user: User;
  pendingCheckoutId: string;
  lines: CheckoutLine[];
  chargedCents: number;
  currency: string;
}): Record<string, unknown> {
  const { user, pendingCheckoutId, lines, chargedCents } = params;
  const base = buildIyzicoBaseRequest();
  const buyer = buyerFromUser(user);

  const basketItems = lines
    .filter((l) => l.chargedCents > 0)
    .map((l) => ({
      id: l.gameId,
      name: l.title.slice(0, 120),
      category1: "Game",
      category2: "Digital",
      itemType: IyzipayConstants.BASKET_ITEM_TYPE.VIRTUAL,
      price: tryToString(l.chargedCents),
    }));

  const priceSum = lines.reduce((a, l) => a + Math.max(0, l.chargedCents), 0);
  if (priceSum !== chargedCents) {
    throw new Error("basket_total_mismatch");
  }

  const priceStr = tryToString(chargedCents);

  return {
    ...base,
    conversationId: pendingCheckoutId,
    price: priceStr,
    paidPrice: priceStr,
    basketId: pendingCheckoutId,
    buyer,
    shippingAddress: {
      contactName: `${buyer.name} ${buyer.surname}`,
      city: buyer.city,
      country: buyer.country,
      address: buyer.registrationAddress,
      zipCode: buyer.zipCode,
    },
    billingAddress: {
      contactName: `${buyer.name} ${buyer.surname}`,
      city: buyer.city,
      country: buyer.country,
      address: buyer.registrationAddress,
      zipCode: buyer.zipCode,
    },
    basketItems,
  };
}

export function buildWalletTopupFormRequest(params: {
  user: User;
  conversationId: string;
  amountCents: number;
}): Record<string, unknown> {
  const { user, conversationId, amountCents } = params;
  const base = buildIyzicoBaseRequest();
  const buyer = buyerFromUser(user);
  const priceStr = tryToString(amountCents);

  return {
    ...base,
    conversationId,
    price: priceStr,
    paidPrice: priceStr,
    basketId: conversationId,
    buyer,
    shippingAddress: {
      contactName: `${buyer.name} ${buyer.surname}`,
      city: buyer.city,
      country: buyer.country,
      address: buyer.registrationAddress,
      zipCode: buyer.zipCode,
    },
    billingAddress: {
      contactName: `${buyer.name} ${buyer.surname}`,
      city: buyer.city,
      country: buyer.country,
      address: buyer.registrationAddress,
      zipCode: buyer.zipCode,
    },
    basketItems: [
      {
        id: "wallet-topup",
        name: "Fokus cüzdan bakiyesi",
        category1: "Wallet",
        category2: "Topup",
        itemType: IyzipayConstants.BASKET_ITEM_TYPE.VIRTUAL,
        price: priceStr,
      },
    ],
  };
}
