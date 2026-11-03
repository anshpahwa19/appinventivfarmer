import { diffDays, fromISODate } from './dates';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function toDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? fromISODate(value) : new Date(value);
}

/** One date language for the whole app (fixes the five formats in the original designs). */
export function formatDate(value: string | Date, style: 'short' | 'medium' | 'long' | 'weekday' = 'medium'): string {
  const d = toDate(value);
  const day = d.getDate();
  switch (style) {
    case 'short':
      return `${day} ${MONTHS[d.getMonth()]}`;
    case 'long':
      return `${WEEKDAYS_LONG[d.getDay()]}, ${day} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
    case 'weekday':
      return `${WEEKDAYS[d.getDay()]}, ${day} ${MONTHS[d.getMonth()]}`;
    default:
      return `${day} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
}

export function weekdayShort(value: string | Date): string {
  return WEEKDAYS[toDate(value).getDay()];
}

export function monthShort(value: string | Date): string {
  return MONTHS[toDate(value).getMonth()];
}

export function monthYear(value: string | Date): string {
  const d = toDate(value);
  return `${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

/** "10:00 AM" from an ISO timestamp or "HH:mm". */
export function formatTime(value: string | Date): string {
  let h: number;
  let m: number;
  if (typeof value === 'string' && /^\d{1,2}:\d{2}$/.test(value)) {
    [h, m] = value.split(':').map(Number);
  } else {
    const d = toDate(value);
    h = d.getHours();
    m = d.getMinutes();
  }
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function formatDateTime(value: string | Date): string {
  return `${formatDate(value)}, ${formatTime(value)}`;
}

/** Friendly relative time; falls back to a date after a week. */
export function formatRelative(value: string | Date, now = new Date()): string {
  const d = toDate(value);
  const diffMin = Math.round((now.getTime() - d.getTime()) / 60_000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.floor(diffMin / 60);
  const days = diffDays(d, now);
  if (days === 0) return diffH === 1 ? '1 hour ago' : `${diffH} hours ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDate(d);
}

/** Relative time for mid-sentence use: "updated yesterday", "updated 30 Sep 2026". */
export function formatRelativeInline(value: string | Date, now = new Date()): string {
  const r = formatRelative(value, now);
  return r === 'Yesterday' || r === 'Just now' ? r.toLowerCase() : r;
}

/** "Today", "Tomorrow", "In 3 days", "Yesterday", "3 days ago". */
export function formatDayDistance(value: string | Date, now = new Date()): string {
  const days = diffDays(now, toDate(value));
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 1) return `In ${days} days`;
  return `${-days} days ago`;
}

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const inrPaise = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

/** ₹1,00,000 (Indian grouping). */
export function formatCurrency(value: number, withPaise = false): string {
  return (withPaise ? inrPaise : inr).format(value);
}

export function formatNumber(value: number): string {
  return num.format(value);
}

/** 9876543210 → "+91 98765 43210". */
export function formatPhone(digits: string): string {
  const d = digits.replace(/\D/g, '').slice(-10);
  if (d.length !== 10) return digits;
  return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
}

/** 185 → "3:05". */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${formatNumber(n)} ${n === 1 ? one : many}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}

export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 5) return 'Good evening';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
