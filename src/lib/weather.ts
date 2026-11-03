import type { Advisory, Weather, WeatherDay, WeatherHour } from '@/types';
import { addDays, startOfDay, toISODate } from './dates';

/** WMO weather codes (as used by Open-Meteo) → plain words. */
export function conditionLabel(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code === 1) return 'Mostly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Cloudy';
}

export type ConditionIcon = 'sun' | 'cloud-sun' | 'cloud' | 'fog' | 'drizzle' | 'rain' | 'storm';

export function conditionIcon(code: number): ConditionIcon {
  if (code <= 1) return 'sun';
  if (code === 2) return 'cloud-sun';
  if (code === 3) return 'cloud';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if (code >= 95) return 'storm';
  if (code >= 61) return 'rain';
  return 'cloud';
}

/**
 * Spray advisory from the next 24 hours. This replaces the original fixed
 * "Today is a good day to apply pesticides" line.
 */
export function sprayAdvisory(current: Weather['current'], next24RainMax: number): Advisory {
  const raining = current.code >= 51 && current.code !== 45 && current.code !== 48;
  if (raining || next24RainMax >= 60) {
    return { tone: 'warning', title: 'Avoid spraying today', text: `Rain is likely (${Math.max(next24RainMax, current.rainChance)}% chance). Spray may wash off.` };
  }
  if (current.windKph >= 15) {
    return { tone: 'caution', title: 'Too windy to spray', text: `Wind at ${Math.round(current.windKph)} km/h will carry spray away. Try early tomorrow.` };
  }
  if (current.tempC >= 35) {
    return { tone: 'caution', title: 'Spray before 10 AM', text: 'It is hot. Spray in the cool morning or after 4 PM.' };
  }
  return { tone: 'good', title: 'Good day to spray', text: 'Calm and dry. Spray in the morning or late afternoon.' };
}

/** A believable sample forecast for Buldhana, used offline or when the live service is unreachable. */
export function sampleWeather(locationName: string, now = new Date()): Weather {
  const today = startOfDay(now);
  const pattern: [number, number, number, number][] = [
    // code, max, min, rain%
    [2, 32, 21, 10],
    [1, 33, 21, 5],
    [3, 31, 22, 25],
    [80, 28, 21, 70],
    [61, 27, 20, 80],
    [2, 30, 20, 20],
    [1, 31, 20, 10],
  ];
  const daily: WeatherDay[] = pattern.map(([code, maxC, minC, rainChance], i) => ({
    date: toISODate(addDays(today, i)),
    code,
    maxC,
    minC,
    rainChance,
  }));
  const hourly: WeatherHour[] = Array.from({ length: 12 }, (_, i) => {
    const t = new Date(now);
    t.setMinutes(0, 0, 0);
    t.setHours(t.getHours() + i);
    const h = t.getHours();
    const tempC = Math.round(21 + 11 * Math.max(0, Math.sin(((h - 6) / 12) * Math.PI)));
    return { time: t.toISOString(), tempC, code: h >= 7 && h <= 17 ? 2 : 1, rainChance: i > 8 ? 15 : 5 };
  });
  const hourNow = now.getHours();
  const currentTemp = Math.round(21 + 11 * Math.max(0, Math.sin(((hourNow - 6) / 12) * Math.PI)));
  const current = { tempC: currentTemp, feelsLikeC: currentTemp + 2, code: 2, humidity: 58, windKph: 9, rainChance: 10 };
  return {
    source: 'sample',
    locationName,
    updatedAt: now.toISOString(),
    current,
    daily,
    hourly,
    advisory: sprayAdvisory(current, Math.max(...hourly.map((h) => h.rainChance))),
  };
}

interface OpenMeteoResponse {
  current?: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    precipitation_probability?: number;
  };
  hourly?: { time: string[]; temperature_2m: number[]; weather_code: number[]; precipitation_probability: number[] };
  daily?: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max: number[] };
}

/** Parses an Open-Meteo forecast. Throws if the shape is not what we expect. */
export function parseOpenMeteo(json: OpenMeteoResponse, locationName: string, now = new Date()): Weather {
  const c = json.current;
  const h = json.hourly;
  const d = json.daily;
  if (!c || !h || !d) throw new Error('Unexpected weather response');
  const startIdx = Math.max(0, h.time.findIndex((t) => new Date(t).getTime() >= now.getTime() - 3_600_000));
  const hourly: WeatherHour[] = h.time.slice(startIdx, startIdx + 12).map((t, i) => ({
    time: new Date(t).toISOString(),
    tempC: Math.round(h.temperature_2m[startIdx + i]),
    code: h.weather_code[startIdx + i],
    rainChance: h.precipitation_probability[startIdx + i] ?? 0,
  }));
  const daily: WeatherDay[] = d.time.map((date, i) => ({
    date,
    code: d.weather_code[i],
    maxC: Math.round(d.temperature_2m_max[i]),
    minC: Math.round(d.temperature_2m_min[i]),
    rainChance: d.precipitation_probability_max[i] ?? 0,
  }));
  const current = {
    tempC: Math.round(c.temperature_2m),
    feelsLikeC: Math.round(c.apparent_temperature),
    code: c.weather_code,
    humidity: Math.round(c.relative_humidity_2m),
    windKph: Math.round(c.wind_speed_10m),
    rainChance: c.precipitation_probability ?? hourly[0]?.rainChance ?? 0,
  };
  return {
    source: 'live',
    locationName,
    updatedAt: now.toISOString(),
    current,
    daily,
    hourly,
    advisory: sprayAdvisory(current, Math.max(0, ...hourly.map((x) => x.rainChance))),
  };
}

export function openMeteoUrl(latitude: number, longitude: number): string {
  const p = new URLSearchParams({
    latitude: latitude.toFixed(3),
    longitude: longitude.toFixed(3),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,precipitation_probability',
    hourly: 'temperature_2m,weather_code,precipitation_probability',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '7',
    wind_speed_unit: 'kmh',
  });
  return `https://api.open-meteo.com/v1/forecast?${p.toString()}`;
}
