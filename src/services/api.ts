/**
 * Mock API for the prototype.
 *
 * Every screen talks to the backend only through these functions, so a real
 * API client can replace this module without touching the UI. Reads use
 * sample data (dated relative to today). Writes are stored on this device
 * only and are marked `origin: 'device'`.
 */
import type {
  AppNotification,
  Booking,
  ContentItem,
  ContentKind,
  Category,
  FomOrder,
  FormCycle,
  Land,
  OrderStatus,
  QuantityUnit,
  Weather,
} from '@/types';
import { buildContent } from '@/data/content';
import { buildEvents } from '@/data/events';
import { buildOrders } from '@/data/orders';
import { buildBookings } from '@/data/bookings';
import { buildForms } from '@/data/forms';
import { buildNotifications } from '@/data/notifications';
import { HOME_COORDS } from '@/data/people';
import { FOM_PRICE_PER_KG, FOM_SHIPPING, formatQuantity } from '@/lib/pricing';
import { openMeteoUrl, parseOpenMeteo, sampleWeather } from '@/lib/weather';
import { fromISODate, startOfDay } from '@/lib/dates';
import { actions, getState } from './store';

export type ApiErrorCode = 'offline' | 'not_found' | 'invalid_otp' | 'server';

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
  ) {
    super(message);
  }
}

const MESSAGES: Record<ApiErrorCode, string> = {
  offline: 'You’re offline. Check your mobile data or Wi-Fi and try again.',
  not_found: 'We couldn’t find this. It may have been removed.',
  invalid_otp: 'That code didn’t match. Check the SMS and try again.',
  server: 'Something went wrong on our side. Please try again in a minute.',
};

export function apiError(code: ApiErrorCode, message = MESSAGES[code]): ApiError {
  return new ApiError(code, message);
}

/* ---------- Sample data, built once per app launch ---------- */

const launch = new Date();
const CONTENT = buildContent(launch);
const EVENTS = buildEvents(launch);
const SERVER_ORDERS = buildOrders(launch);
const SERVER_BOOKINGS = buildBookings(launch);
const FORMS = buildForms(launch);
const SERVER_NOTIFICATIONS = buildNotifications(launch, {
  approved: SERVER_ORDERS.find((o) => o.status === 'approved')!.id,
  rejected: SERVER_ORDERS.find((o) => o.status === 'rejected')!.id,
});

/* ---------- Network simulation ---------- */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function isOffline(): boolean {
  const demoOffline = getState().demo.network === 'offline';
  const deviceOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
  return demoOffline || deviceOffline;
}

async function simulate<T>(fn: () => T): Promise<T> {
  const { network } = getState().demo;
  const latency = network === 'slow' ? 1800 + Math.random() * 700 : 240 + Math.random() * 320;
  await sleep(latency);
  if (isOffline()) throw apiError('offline');
  return fn();
}

const empty = () => getState().demo.emptyData;

/* ---------- Content ---------- */

export interface ContentQuery {
  kind?: ContentKind;
  category?: Category | 'all';
  q?: string;
  from?: string; // yyyy-mm-dd
  to?: string;
}

export function filterContent(items: ContentItem[], query: ContentQuery): ContentItem[] {
  const q = query.q?.trim().toLowerCase();
  const from = query.from ? startOfDay(fromISODate(query.from)).getTime() : -Infinity;
  const to = query.to ? startOfDay(fromISODate(query.to)).getTime() + 86_399_999 : Infinity;
  return items
    .filter((c) => (query.kind ? c.kind === query.kind : true))
    .filter((c) => (query.category && query.category !== 'all' ? c.category === query.category : true))
    .filter((c) => (q ? `${c.title} ${c.summary}`.toLowerCase().includes(q) : true))
    .filter((c) => {
      const t = new Date(c.publishedAt).getTime();
      return t >= from && t <= to;
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export const api = {
  listContent(query: ContentQuery = {}) {
    return simulate(() => (empty() ? [] : filterContent(CONTENT, query)));
  },

  getContent(id: string) {
    return simulate(() => {
      const item = CONTENT.find((c) => c.id === id);
      if (!item) throw apiError('not_found');
      return item;
    });
  },

  /** Synchronous lookup for already-loaded catalogue items (bookmarks, related). */
  contentById(id: string): ContentItem | undefined {
    return CONTENT.find((c) => c.id === id);
  },

  related(item: ContentItem, limit = 4): ContentItem[] {
    const same = CONTENT.filter((c) => c.id !== item.id && c.kind === item.kind);
    same.sort((a, b) => Number(b.category === item.category) - Number(a.category === item.category) || b.publishedAt.localeCompare(a.publishedAt));
    return same.slice(0, limit);
  },

  /* ---------- Events ---------- */

  listEvents() {
    return simulate(() => (empty() ? [] : [...EVENTS].sort((a, b) => a.start.localeCompare(b.start))));
  },

  getEvent(id: string) {
    return simulate(() => {
      const ev = EVENTS.find((e) => e.id === id);
      if (!ev) throw apiError('not_found');
      return ev;
    });
  },

  /* ---------- FOM orders ---------- */

  listOrders(filter: { statuses?: OrderStatus[]; from?: string; to?: string } = {}) {
    return simulate(() => {
      if (empty()) return [] as FomOrder[];
      const from = filter.from ? startOfDay(fromISODate(filter.from)).getTime() : -Infinity;
      const to = filter.to ? startOfDay(fromISODate(filter.to)).getTime() + 86_399_999 : Infinity;
      return [...getState().deviceOrders, ...SERVER_ORDERS]
        .filter((o) => (filter.statuses?.length ? filter.statuses.includes(o.status) : true))
        .filter((o) => {
          const t = new Date(o.createdAt).getTime();
          return t >= from && t <= to;
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    });
  },

  getOrder(id: string) {
    return simulate(() => {
      const order = [...getState().deviceOrders, ...SERVER_ORDERS].find((o) => o.id === id);
      if (!order) throw apiError('not_found');
      return order;
    });
  },

  createOrder(input: { quantity: number; unit: QuantityUnit; deliveryInstructions?: string }) {
    return simulate(() => {
      const now = new Date();
      const yy = String(now.getFullYear()).slice(2);
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const seq = String(100 + getState().deviceOrders.length + 1).padStart(3, '0');
      const order: FomOrder = {
        id: `FOM${yy}${mm}${seq}`,
        createdAt: now.toISOString(),
        quantity: input.quantity,
        unit: input.unit,
        pricePerKg: FOM_PRICE_PER_KG,
        shipping: FOM_SHIPPING,
        status: 'pending',
        deliveryInstructions: input.deliveryInstructions?.trim() || undefined,
        origin: 'device',
      };
      actions.addOrder(order, {
        id: `nt-${order.id}`,
        category: 'order',
        title: 'FOM order placed',
        body: `Order ${order.id} for ${formatQuantity(order.quantity, order.unit)} is waiting for approval.`,
        createdAt: order.createdAt,
        link: `/orders/fom/${order.id}`,
      });
      return order;
    });
  },

  /* ---------- Bookings ---------- */

  listBookings() {
    return simulate(() => (empty() ? [] : [...getState().deviceBookings, ...SERVER_BOOKINGS].sort((a, b) => b.createdAt.localeCompare(a.createdAt))));
  },

  getBooking(id: string) {
    return simulate(() => {
      const b = [...getState().deviceBookings, ...SERVER_BOOKINGS].find((x) => x.id === id);
      if (!b) throw apiError('not_found');
      return b;
    });
  },

  createBooking(input: { land: Land; crop: string; acres: number; date: string; slot: string; notes?: string }) {
    return simulate(() => {
      const s = getState();
      const booking: Booking = {
        id: String(9100 + s.deviceBookings.length + 1),
        createdAt: new Date().toISOString(),
        landId: input.land.id,
        landName: input.land.name,
        crop: input.crop,
        acres: input.acres,
        date: input.date,
        slot: input.slot,
        status: 'pending',
        requestedBy: { name: s.profile.name, role: 'You' },
        notes: input.notes?.trim() || undefined,
        origin: 'device',
      };
      actions.addBooking(booking, {
        id: `nt-b-${booking.id}`,
        category: 'booking',
        title: 'Booking requested',
        body: `Your booking #${booking.id} for ${booking.crop}, ${booking.acres} acres is waiting for approval.`,
        createdAt: booking.createdAt,
        link: `/bookings/${booking.id}`,
      });
      return booking;
    });
  },

  /* ---------- Forms (season records) ---------- */

  listForms() {
    return simulate(() => (empty() ? [] : FORMS));
  },

  getForm(id: string) {
    return simulate(() => {
      const form = FORMS.find((f) => f.id === id);
      if (!form) throw apiError('not_found');
      return form as FormCycle;
    });
  },

  /* ---------- Notifications ---------- */

  listNotifications() {
    return simulate(() => (empty() ? [] : [...getState().deviceNotifications, ...SERVER_NOTIFICATIONS].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) as AppNotification[]));
  },

  /* ---------- Lands ---------- */

  listLands() {
    return simulate(() => (empty() ? [] : getState().lands));
  },

  getLand(id: string) {
    return simulate(() => {
      const land = getState().lands.find((l) => l.id === id);
      if (!land) throw apiError('not_found');
      return land;
    });
  },

  /* ---------- Auth ---------- */

  sendOtp(_phone: string) {
    return simulate(() => ({ sentAt: new Date().toISOString() }));
  },

  verifyOtp(phone: string, code: string) {
    return simulate(() => {
      if (code !== DEMO_OTP) throw apiError('invalid_otp');
      return { phone };
    });
  },

  /* ---------- Weather ---------- */

  async getWeather(): Promise<Weather> {
    const s = getState();
    const coords = s.coords ?? HOME_COORDS;
    const label = s.coords ? 'Your location' : `${s.profile.village}, ${s.profile.district}`;
    if (!isOffline()) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 5000);
        const res = await fetch(openMeteoUrl(coords.latitude, coords.longitude), { signal: ctrl.signal });
        clearTimeout(timer);
        if (res.ok) return parseOpenMeteo(await res.json(), label);
      } catch {
        /* fall through to the labelled sample forecast */
      }
    }
    await sleep(300);
    return sampleWeather(label);
  },
};

/** Demo OTP shown on the verification screen. */
export const DEMO_OTP = '123456';

export const _seed = { CONTENT, EVENTS, SERVER_ORDERS, SERVER_BOOKINGS, FORMS, SERVER_NOTIFICATIONS };
