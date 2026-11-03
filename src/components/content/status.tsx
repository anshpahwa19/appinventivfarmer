import type { ReactNode } from 'react';
import { CheckCircle2, Clock3, XCircle, Radio, CalendarClock, CircleCheckBig } from 'lucide-react';
import type { BookingStatus, EventStatus, OrderStatus } from '@/types';
import type { Tone } from '@/components/ui/Misc';

export interface StatusMeta {
  tone: Tone;
  label: string;
  icon: ReactNode;
  /** One line that explains what the status means for the farmer. */
  explain: string;
}

export function orderStatus(status: OrderStatus): StatusMeta {
  switch (status) {
    case 'approved':
      return { tone: 'success', label: 'Approved', icon: <CheckCircle2 aria-hidden />, explain: 'Approved. It will be dispatched on the date shown.' };
    case 'rejected':
      return { tone: 'danger', label: 'Rejected', icon: <XCircle aria-hidden />, explain: 'This order was not approved. See the reason below.' };
    default:
      return { tone: 'warning', label: 'Pending approval', icon: <Clock3 aria-hidden />, explain: 'The Kisani Urjaa team is checking stock and delivery for your village.' };
  }
}

export function bookingStatus(status: BookingStatus): StatusMeta {
  switch (status) {
    case 'approved':
      return { tone: 'success', label: 'Approved', icon: <CheckCircle2 aria-hidden />, explain: 'Approved and an operator is assigned.' };
    case 'rejected':
      return { tone: 'danger', label: 'Rejected', icon: <XCircle aria-hidden />, explain: 'This booking could not be accepted. See the reason below.' };
    default:
      return { tone: 'warning', label: 'Awaiting approval', icon: <Clock3 aria-hidden />, explain: 'Your request is with the team. You’ll be notified when it’s approved.' };
  }
}

export function eventStatusMeta(status: EventStatus): StatusMeta {
  switch (status) {
    case 'live':
      return { tone: 'live', label: 'Live now', icon: <Radio aria-hidden />, explain: 'Happening right now.' };
    case 'completed':
      return { tone: 'neutral', label: 'Completed', icon: <CircleCheckBig aria-hidden />, explain: 'This event has ended.' };
    default:
      return { tone: 'info', label: 'Upcoming', icon: <CalendarClock aria-hidden />, explain: 'Coming up.' };
  }
}
