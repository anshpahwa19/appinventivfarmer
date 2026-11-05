/**
 * Home screen alerts, derived only from data the app already has:
 * the forecast (live or the labelled sample), the farmer's fields and crops,
 * season records, bookings, orders and events.
 *
 * Nothing here predicts pests or disease. Weather-based crop advice is phrased
 * as a general advisory (for example "damp, warm air helps leaf disease
 * spread"), never as a diagnosis.
 */
import type { Booking, FarmEvent, FomOrder, FormCycle, Land, StepId, Weather } from '@/types';
import { STEP_ORDER, cycleProgress } from '@/data/forms';
import { eventStatus } from '@/data/events';
import { diffDays, fromISODate, startOfDay } from './dates';

export type AlertSeverity = 'normal' | 'warning' | 'urgent';

export type AlertKind =
  | 'storm'
  | 'heavyRain'
  | 'rainLikely'
  | 'heat'
  | 'wind'
  | 'cold'
  | 'irrigate'
  | 'humidity'
  | 'nextStep'
  | 'harvestSoon'
  | 'emptyField'
  | 'bookingRejected'
  | 'bookingPending'
  | 'bookingSoon'
  | 'orderRejected'
  | 'eventLive';

export type AlertAction =
  /** Open the forecast sheet on Home. */
  | { kind: 'forecast' }
  /** Navigate inside the app. `verified` means the target needs a verified number. */
  | { kind: 'route'; to: string; verified?: boolean };

export interface AlertVars {
  /** ISO date (yyyy-mm-dd) the alert is about. */
  day?: string;
  value?: number;
  crop?: string;
  field?: string;
  step?: StepId;
  id?: string;
  title?: string;
  done?: number;
  total?: number;
}

export interface HomeAlert {
  id: string;
  kind: AlertKind;
  severity: AlertSeverity;
  /** weather = from the forecast, farm = from the farmer's own records. */
  group: 'weather' | 'farm';
  vars: AlertVars;
  action: AlertAction;
  /** True when the alert comes from the offline sample forecast, not live data. */
  sample?: boolean;
}

export interface AlertInput {
  weather?: Weather;
  lands?: Land[];
  forms?: FormCycle[];
  bookings?: Booking[];
  orders?: FomOrder[];
  events?: FarmEvent[];
  now?: Date;
}

/** Thresholds, kept together so they are easy to review with an agronomist. */
export const THRESHOLDS = {
  /** IMD "heavy rain" starts at 64.5 mm in 24 hours. */
  heavyRainMm: 64.5,
  rainLikelyPct: 70,
  dryPct: 30,
  irrigateHeatC: 33,
  heatWarnC: 37,
  heatUrgentC: 40,
  windNowKph: 30,
  windDayKph: 40,
  coldC: 8,
  humidPct: 80,
  humidWithRainPct: 70,
  harvestSoonDays: 21,
  rejectedRecentDays: 14,
  bookingSoonDays: 7,
  orderRecentDays: 30,
} as const;

const RANK: Record<AlertSeverity, number> = { urgent: 0, warning: 1, normal: 2 };

/** The crop the farmer is actively recording, or a sown crop on an active field. */
function focusCrop(lands: Land[], forms: FormCycle[]) {
  const cycle = forms.find((f) => !cycleProgress(f).complete);
  if (cycle) return { crop: cycle.crop.name, field: cycle.landName, landId: cycle.landId, cycle };
  for (const l of lands) {
    if (!l.active) continue;
    const c = l.crops.find((x) => x.sowingDate);
    if (c) return { crop: c.name, field: l.name, landId: l.id, cycle: undefined };
  }
  return undefined;
}

function weatherAlerts(w: Weather, focus: ReturnType<typeof focusCrop>): HomeAlert[] {
  const out: HomeAlert[] = [];
  const sample = w.source === 'sample';
  const next = w.daily.slice(0, 3);
  const forecast: AlertAction = { kind: 'forecast' };
  const push = (a: Omit<HomeAlert, 'group' | 'sample'>) => out.push({ ...a, group: 'weather', sample });

  const storm = next.find((d) => d.code >= 95);
  if (storm) push({ id: `storm-${storm.date}`, kind: 'storm', severity: 'urgent', vars: { day: storm.date }, action: forecast });

  const heavy = next.find((d) => (d.rainMm ?? 0) >= THRESHOLDS.heavyRainMm);
  if (heavy) push({ id: `heavy-${heavy.date}`, kind: 'heavyRain', severity: 'urgent', vars: { day: heavy.date, value: Math.round(heavy.rainMm ?? 0) }, action: forecast });

  if (!storm && !heavy) {
    const wet = next.find((d) => d.rainChance >= THRESHOLDS.rainLikelyPct);
    if (wet) push({ id: `rain-${wet.date}`, kind: 'rainLikely', severity: 'warning', vars: { day: wet.date, value: wet.rainChance }, action: forecast });
  }

  const hot = next.find((d) => d.maxC >= THRESHOLDS.heatWarnC);
  if (hot) push({ id: `heat-${hot.date}`, kind: 'heat', severity: hot.maxC >= THRESHOLDS.heatUrgentC ? 'urgent' : 'warning', vars: { day: hot.date, value: hot.maxC }, action: forecast });

  const windyDay = next.slice(0, 2).find((d) => (d.windMaxKph ?? 0) >= THRESHOLDS.windDayKph);
  if (w.current.windKph >= THRESHOLDS.windNowKph || windyDay) {
    push({ id: 'wind', kind: 'wind', severity: 'warning', vars: { value: Math.max(w.current.windKph, windyDay?.windMaxKph ?? 0), day: windyDay?.date }, action: forecast });
  }

  const cold = next.find((d) => d.minC <= THRESHOLDS.coldC);
  if (cold) push({ id: `cold-${cold.date}`, kind: 'cold', severity: 'warning', vars: { day: cold.date, value: cold.minC }, action: forecast });

  // Irrigation: no meaningful rain in the next three days and it is warm.
  const dry = next.length >= 3 && next.every((d) => d.rainChance < THRESHOLDS.dryPct);
  const warm = Math.max(...next.map((d) => d.maxC)) >= THRESHOLDS.irrigateHeatC;
  if (dry && warm && focus) {
    push({
      id: 'irrigate',
      kind: 'irrigate',
      severity: 'warning',
      vars: { value: next.length, crop: focus.crop, field: focus.field, step: 'water' },
      action: focus.cycle ? { kind: 'route', to: `/forms/${focus.cycle.id}/steps/water` } : { kind: 'route', to: `/lands/${focus.landId}` },
    });
  }

  // General disease-risk advisory: damp, warm air. Not a pest or disease report.
  const wetSoon = next.some((d) => d.rainChance >= 60);
  const humid = w.current.humidity >= THRESHOLDS.humidPct || (wetSoon && w.current.humidity >= THRESHOLDS.humidWithRainPct);
  if (humid && w.current.tempC >= 18 && w.current.tempC <= 34) {
    push({
      id: 'humidity',
      kind: 'humidity',
      severity: 'normal',
      vars: { value: w.current.humidity, crop: focus?.crop, field: focus?.field },
      action: focus ? { kind: 'route', to: `/lands/${focus.landId}` } : forecast,
    });
  }
  return out;
}

function farmAlerts(input: Required<Omit<AlertInput, 'weather'>>): HomeAlert[] {
  const { lands, forms, bookings, orders, events, now } = input;
  const out: HomeAlert[] = [];
  const today = startOfDay(now);
  const push = (a: Omit<HomeAlert, 'group'>) => out.push({ ...a, group: 'farm' });
  const daysUntil = (iso: string) => diffDays(today, fromISODate(iso.slice(0, 10)));
  const daysSince = (iso: string) => diffDays(new Date(iso), today);

  const live = events.find((e) => eventStatus(e, now) === 'live');
  if (live) push({ id: `event-${live.id}`, kind: 'eventLive', severity: 'normal', vars: { title: live.title }, action: { kind: 'route', to: `/events/${live.id}` } });

  const cycle = forms.find((f) => !cycleProgress(f).complete);
  if (cycle) {
    const p = cycleProgress(cycle);
    const harvestIn = daysUntil(cycle.crop.harvestDate);
    if (harvestIn >= 0 && harvestIn <= THRESHOLDS.harvestSoonDays) {
      push({ id: `harvest-${cycle.id}`, kind: 'harvestSoon', severity: 'warning', vars: { crop: cycle.crop.name, field: cycle.landName, value: harvestIn }, action: { kind: 'route', to: '/bookings/new', verified: true } });
    }
    const nextStep = STEP_ORDER.find((id) => cycle.steps.find((s) => s.id === id)?.status === 'pending');
    if (nextStep) {
      push({
        id: `step-${cycle.id}-${nextStep}`,
        kind: 'nextStep',
        severity: 'normal',
        vars: { crop: cycle.crop.name, field: cycle.landName, step: nextStep, done: p.done, total: p.total },
        action: { kind: 'route', to: `/forms/${cycle.id}/steps/${nextStep}` },
      });
    }
  }

  for (const l of lands) {
    if (l.active && l.crops.length === 0) push({ id: `empty-${l.id}`, kind: 'emptyField', severity: 'normal', vars: { field: l.name }, action: { kind: 'route', to: `/lands/${l.id}` } });
  }

  for (const b of bookings) {
    if (b.status === 'rejected' && daysSince(b.decidedAt ?? b.createdAt) <= THRESHOLDS.rejectedRecentDays) {
      push({ id: `booking-${b.id}`, kind: 'bookingRejected', severity: 'warning', vars: { id: b.id, crop: b.crop, field: b.landName }, action: { kind: 'route', to: `/bookings/${b.id}` } });
    }
  }
  const upcoming = bookings
    .filter((b) => b.status !== 'rejected' && daysUntil(b.date) >= 0 && daysUntil(b.date) <= THRESHOLDS.bookingSoonDays)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  if (upcoming) {
    push({
      id: `booking-${upcoming.id}`,
      kind: upcoming.status === 'approved' ? 'bookingSoon' : 'bookingPending',
      severity: 'normal',
      vars: { id: upcoming.id, day: upcoming.date, crop: upcoming.crop, field: upcoming.landName },
      action: { kind: 'route', to: `/bookings/${upcoming.id}` },
    });
  }

  for (const o of orders) {
    if (o.status === 'rejected' && daysSince(o.decidedAt ?? o.createdAt) <= THRESHOLDS.orderRecentDays) {
      push({ id: `order-${o.id}`, kind: 'orderRejected', severity: 'warning', vars: { id: o.id }, action: { kind: 'route', to: `/orders/fom/${o.id}` } });
    }
  }
  return out;
}

/** All alerts for Home, most severe first; weather before farm records at the same severity. */
export function deriveAlerts(input: AlertInput): HomeAlert[] {
  const now = input.now ?? new Date();
  const lands = input.lands ?? [];
  const forms = input.forms ?? [];
  const focus = focusCrop(lands, forms);
  const list = [
    ...(input.weather ? weatherAlerts(input.weather, focus) : []),
    ...farmAlerts({ lands, forms, bookings: input.bookings ?? [], orders: input.orders ?? [], events: input.events ?? [], now }),
  ];
  return list
    .map((a, i) => ({ a, i }))
    .sort((x, y) => RANK[x.a.severity] - RANK[y.a.severity] || x.i - y.i)
    .map((x) => x.a);
}

export function countBySeverity(alerts: HomeAlert[]): Record<AlertSeverity, number> {
  const c = { urgent: 0, warning: 0, normal: 0 };
  alerts.forEach((a) => (c[a.severity] += 1));
  return c;
}
