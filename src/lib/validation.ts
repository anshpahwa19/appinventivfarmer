import type { QuantityUnit } from '@/types';
import { toKg } from './pricing';

/** Indian mobile numbers: 10 digits starting 6–9. */
export function validatePhone(raw: string): string | null {
  const d = raw.replace(/\D/g, '');
  if (!d) return 'Enter your 10-digit mobile number.';
  if (d.length < 10) return `Mobile number is too short — ${10 - d.length} more digit${10 - d.length === 1 ? '' : 's'} needed.`;
  if (d.length > 10) return 'Mobile number should be 10 digits.';
  if (!/^[6-9]/.test(d)) return 'Indian mobile numbers start with 6, 7, 8 or 9.';
  return null;
}

export function validatePincode(raw: string): string | null {
  const d = raw.trim();
  if (!d) return 'Enter the 6-digit PIN code.';
  if (!/^\d+$/.test(d)) return 'PIN code can only contain digits.';
  if (d.length !== 6) return 'PIN code should be 6 digits.';
  if (d.startsWith('0')) return 'PIN codes do not start with 0.';
  return null;
}

export const ORDER_MIN_KG = 50;
export const ORDER_MAX_KG = 20_000;

export function validateQuantity(raw: string, unit: QuantityUnit): string | null {
  if (!raw.trim()) return 'Enter how much FOM you need.';
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 'Enter a quantity greater than zero.';
  const decimals = (raw.split('.')[1] ?? '').length;
  if (unit === 'kg' && decimals > 0) return 'Use whole kilograms (for example 250).';
  if (unit === 'MT' && decimals > 2) return 'Use up to 2 decimal places for tonnes.';
  const kg = toKg(n, unit);
  if (kg < ORDER_MIN_KG) return `Minimum order is ${ORDER_MIN_KG} kg.`;
  if (kg > ORDER_MAX_KG) return `Maximum order is ${ORDER_MAX_KG / 1000} MT. For more, contact your Kisani Didi.`;
  return null;
}

export function validateAcres(raw: string, maxAcres?: number): string | null {
  if (!raw.trim()) return 'Enter the area in acres.';
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 'Area must be more than 0 acres.';
  if (maxAcres !== undefined && n > maxAcres) return `This field is ${maxAcres} acres — enter ${maxAcres} or less.`;
  return null;
}

export function validateRequired(raw: string, label: string): string | null {
  return raw.trim() ? null : `Enter ${label}.`;
}
