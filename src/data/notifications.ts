import type { AppNotification } from '@/types';
import { minutesAgoISO } from '@/lib/dates';

export function buildNotifications(now = new Date(), orderIds: { approved: string; rejected: string }): AppNotification[] {
  const ago = (min: number) => minutesAgoISO(min, now);
  return [
    { id: 'nt-live-demo', category: 'event', title: 'Straw baling demonstration is live', body: 'It started an hour ago at Patil farm, Ratanpur. You can still join.', createdAt: ago(55), link: '/events/e-baling-demo' },
    { id: 'nt-booking-4581', category: 'booking', title: 'Booking requested', body: 'Your booking #4581 for Wheat, 30 acres has been submitted and is waiting for approval.', createdAt: ago(64), link: '/bookings/4581' },
    { id: 'nt-workshop', category: 'event', title: 'Workshop the day after tomorrow', body: 'Farmer training workshop on organic inputs, Village Hall, 10:00 AM.', createdAt: ago(190), link: '/events/e-training' },
    { id: 'nt-booking-4589', category: 'booking', title: 'Booking requested by farm manager', body: 'Vijay Sharma requested booking #4589 for Wheat, 30 acres.', createdAt: ago(60 * 24 + 40), link: '/bookings/4589' },
    { id: 'nt-booking-8458', category: 'booking', title: 'Booking approved', body: 'Your booking #8458 is approved. Operator Arpit Verma has been assigned.', createdAt: ago(60 * 24 * 2 + 200), link: '/bookings/8458' },
    { id: 'nt-booking-5848', category: 'booking', title: 'Booking rejected', body: 'Booking #5848 could not be accepted. Open it to see why and pick another date.', createdAt: ago(60 * 24 * 3 + 90), link: '/bookings/5848' },
    { id: 'nt-form-ic', category: 'form', title: 'Intercultivation recorded', body: 'Sumita Kumari added the second weeding to your Cotton Field season record.', createdAt: ago(60 * 24 * 4 + 30), link: '/forms/fc-cotton/steps/intercultivation' },
    { id: 'nt-order-approved', category: 'order', title: 'FOM order approved', body: `Order ${orderIds.approved} is approved. Dispatch date is set.`, createdAt: ago(60 * 24 * 10 + 120), link: `/orders/fom/${orderIds.approved}` },
    { id: 'nt-order-rejected', category: 'order', title: 'FOM order rejected', body: `Order ${orderIds.rejected} could not be approved. Open it to see the reason.`, createdAt: ago(60 * 24 * 18 + 60), link: `/orders/fom/${orderIds.rejected}` },
  ];
}

/** Notifications that start out unread in the demo. */
export const INITIALLY_UNREAD = ['nt-live-demo', 'nt-booking-4581', 'nt-workshop', 'nt-booking-4589'];
