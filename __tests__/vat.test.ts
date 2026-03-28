import { describe, expect, it } from "vitest";

import { vatAmountFromGrossInclusiveCents } from "@/lib/commerce/vat";

describe("vatAmountFromGrossInclusiveCents", () => {
  it("splits 12000 cents gross into net + VAT at 20%", () => {
    const r = vatAmountFromGrossInclusiveCents(12000, 20);
    expect(r.grossCents).toBe(12000);
    expect(r.netCents + r.vatCents).toBe(12000);
    expect(r.vatCents).toBe(2000);
  });
});
