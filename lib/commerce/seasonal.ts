/** Seasonal sale bayrağı — UI ve kampanya metni için. Örn: FEATURE_SEASONAL_SALE=true */
export function isSeasonalSaleActive(): boolean {
  return process.env.FEATURE_SEASONAL_SALE === "true";
}

export function seasonalSaleLabel(): string | null {
  return isSeasonalSaleActive() ? process.env.SEASONAL_SALE_LABEL ?? "Mevsim indirimleri" : null;
}
