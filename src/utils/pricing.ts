import { Retreat, RetreatPricingOption } from '@/types/retreat';

// 5% concierge/redirection fee paid by the traveler (not the vendor)
const CONCIERGE_FEE_PERCENTAGE = 0.05;
const MIN_CONCIERGE_FEE_USD = 5;

function normalizePrice(value: number | string | null | undefined): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getConciergeFee(basePrice: number | string | null | undefined): number {
  const normalizedPrice = normalizePrice(basePrice);
  const fee = Math.round(normalizedPrice * CONCIERGE_FEE_PERCENTAGE);
  return Math.max(fee, MIN_CONCIERGE_FEE_USD);
}

export function getConciergeFeeCents(basePrice: number | string | null | undefined): number {
  return getConciergeFee(basePrice) * 100;
}

/** @deprecated Use getConciergeFee — kept for any legacy imports */
export function getBrokerageFee(basePrice: number | string | null | undefined): number {
  return getConciergeFee(basePrice);
}

/** Listing price shown to traveler (vendor price, fee is separate) */
export function calculateFinalPrice(basePrice: number | string | null | undefined): number {
  return normalizePrice(basePrice);
}

export function formatPrice(price: number | string | null | undefined, currency: string = 'USD'): string {
  const normalizedPrice = normalizePrice(price);
  return `${currency}$${normalizedPrice.toLocaleString()}`;
}

export function getEffectiveRetreatPrice(
  retreat: Partial<Retreat> | null | undefined,
  selectedVariationId?: string | null,
): { price: number; currency: string; variation?: RetreatPricingOption } {
  const basePrice = calculateFinalPrice(retreat?.price);
  const currency = retreat?.currency || 'USD';

  const variation = (retreat?.pricingVariations || []).find((item) => item.id === selectedVariationId);
  if (variation) {
    return {
      price: calculateFinalPrice(variation.price),
      currency: variation.currency || currency,
      variation,
    };
  }

  return {
    price: basePrice,
    currency,
  };
}
