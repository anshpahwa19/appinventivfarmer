import { describe, expect, it } from 'vitest';
import type { Weather, WeatherDay } from '@/types';
import { deriveAlerts, countBySeverity } from '../alerts';
import { sampleWeather, sprayAdvisory, sprayKind } from '../weather';
import { classifyError } from '../voice';
import { buildLands } from '../../data/lands';
import { buildForms } from '../../data/forms';
import { buildBookings } from '../../data/bookings';
import { normalizeLanguage } from '../../services/store';
import { HOME_STRINGS, alertText, makeT, matchIntent } from '../../i18n/home';

const NOW = new Date('2026-11-05T10:00:00');

function wx(days: Partial<WeatherDay>[], current: Partial<Weather['current']> = {}): Weather {
  const base = sampleWeather('Test', NOW);
  return {
    ...base,
    source: 'live',
    current: { ...base.current, humidity: 50, windKph: 8, tempC: 30, ...current },
    daily: base.daily.map((d, i) => ({ ...d, code: 1, rainChance: 5, rainMm: 0, maxC: 30, minC: 20, windMaxKph: 10, ...(days[i] ?? {}) })),
  };
}

describe('home alerts', () => {
  const lands = buildLands(NOW);
  const forms = buildForms(NOW);

  it('raises urgent storm and heavy-rain alerts from the forecast', () => {
    const a = deriveAlerts({ weather: wx([{}, { code: 95, rainMm: 80, rainChance: 90 }]), lands, forms, now: NOW });
    expect(a[0].severity).toBe('urgent');
    expect(a.map((x) => x.kind)).toEqual(expect.arrayContaining(['storm', 'heavyRain']));
    // Heavy rain or a storm replaces the softer "rain likely" alert.
    expect(a.some((x) => x.kind === 'rainLikely')).toBe(false);
  });

  it('suggests irrigation when the next three days are dry and hot, pointing at the water step', () => {
    const a = deriveAlerts({ weather: wx([{ maxC: 35 }, { maxC: 36 }, { maxC: 34 }]), lands, forms, now: NOW });
    const irrigate = a.find((x) => x.kind === 'irrigate');
    expect(irrigate?.severity).toBe('warning');
    expect(irrigate?.action).toEqual({ kind: 'route', to: '/forms/fc-cotton/steps/water' });
  });

  it('does not suggest irrigation when rain is coming', () => {
    const a = deriveAlerts({ weather: wx([{ maxC: 35 }, { maxC: 35, rainChance: 70 }]), lands, forms, now: NOW });
    expect(a.some((x) => x.kind === 'irrigate')).toBe(false);
    expect(a.some((x) => x.kind === 'rainLikely')).toBe(true);
  });

  it('gives a general humidity advisory, never a pest report', () => {
    const a = deriveAlerts({ weather: wx([], { humidity: 88, tempC: 27 }), lands, forms, now: NOW });
    const h = a.find((x) => x.kind === 'humidity');
    expect(h?.severity).toBe('normal');
  });

  it('marks weather alerts from the sample forecast', () => {
    const w = { ...wx([{ maxC: 41 }]), source: 'sample' as const };
    const heat = deriveAlerts({ weather: w, now: NOW }).find((x) => x.kind === 'heat');
    expect(heat).toMatchObject({ severity: 'urgent', sample: true });
  });

  it('derives record alerts from season steps and bookings, most severe first', () => {
    const a = deriveAlerts({ lands, forms, bookings: buildBookings(NOW), now: NOW });
    expect(a.some((x) => x.kind === 'nextStep')).toBe(true);
    expect(a.some((x) => x.kind === 'bookingRejected')).toBe(true);
    const ranks = a.map((x) => ({ urgent: 0, warning: 1, normal: 2 })[x.severity]);
    expect([...ranks].sort((p, q) => p - q)).toEqual(ranks);
    expect(countBySeverity(a).warning).toBeGreaterThan(0);
  });

  it('returns nothing with no data', () => {
    expect(deriveAlerts({ now: NOW })).toEqual([]);
  });
});

describe('home i18n', () => {
  it('has every key, non-empty, in all three languages', () => {
    const keys = (o: object): string[] => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' ? keys(v).map((x) => `${k}.${x}`) : [k]));
    const en = keys(HOME_STRINGS.en).filter((k) => !k.startsWith('crops') && k !== 'reviewNote');
    for (const lang of ['hi', 'mr'] as const) {
      const other = keys(HOME_STRINGS[lang]);
      for (const k of en) expect(other, `${lang}: ${k}`).toContain(k);
      expect(HOME_STRINGS[lang].reviewNote).not.toBe('');
    }
  });

  it('localises alert copy with crop, step and day words', () => {
    const forms = buildForms(NOW);
    const [step] = deriveAlerts({ forms, now: NOW }).filter((a) => a.kind === 'nextStep');
    expect(alertText(makeT('en'), step).title).toBe('Next record for Cotton: Watering');
    expect(alertText(makeT('hi'), step).title).toContain('कपास');
    expect(alertText(makeT('mr'), step).title).toContain('कापूस');
    expect(makeT('en').dayPhrase('2026-11-06', NOW)).toBe('tomorrow');
  });

  it('matches voice words to app screens in all three languages', () => {
    expect(matchIntent('When will it rain?')).toBe('weather');
    expect(matchIntent('मुझे खाद का ऑर्डर देना है')).toBe('order');
    expect(matchIntent('माझ्या शेतात पाऊस कधी')).toBe('fields');
    expect(matchIntent('hello')).toBeNull();
  });
});

describe('languages without Home strings yet', () => {
  it('can be chosen and show Home in English, with an honest lang attribute', () => {
    const t = makeT('pa');
    expect(t.lang).toBe('pa');
    expect(t.contentLang).toBe('en');
    expect(t.alertsTitle).toBe(HOME_STRINGS.en.alertsTitle);
    expect(makeT('hi').contentLang).toBe('hi');
  });
});

describe('language preference', () => {
  it('keeps known languages and falls back to English', () => {
    expect(normalizeLanguage('mr')).toBe('mr');
    expect(normalizeLanguage('te')).toBe('te');
    expect(normalizeLanguage('fr')).toBe('en');
    expect(normalizeLanguage(undefined)).toBe('en');
  });
});

describe('voice and spray', () => {
  it('maps speech errors to honest states', () => {
    expect(classifyError('not-allowed').status).toBe('denied');
    expect(classifyError('no-speech')).toEqual({ status: 'error', error: 'no-speech' });
    expect(classifyError('network')).toEqual({ status: 'error', error: 'offline' });
  });

  it('keeps the spray advisory consistent with its kind', () => {
    const c = { tempC: 30, feelsLikeC: 31, code: 1, humidity: 50, windKph: 20, rainChance: 0 };
    expect(sprayKind(c, 0)).toBe('wind');
    expect(sprayAdvisory(c, 0).title).toBe('Too windy to spray');
  });
});
