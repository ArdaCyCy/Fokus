/** Turkiye KDV — fiyatlarin magazada KDV dahil (brut) oldugu varsayimi. */

export const TR_VAT_RATE_PERCENT = 20;

/** Brut tutardan KDV tutarini ayristirir: kdv = brut * (oran / (100 + oran)) */
export function vatAmountFromGrossInclusiveCents(
  grossCents: number,
  vatPercent: number = TR_VAT_RATE_PERCENT
): { netCents: number; vatCents: number; grossCents: number } {
  if (grossCents <= 0) {
    return { netCents: 0, vatCents: 0, grossCents: 0 };
  }
  const vatCents = Math.round((grossCents * vatPercent) / (100 + vatPercent));
  const netCents = grossCents - vatCents;
  return { netCents, vatCents, grossCents };
}
