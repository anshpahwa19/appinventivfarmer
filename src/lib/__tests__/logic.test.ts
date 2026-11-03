import { describe, expect, it } from 'vitest';
import { orderTotals, formatQuantity, toKg } from '../pricing';
import { validatePhone, validatePincode, validateQuantity, validateAcres } from '../validation';
import { formatCurrency, formatDate, formatTime, formatRelative, formatPhone, formatDuration, formatRelativeInline } from '../format';
import { sprayAdvisory, conditionLabel, parseOpenMeteo, sampleWeather } from '../weather';
import { addDays, diffDays, fromISODate, toISODate } from '../dates';
import { filterContent } from '../../services/api';
import { buildContent } from '../../data/content';
import { buildForms, cycleProgress, labourCost, machineryCost } from '../../data/forms';
import { buildEvents, eventStatus } from '../../data/events';

describe('pricing', () => {
  it('uses one calculation for subtotal, shipping and total', () => {
    expect(orderTotals(250, 'kg')).toEqual({ kg: 250, subtotal: 25_000, shipping: 100, total: 25_100 });
    expect(orderTotals(2, 'MT')).toEqual({ kg: 2000, subtotal: 200_000, shipping: 100, total: 200_100 });
  });
  it('charges nothing for an empty quantity', () => {
    expect(orderTotals(0, 'kg').total).toBe(0);
    expect(orderTotals(Number.NaN, 'kg').total).toBe(0);
  });
  it('converts tonnes and formats quantities', () => {
    expect(toKg(1.5, 'MT')).toBe(1500);
    expect(formatQuantity(1000, 'kg')).toBe('1,000 kg');
    expect(formatQuantity(2, 'MT')).toBe('2 MT');
  });
});

describe('validation', () => {
  it('validates Indian mobile numbers with specific messages', () => {
    expect(validatePhone('9876543210')).toBeNull();
    expect(validatePhone('98765 43210')).toBeNull();
    expect(validatePhone('')).toMatch(/Enter your 10-digit/);
    expect(validatePhone('98765')).toMatch(/5 more digits/);
    expect(validatePhone('1234567890')).toMatch(/start with 6, 7, 8 or 9/);
  });
  it('validates PIN codes', () => {
    expect(validatePincode('443001')).toBeNull();
    expect(validatePincode('44300')).toMatch(/6 digits/);
    expect(validatePincode('043001')).toMatch(/do not start with 0/);
  });
  it('enforces order limits per unit', () => {
    expect(validateQuantity('250', 'kg')).toBeNull();
    expect(validateQuantity('20', 'kg')).toMatch(/Minimum order is 50 kg/);
    expect(validateQuantity('2.5', 'kg')).toMatch(/whole kilograms/);
    expect(validateQuantity('1.25', 'MT')).toBeNull();
    expect(validateQuantity('1.255', 'MT')).toMatch(/2 decimal/);
    expect(validateQuantity('25', 'MT')).toMatch(/Maximum order is 20 MT/);
  });
  it('limits booking area to the field size', () => {
    expect(validateAcres('12', 12)).toBeNull();
    expect(validateAcres('13', 12)).toMatch(/12 acres/);
  });
});

describe('formatting', () => {
  it('uses one date and time style', () => {
    expect(formatDate('2026-11-03')).toBe('3 Nov 2026');
    expect(formatDate('2026-11-03', 'long')).toBe('Tuesday, 3 November 2026');
    expect(formatTime('15:00')).toBe('3:00 PM');
    expect(formatTime('00:05')).toBe('12:05 AM');
  });
  it('formats rupees with Indian grouping', () => {
    expect(formatCurrency(200100)).toBe('₹2,00,100');
  });
  it('formats relative times without awkward casing', () => {
    const now = new Date('2026-11-03T12:00:00');
    expect(formatRelative(new Date('2026-11-03T11:00:00'), now)).toBe('1 hour ago');
    expect(formatRelative(new Date('2026-11-02T09:00:00'), now)).toBe('Yesterday');
    expect(formatRelativeInline(new Date('2026-11-02T09:00:00'), now)).toBe('yesterday');
    expect(formatRelativeInline(new Date('2026-09-30T09:00:00'), now)).toBe('30 Sep 2026');
  });
  it('formats phone numbers and durations', () => {
    expect(formatPhone('9876543210')).toBe('+91 98765 43210');
    expect(formatDuration(185)).toBe('3:05');
  });
});

describe('dates', () => {
  it('round-trips local dates', () => {
    const d = fromISODate('2026-03-01');
    expect(toISODate(addDays(d, 30))).toBe('2026-03-31');
    expect(diffDays(d, fromISODate('2026-05-30'))).toBe(90);
  });
});

describe('weather advisory', () => {
  const calm = { tempC: 30, feelsLikeC: 31, code: 2, humidity: 50, windKph: 8, rainChance: 10 };
  it('says good to spray when calm and dry', () => {
    expect(sprayAdvisory(calm, 10).tone).toBe('good');
  });
  it('warns before rain', () => {
    expect(sprayAdvisory(calm, 70)).toMatchObject({ tone: 'warning', title: 'Avoid spraying today' });
  });
  it('cautions on wind and heat', () => {
    expect(sprayAdvisory({ ...calm, windKph: 18 }, 0).title).toBe('Too windy to spray');
    expect(sprayAdvisory({ ...calm, tempC: 37 }, 0).title).toBe('Spray before 10 AM');
  });
  it('labels conditions and parses Open-Meteo responses', () => {
    expect(conditionLabel(2)).toBe('Partly cloudy');
    const now = new Date('2026-11-03T10:00:00Z');
    const w = parseOpenMeteo(
      {
        current: { time: '2026-11-03T10:00', temperature_2m: 31.4, apparent_temperature: 33, relative_humidity_2m: 55, weather_code: 1, wind_speed_10m: 7.2 },
        hourly: { time: ['2026-11-03T10:00Z', '2026-11-03T11:00Z'], temperature_2m: [31, 32], weather_code: [1, 2], precipitation_probability: [5, 10] },
        daily: { time: ['2026-11-03'], weather_code: [2], temperature_2m_max: [32.6], temperature_2m_min: [20.2], precipitation_probability_max: [10] },
      },
      'Test village',
      now,
    );
    expect(w).toMatchObject({ source: 'live', current: { tempC: 31, windKph: 7 }, daily: [{ maxC: 33, minC: 20 }] });
    expect(w.advisory.tone).toBe('good');
    expect(() => parseOpenMeteo({}, 'x')).toThrow();
  });
  it('labels the offline forecast as a sample', () => {
    expect(sampleWeather('Ratanpur').source).toBe('sample');
  });
});

describe('content filtering', () => {
  const now = new Date('2026-11-03T12:00:00');
  const items = buildContent(now);
  it('filters by kind, category, text and date range', () => {
    expect(filterContent(items, { kind: 'video' }).every((i) => i.kind === 'video')).toBe(true);
    expect(filterContent(items, { kind: 'news', category: 'residue' }).every((i) => i.category === 'residue')).toBe(true);
    expect(filterContent(items, { q: 'soil health card' }).map((i) => i.id)).toContain('a-soil-health-card');
    const lastWeek = filterContent(items, { from: '2026-10-28', to: '2026-11-03' });
    expect(lastWeek.length).toBeGreaterThan(0);
    expect(lastWeek.every((i) => i.publishedAt >= new Date('2026-10-28T00:00:00').toISOString())).toBe(true);
  });
  it('sorts newest first', () => {
    const list = filterContent(items, {});
    expect([...list].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))).toEqual(list);
  });
});

describe('season records', () => {
  it('shows totals that add up', () => {
    expect(labourCost(5, 150, 5, 150, 7, 5)).toBe(52_500);
    expect(machineryCost(500, 5, 5, 5, 100)).toEqual({ litres: 125, fuel: 12_500, total: 13_000 });
  });
  it('tracks cycle progress', () => {
    const [cotton, wheat] = buildForms(new Date('2026-11-03T12:00:00'));
    expect(cycleProgress(cotton)).toEqual({ done: 3, total: 8, complete: false });
    expect(cycleProgress(wheat).complete).toBe(true);
  });
});

describe('events', () => {
  it('derives status from the clock', () => {
    const now = new Date('2026-11-03T12:00:00');
    const events = buildEvents(now);
    const statuses = events.map((e) => eventStatus(e, now));
    expect(statuses).toContain('live');
    expect(statuses).toContain('upcoming');
    expect(statuses).toContain('completed');
  });
});
