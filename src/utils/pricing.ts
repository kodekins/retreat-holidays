// 5% brokerage fee markup
const BROKERAGE_FEE_PERCENTAGE = 0.05;

export function calculateFinalPrice(basePrice: number): number {
  return Math.round(basePrice * (1 + BROKERAGE_FEE_PERCENTAGE));
}

export function getBrokerageFee(basePrice: number): number {
  return Math.round(basePrice * BROKERAGE_FEE_PERCENTAGE);
}

export function formatPrice(price: number, currency: string = 'USD'): string {
  return `${currency}$${price.toLocaleString()}`;
}
