type CouponKind = "PERCENT" | "FIXED";

type CouponDefinition = {
  code: string;
  kind: CouponKind;
  value: number;
  minSubtotalCents?: number;
  description: string;
};

const COUPONS: CouponDefinition[] = [
  {
    code: "FOCUS10",
    kind: "PERCENT",
    value: 10,
    description: "%10 sepet indirimi",
  },
  {
    code: "INDIE50",
    kind: "FIXED",
    value: 5000,
    minSubtotalCents: 20000,
    description: "50 TL sabit indirim (min 200 TL)",
  },
];

export type CouponEvaluation =
  | { valid: false; code: string; reason: string }
  | {
      valid: true;
      code: string;
      discountCents: number;
      minSubtotalCents?: number;
      description: string;
    };

export function evaluateCoupon(subtotalCents: number, couponCode?: string | null): CouponEvaluation | null {
  const normalized = couponCode?.trim().toUpperCase();
  if (!normalized) return null;
  const coupon = COUPONS.find((c) => c.code === normalized);
  if (!coupon) return { valid: false, code: normalized, reason: "Kupon bulunamadı." };
  if (coupon.minSubtotalCents && subtotalCents < coupon.minSubtotalCents) {
    return {
      valid: false,
      code: normalized,
      reason: `Bu kupon icin minimum sepet ${coupon.minSubtotalCents / 100} TL olmali.`,
    };
  }

  const rawDiscount =
    coupon.kind === "PERCENT"
      ? Math.floor((subtotalCents * coupon.value) / 100)
      : coupon.value;
  const discountCents = Math.min(Math.max(0, rawDiscount), subtotalCents);

  return {
    valid: true,
    code: normalized,
    discountCents,
    minSubtotalCents: coupon.minSubtotalCents,
    description: coupon.description,
  };
}

export function splitDiscountAcrossItems(prices: number[], discountCents: number): number[] {
  if (discountCents <= 0 || prices.length === 0) return prices;
  const subtotal = prices.reduce((a, b) => a + b, 0);
  if (subtotal <= 0) return prices;

  const provisional = prices.map((price) => Math.floor((price * discountCents) / subtotal));
  let assigned = provisional.reduce((a, b) => a + b, 0);
  let remaining = discountCents - assigned;

  const discounted = prices.map((price, i) => Math.max(0, price - provisional[i]));
  let idx = 0;
  while (remaining > 0 && discounted.some((p) => p > 0)) {
    const i = idx % discounted.length;
    if (discounted[i] > 0) {
      discounted[i] -= 1;
      remaining -= 1;
    }
    idx += 1;
  }

  assigned = subtotal - discounted.reduce((a, b) => a + b, 0);
  if (assigned !== discountCents) return prices;
  return discounted;
}
