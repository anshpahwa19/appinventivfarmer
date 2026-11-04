import { CheckCircle2, CircleDashed, Clock3, Radio, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import type { BookingStatus, ContentItem, EventStatus, FarmEvent, Land, OrderStatus } from '@/types';
import { CATEGORY_LABEL, readMinutes } from '@/data/content';
import { formatDuration } from '@/lib/format';
import { slotFor } from '../photo/catalog';
import type { Tone } from '../ui/Blocks';

export const KIND_PATH = { news: 'news', article: 'articles', video: 'videos' } as const;

export function contentPath(item: ContentItem) {
  return `/${KIND_PATH[item.kind]}/${item.id}`;
}

export function photoOf(item: ContentItem | FarmEvent | Land): string {
  return slotFor(item.scene, item.id);
}

export function contentMeta(item: ContentItem): string {
  return item.kind === 'video' ? `${formatDuration(item.video?.durationSec ?? 0)} watch` : `${readMinutes(item)} min read`;
}

export function category(item: ContentItem) {
  return CATEGORY_LABEL[item.category];
}

export interface StatusMeta {
  tone: Tone;
  label: string;
  icon: ReactNode;
  explain: string;
}

export function orderMeta(status: OrderStatus): StatusMeta {
  if (status === 'approved') return { tone: 'success', label: 'Approved', icon: <CheckCircle2 aria-hidden />, explain: 'Approved. It will be dispatched on the date shown.' };
  if (status === 'rejected') return { tone: 'danger', label: 'Rejected', icon: <XCircle aria-hidden />, explain: 'This order was not approved. The reason is below.' };
  return { tone: 'warning', label: 'Pending approval', icon: <Clock3 aria-hidden />, explain: 'The Kisani Urjaa team is checking stock and delivery for your village.' };
}

export function bookingMeta(status: BookingStatus): StatusMeta {
  if (status === 'approved') return { tone: 'success', label: 'Approved', icon: <CheckCircle2 aria-hidden />, explain: 'Approved, and an operator is assigned.' };
  if (status === 'rejected') return { tone: 'danger', label: 'Rejected', icon: <XCircle aria-hidden />, explain: 'This booking could not be accepted. The reason is below.' };
  return { tone: 'warning', label: 'Awaiting approval', icon: <Clock3 aria-hidden />, explain: 'Your request is with the team. You’ll be notified when it’s approved.' };
}

export function eventMeta(status: EventStatus): StatusMeta {
  if (status === 'live') return { tone: 'live', label: 'Live now', icon: <Radio aria-hidden />, explain: 'Happening right now.' };
  if (status === 'completed') return { tone: 'neutral', label: 'Ended', icon: <CheckCircle2 aria-hidden />, explain: 'This event has ended.' };
  return { tone: 'info', label: 'Upcoming', icon: <CircleDashed aria-hidden />, explain: 'Coming up.' };
}
