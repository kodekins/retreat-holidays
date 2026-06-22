// 5% concierge/redirection fee paid by the traveler (not the vendor)
const CONCIERGE_FEE_PERCENTAGE = 0.05;
const MIN_CONCIERGE_FEE_USD = 5;

export function getConciergeFee(basePrice: number): number {
  const fee = Math.round(basePrice * CONCIERGE_FEE_PERCENTAGE);
  return Math.max(fee, MIN_CONCIERGE_FEE_USD);
}

export function getConciergeFeeCents(basePrice: number): number {
  return getConciergeFee(basePrice) * 100;
}

/** @deprecated Use getConciergeFee — kept for any legacy imports */
export function getBrokerageFee(basePrice: number): number {
  return getConciergeFee(basePrice);
}

/** Listing price shown to traveler (vendor price, fee is separate) */
export function calculateFinalPrice(basePrice: number): number {
  return basePrice;
}

export function formatPrice(price: number, currency: string = 'USD'): string {
  return `${currency}$${price.toLocaleString()}`;
}
