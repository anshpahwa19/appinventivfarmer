import type { Booking } from '@/types';
import { relativeISO } from '@/lib/dates';

export const FARM_MANAGER = { name: 'Vijay Sharma', role: 'Farm manager' as const };

export function buildBookings(now = new Date()): Booking[] {
  const at = (days: number, h = 10, m = 0) => relativeISO(days, h, m, now);
  const day = (days: number) => at(days).slice(0, 10);
  return [
    {
      id: '4581',
      createdAt: new Date(now.getTime() - 65 * 60_000).toISOString(),
      landId: 'l-wheat',
      landName: 'Wheat Field',
      crop: 'Wheat',
      acres: 30,
      date: day(5),
      slot: '12:00',
      status: 'pending',
      requestedBy: { name: 'Ram Prasad Yadav', role: 'You' },
      notes: 'Straw is spread across the whole field.',
      origin: 'server',
    },
    {
      id: '4589',
      createdAt: at(-1, 17, 10),
      landId: 'l-wheat',
      landName: 'Wheat Field',
      crop: 'Wheat',
      acres: 30,
      date: day(6),
      slot: '12:00',
      status: 'pending',
      requestedBy: FARM_MANAGER,
      origin: 'server',
    },
    {
      id: '8458',
      createdAt: at(-4, 9, 30),
      landId: 'l-paddy',
      landName: 'Paddy Field',
      crop: 'Rice',
      acres: 12,
      date: day(3),
      slot: '09:00',
      status: 'approved',
      decidedAt: at(-2, 11, 15),
      operator: { name: 'Arpit Verma', phone: '9000000003' },
      requestedBy: { name: 'Ram Prasad Yadav', role: 'You' },
      origin: 'server',
    },
    {
      id: '5848',
      createdAt: at(-6, 14, 0),
      landId: 'l-cotton',
      landName: 'Cotton Field',
      crop: 'Cotton',
      acres: 8,
      date: day(-2),
      slot: '15:00',
      status: 'rejected',
      decidedAt: at(-3, 10, 0),
      rejectionReason: 'No operator is free in your area on this date. Please pick another date.',
      requestedBy: { name: 'Ram Prasad Yadav', role: 'You' },
      origin: 'server',
    },
  ];
}

export const BOOKING_SLOTS = ['07:00', '09:00', '12:00', '15:00'];
