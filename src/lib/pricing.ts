import type { QuantityUnit } from '@/types';

/** Commercial terms from the original "Add New FOM Order" designs. */
export const FOM_PRICE_PER_KG = 100;
export const FOM_SHIPPING = 100;
export const KG_PER_MT = 1000;

export function toKg(quantity: number, unit: QuantityUnit): number {
  return unit === 'MT' ? quantity * KG_PER_MT : quantity;
}

export interface OrderTotals {
  kg: number;
  subtotal: number;
  shipping: number;
  total: number;
}

/** Single source of truth for order money (the original list and detail disagreed). */
export function orderTotals(quantity: number, unit: QuantityUnit, pricePerKg = FOM_PRICE_PER_KG, shipping = FOM_SHIPPING): OrderTotals {
  const kg = toKg(Number.isFinite(quantity) ? quantity : 0, unit);
  const subtotal = Math.round(kg * pricePerKg);
  return { kg, subtotal, shipping: kg > 0 ? shipping : 0, total: kg > 0 ? subtotal + shipping : 0 };
}

export function formatQuantity(quantity: number, unit: QuantityUnit): string {
  const n = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(quantity);
  return unit === 'MT' ? `${n} MT` : `${n} kg`;
}
