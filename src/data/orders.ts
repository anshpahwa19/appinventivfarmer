import type { FomOrder } from '@/types';
import { relativeISO } from '@/lib/dates';
import { FOM_PRICE_PER_KG, FOM_SHIPPING } from '@/lib/pricing';

function orderId(dateISO: string, seq: number): string {
  const d = new Date(dateISO);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `FOM${yy}${mm}${String(seq).padStart(3, '0')}`;
}

export function buildOrders(now = new Date()): FomOrder[] {
  const at = (days: number, h = 10, m = 0) => relativeISO(days, h, m, now);
  const base = { pricePerKg: FOM_PRICE_PER_KG, shipping: FOM_SHIPPING, origin: 'server' as const };
  const pending = at(-1, 18, 20);
  const approved = at(-12, 9, 40);
  const rejected = at(-20, 11, 5);
  const older = at(-45, 15, 30);
  return [
    {
      ...base,
      id: orderId(pending, 14),
      createdAt: pending,
      quantity: 250,
      unit: 'kg',
      status: 'pending',
      deliveryInstructions: 'Call before coming. Our gate is next to the Hanuman temple.',
    },
    {
      ...base,
      id: orderId(approved, 9),
      createdAt: approved,
      quantity: 2,
      unit: 'MT',
      status: 'approved',
      decidedAt: at(-10, 12),
      dispatchDate: at(2, 9).slice(0, 10),
      deliveryInstructions: 'Unload near the cattle shed, not on the field bund.',
      adminNote: 'The truck will come by the main Dhad road. Please keep the lane clear.',
    },
    {
      ...base,
      id: orderId(rejected, 3),
      createdAt: rejected,
      quantity: 5,
      unit: 'MT',
      status: 'rejected',
      decidedAt: at(-18, 16),
      rejectionReason: 'This quantity is not available this month. Please order 2 MT or less, or ask your Kisani Didi about next month’s stock.',
    },
    {
      ...base,
      id: orderId(older, 21),
      createdAt: older,
      quantity: 500,
      unit: 'kg',
      status: 'approved',
      decidedAt: at(-43, 11),
      dispatchDate: at(-38, 9).slice(0, 10),
      adminNote: 'Delivered with the village group order.',
    },
  ];
}
