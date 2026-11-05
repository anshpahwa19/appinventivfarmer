import { useSyncExternalStore } from 'react';
import type { Booking, Crop, FomOrder, Interest, Land, Machinery, Profile, AppNotification } from '@/types';
import { readJSON, writeJSON, removeKey } from '@/lib/storage';
import { DEFAULT_PROFILE } from '@/data/people';
import { buildLands } from '@/data/lands';
import { INITIALLY_UNREAD } from '@/data/notifications';

/* ------------------------------------------------------------------ */
/* State shape                                                          */
/* ------------------------------------------------------------------ */

export interface Session {
  onboarded: boolean;
  signedIn: boolean;
  verified: boolean;
  phone: string;
  location: 'unknown' | 'granted' | 'denied' | 'skipped';
}

export interface Prefs {
  theme: 'system' | 'light' | 'dark';
  text: 'default' | 'large';
  motion: 'system' | 'reduce';
  language: Language;
}

/** App languages. Hindi and Marathi currently cover the Home screen only. */
export type Language = 'en' | 'hi' | 'mr';
export const LANGUAGES: readonly Language[] = ['en', 'hi', 'mr'];
export const LANGUAGE_NAMES: Record<Language, string> = { en: 'English', hi: 'हिन्दी', mr: 'मराठी' };

/** Unknown or missing values (older saves, hand-edited storage) fall back to English. */
export function normalizeLanguage(value: unknown): Language {
  return LANGUAGES.includes(value as Language) ? (value as Language) : 'en';
}

export interface DemoSettings {
  network: 'normal' | 'slow' | 'offline';
  emptyData: boolean;
}

export interface AppState {
  version: 3;
  session: Session;
  profile: Profile;
  prefs: Prefs;
  demo: DemoSettings;
  bookmarks: string[];
  unreadNotifications: string[];
  eventInterest: Record<string, Interest>;
  /** Created in this prototype; stored on this device only. */
  deviceOrders: FomOrder[];
  deviceBookings: Booking[];
  deviceNotifications: AppNotification[];
  lands: Land[];
  machinery: Machinery;
  coords: { latitude: number; longitude: number } | null;
}

const STORAGE_KEY = 'kisani-urjaa:state';

const DEFAULT_MACHINERY: Machinery = {
  tractor: { count: 1, brand: 'Mahindra', year: '2019', hp: '45', driver: 'Self', clutch: 'Dual', powerSteering: 'Yes' },
  slasher: 0,
  raker: 0,
  baler: { count: 0, model: '' },
  trolley: { count: 1, type: 'Hydraulic', capacityTonnes: '3' },
  harvester: 0,
  pump: { count: 1, capacityHp: '5' },
  others: '',
};

export function initialState(): AppState {
  return {
    version: 3,
    session: { onboarded: false, signedIn: false, verified: false, phone: '', location: 'unknown' },
    profile: DEFAULT_PROFILE,
    prefs: { theme: 'system', text: 'default', motion: 'system', language: 'en' },
    demo: { network: 'normal', emptyData: false },
    bookmarks: ['a-soil-health-card', 'v-baling', 'n-stubble-cost'],
    unreadNotifications: [...INITIALLY_UNREAD],
    eventInterest: { 'e-training': 'interested' },
    deviceOrders: [],
    deviceBookings: [],
    deviceNotifications: [],
    lands: buildLands(),
    machinery: DEFAULT_MACHINERY,
    coords: null,
  };
}

function load(): AppState {
  const saved = readJSON<AppState>(STORAGE_KEY);
  if (!saved || saved.version !== 3) return initialState();
  // Merge so new fields get defaults after an update.
  const base = initialState();
  const prefs = { ...base.prefs, ...saved.prefs };
  prefs.language = normalizeLanguage(prefs.language);
  return { ...base, ...saved, session: { ...base.session, ...saved.session }, prefs, demo: { ...base.demo, ...saved.demo } };
}

/* ------------------------------------------------------------------ */
/* Store core                                                           */
/* ------------------------------------------------------------------ */

let state: AppState = typeof window === 'undefined' ? initialState() : load();
const listeners = new Set<() => void>();
let persistQueued = false;

function persist() {
  if (persistQueued) return;
  persistQueued = true;
  queueMicrotask(() => {
    persistQueued = false;
    writeJSON(STORAGE_KEY, state);
  });
}

export function getState(): AppState {
  return state;
}

export function setState(update: (s: AppState) => AppState): void {
  const next = update(state);
  if (next === state) return;
  state = next;
  persist();
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Select a slice of state. Return existing references or primitives from the selector. */
export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}

/* ------------------------------------------------------------------ */
/* Actions                                                              */
/* ------------------------------------------------------------------ */

export const actions = {
  completeOnboarding() {
    setState((s) => ({ ...s, session: { ...s.session, onboarded: true } }));
  },
  signIn(phone: string, verified: boolean) {
    setState((s) => ({
      ...s,
      session: { ...s.session, onboarded: true, signedIn: true, verified, phone: phone || s.session.phone },
      profile: phone ? { ...s.profile, phone } : s.profile,
    }));
  },
  verify(phone?: string) {
    setState((s) => ({ ...s, session: { ...s.session, verified: true, phone: phone ?? s.session.phone } }));
  },
  setLocation(location: Session['location'], coords?: { latitude: number; longitude: number }) {
    setState((s) => ({ ...s, session: { ...s.session, location }, coords: coords ?? s.coords }));
  },
  signOut() {
    setState((s) => ({ ...s, session: { ...s.session, signedIn: false } }));
  },
  updateProfile(patch: Partial<Profile>) {
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
  },
  toggleBookmark(id: string): boolean {
    let added = false;
    setState((s) => {
      added = !s.bookmarks.includes(id);
      return { ...s, bookmarks: added ? [id, ...s.bookmarks] : s.bookmarks.filter((b) => b !== id) };
    });
    return added;
  },
  markRead(id: string) {
    setState((s) => (s.unreadNotifications.includes(id) ? { ...s, unreadNotifications: s.unreadNotifications.filter((n) => n !== id) } : s));
  },
  markAllRead(): string[] {
    const previous = state.unreadNotifications;
    setState((s) => ({ ...s, unreadNotifications: [] }));
    return previous;
  },
  restoreUnread(ids: string[]) {
    setState((s) => ({ ...s, unreadNotifications: ids }));
  },
  setInterest(eventId: string, interest: Interest) {
    setState((s) => ({ ...s, eventInterest: { ...s.eventInterest, [eventId]: interest } }));
  },
  addOrder(order: FomOrder, notification: AppNotification) {
    setState((s) => ({
      ...s,
      deviceOrders: [order, ...s.deviceOrders],
      deviceNotifications: [notification, ...s.deviceNotifications],
      unreadNotifications: [notification.id, ...s.unreadNotifications],
    }));
  },
  addBooking(booking: Booking, notification: AppNotification) {
    setState((s) => ({
      ...s,
      deviceBookings: [booking, ...s.deviceBookings],
      deviceNotifications: [notification, ...s.deviceNotifications],
      unreadNotifications: [notification.id, ...s.unreadNotifications],
    }));
  },
  addLand(land: Land) {
    setState((s) => ({ ...s, lands: [...s.lands, land] }));
  },
  updateLand(id: string, patch: Partial<Land>) {
    setState((s) => ({ ...s, lands: s.lands.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  },
  upsertCrop(landId: string, crop: Crop) {
    setState((s) => ({
      ...s,
      lands: s.lands.map((l) => {
        if (l.id !== landId) return l;
        const exists = l.crops.some((c) => c.id === crop.id);
        return { ...l, crops: exists ? l.crops.map((c) => (c.id === crop.id ? crop : c)) : [...l.crops, crop] };
      }),
    }));
  },
  removeCrop(landId: string, cropId: string) {
    setState((s) => ({ ...s, lands: s.lands.map((l) => (l.id === landId ? { ...l, crops: l.crops.filter((c) => c.id !== cropId) } : l)) }));
  },
  setMachinery(machinery: Machinery) {
    setState((s) => ({ ...s, machinery }));
  },
  setPrefs(patch: Partial<Prefs>) {
    setState((s) => ({ ...s, prefs: { ...s.prefs, ...patch } }));
  },
  setDemo(patch: Partial<DemoSettings>) {
    setState((s) => ({ ...s, demo: { ...s.demo, ...patch } }));
  },
  resetAll() {
    removeKey(STORAGE_KEY);
    state = initialState();
    listeners.forEach((l) => l());
  },
};
