import { AlertTriangle, CheckCircle2, Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSun, Droplets, Info, MapPin, RefreshCw, Sun, ThermometerSun, Wind } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Weather } from '@/types';
import { conditionIcon, sprayKind, type ConditionIcon, type SprayKind } from '@/lib/weather';
import { sprayText, type HomeT } from '@/i18n/home';
import { Sheet } from '../../ui/Sheet';
import { Button } from '../../ui/Button';
import { Note, Skel } from '../../ui/Blocks';
import s from './Weather.module.css';

const ICONS: Record<ConditionIcon, typeof Sun> = { sun: Sun, 'cloud-sun': CloudSun, cloud: Cloud, fog: CloudFog, drizzle: CloudDrizzle, rain: CloudRain, storm: CloudLightning };
const TONE_ICON = { good: CheckCircle2, caution: Info, warning: AlertTriangle };
const SPRAY_TONE: Record<SprayKind, 'good' | 'caution' | 'warning'> = { good: 'good', heat: 'caution', wind: 'caution', rain: 'warning' };

function spraySummary(weather: Weather, t: HomeT) {
  const rainMax = Math.max(0, ...weather.hourly.map((h) => h.rainChance));
  const kind = sprayKind(weather.current, rainMax);
  return { tone: SPRAY_TONE[kind], ...sprayText(t, kind, weather.current, rainMax) };
}

export function WeatherGlyph({ code, className }: { code: number; className?: string }) {
  const Icon = ICONS[conditionIcon(code)];
  return <Icon className={className} aria-hidden />;
}

/** The home "instrument panel": temperature as a large thin numeral, spray advice beside it, then rain, humidity, wind and the next days. */
export function WeatherPanel({ weather, loading, onOpen, t }: { weather?: Weather; loading: boolean; onOpen: () => void; t: HomeT }) {
  if (loading || !weather)
    return (
      <div className={s.panel} aria-busy="true" aria-label={t.loadingWeather}>
        <div className={s.left}>
          <Skel w={90} h={12} night />
          <Skel w={110} h={64} night style={{ marginTop: 14 }} />
        </div>
        <div className={s.right}>
          <Skel h={80} night r="var(--r-md)" />
        </div>
        <div className={s.full}>
          <Skel h={92} night r="var(--r-md)" />
        </div>
      </div>
    );
  const today = weather.daily[0];
  const spray = spraySummary(weather, t);
  const ToneIcon = TONE_ICON[spray.tone];
  const cond = t.condition(weather.current.code);
  return (
    <motion.button type="button" whileTap={{ scale: 0.985 }} className={s.panel} onClick={onOpen} aria-label={t.weatherA11y(weather.current.tempC, cond, spray.title)}>
      <span className={s.left}>
        <span className={s.loc}>
          <MapPin aria-hidden /> {weather.locationName}
        </span>
        <span className={s.temp}>
          {weather.current.tempC}
          <span className={s.deg}>°</span>
        </span>
        <span className={s.cond}>
          <WeatherGlyph code={weather.current.code} className={s.condIcon} />
          {cond}
        </span>
        {today && (
          <span className={s.hilo}>
            {t.high} {today.maxC}° · {t.low} {today.minC}°
          </span>
        )}
      </span>
      <span className={s.right}>
        <span className={`${s.advice} ${s[`adv_${spray.tone}`]}`}>
          <span className={s.adviceKicker}>
            <ToneIcon aria-hidden /> {t.sprayKicker}
          </span>
          <strong>{spray.title}</strong>
          <span>{spray.text}</span>
        </span>
      </span>
      <span className={`${s.full} ${s.metrics}`} aria-hidden>
        <span>
          <CloudRain />
          <small>{t.rain}</small>
          <b>{weather.current.rainChance}%</b>
        </span>
        <span>
          <Droplets />
          <small>{t.humidity}</small>
          <b>{weather.current.humidity}%</b>
        </span>
        <span>
          <Wind />
          <small>{t.wind}</small>
          <b>{t.kph(weather.current.windKph)}</b>
        </span>
      </span>
      <span className={`${s.full} ${s.days5}`} aria-hidden>
        {weather.daily.slice(0, 5).map((d, i) => (
          <span key={d.date} className={s.day5}>
            <span className={s.day5Name}>{t.dayLabel(d.date, i, true)}</span>
            <WeatherGlyph code={d.code} className={s.day5Icon} />
            <strong>{d.maxC}°</strong>
            <span>{d.minC}°</span>
            <span className={`${s.rain} ${d.rainChance >= 60 ? s.wet : ''}`}>{d.rainChance}%</span>
          </span>
        ))}
      </span>
      <span className={`${s.source} ${weather.source === 'sample' ? s.sourceSample : ''}`}>{weather.source === 'live' ? `${t.live} · Open-Meteo` : t.sample}</span>
    </motion.button>
  );
}

export function WeatherSheet({ open, onClose, weather, onRetry, t, tokens }: { open: boolean; onClose: () => void; weather?: Weather; onRetry: () => void; t: HomeT; tokens: string }) {
  if (!weather) return <Sheet open={open} onClose={onClose} title={t.weather} />;
  const spray = spraySummary(weather, t);
  const max = Math.max(...weather.daily.map((d) => d.maxC));
  const min = Math.min(...weather.daily.map((d) => d.minC));
  return (
    <Sheet open={open} onClose={onClose} kicker={`${weather.source === 'live' ? t.live : t.sample} · ${t.updated(t.ago(weather.updatedAt))}`} title={weather.locationName}>
      <div className={`${s.sheet} ${tokens}`} lang={t.contentLang}>
        <div className={s.now}>
          <span className={s.nowTemp}>
            {weather.current.tempC}
            <span className={s.deg}>°</span>
          </span>
          <div>
            <WeatherGlyph code={weather.current.code} className={s.nowIcon} />
            <p className={s.nowCond}>{t.condition(weather.current.code)}</p>
          </div>
        </div>
        <dl className={s.stats}>
          {[
            { icon: <ThermometerSun aria-hidden />, label: t.feelsLike, value: `${weather.current.feelsLikeC}°` },
            { icon: <Droplets aria-hidden />, label: t.humidity, value: `${weather.current.humidity}%` },
            { icon: <Wind aria-hidden />, label: t.wind, value: t.kph(weather.current.windKph) },
            { icon: <CloudRain aria-hidden />, label: t.rain, value: `${weather.current.rainChance}%` },
          ].map((x) => (
            <div key={x.label} className={s.stat}>
              <dt>
                {x.icon}
                {x.label}
              </dt>
              <dd>{x.value}</dd>
            </div>
          ))}
        </dl>
        <Note tone={spray.tone === 'good' ? 'success' : spray.tone === 'caution' ? 'info' : 'warning'} title={spray.title}>
          {spray.text}
        </Note>
        <section>
          <h3 className={s.h3}>{t.next12}</h3>
          <div className={s.hourRail}>
            {weather.hourly.map((h, i) => (
              <div key={h.time} className={s.hourCell}>
                <span>{i === 0 ? t.now : t.time(h.time)}</span>
                <WeatherGlyph code={h.code} className={s.hourIcon} />
                <strong>{h.tempC}°</strong>
                <span className={s.rain}>{h.rainChance}%</span>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3 className={s.h3}>{t.days7}</h3>
          <ul className={s.days}>
            {weather.daily.map((d, i) => {
              const left = ((d.minC - min) / Math.max(1, max - min)) * 100;
              const width = ((d.maxC - d.minC) / Math.max(1, max - min)) * 100;
              return (
                <li key={d.date} className={s.day}>
                  <span className={s.dayName} aria-hidden>
                    {t.dayLabel(d.date, i)}
                  </span>
                  <WeatherGlyph code={d.code} className={s.dayIcon} />
                  <span className={s.dayRain}>{d.rainChance >= 20 ? `${d.rainChance}%` : ''}</span>
                  <span className={s.dayMin}>{d.minC}°</span>
                  <span className={s.range} aria-hidden>
                    <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.2 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} style={{ left: `${left}%`, width: `${Math.max(width, 8)}%` }} />
                  </span>
                  <span className={s.dayMax}>{d.maxC}°</span>
                  <span className="sr-only">
                    {t.dayA11y(t.weekday(d.date, 'long'), t.condition(d.code), d.minC, d.maxC, d.rainChance)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
        {weather.source === 'sample' ? (
          <div className={s.sourceRow}>
            <p>{t.sampleLong}</p>
            <Button variant="secondary" size="sm" icon={<RefreshCw aria-hidden />} onClick={onRetry}>
              {t.tryLive}
            </Button>
          </div>
        ) : (
          <p className={s.sourceRow}>{t.source}</p>
        )}
      </div>
    </Sheet>
  );
}
