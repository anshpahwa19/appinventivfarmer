export const DAY_MS = 86_400_000;

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Whole calendar days from a to b (positive when b is later). */
export function diffDays(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY_MS);
}

/** Local yyyy-mm-dd. */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parses yyyy-mm-dd as a local date (not UTC). */
export function fromISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Date relative to today at a given local time, as ISO string. */
export function relativeISO(days: number, hours = 9, minutes = 0, base = new Date()): string {
  const d = addDays(startOfDay(base), days);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

/** ISO string offset from now by minutes. */
export function minutesAgoISO(minutes: number, base = new Date()): string {
  return new Date(base.getTime() - minutes * 60_000).toISOString();
}
