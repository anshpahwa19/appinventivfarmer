import { AlertTriangle, CheckCircle2, Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSun, Droplets, Info, MapPin, RefreshCw, Sun, ThermometerSun, Wind } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Weather } from '@/types';
import { conditionIcon, conditionLabel, type ConditionIcon } from '@/lib/weather';
import { formatDate, formatRelativeInline, formatTime, weekdayShort } from '@/lib/format';
import { Sheet } from '../../ui/Sheet';
import { Button } from '../../ui/Button';
import { Note, Skel } from '../../ui/Blocks';
import s from './Weather.module.css';

const ICONS: Record<ConditionIcon, typeof Sun> = { sun: Sun, 'cloud-sun': CloudSun, cloud: Cloud, fog: CloudFog, drizzle: CloudDrizzle, rain: CloudRain, storm: CloudLightning };
const TONE_ICON = { good: CheckCircle2, caution: Info, warning: AlertTriangle };

export function WeatherGlyph({ code, className }: { code: number; className?: string }) {
  const Icon = ICONS[conditionIcon(code)];
  return <Icon className={className} aria-hidden />;
}

/** The home "instrument panel": temperature as a large thin numeral, spray advice beside it. */
export function WeatherPanel({ weather, loading, onOpen }: { weather?: Weather; loading: boolean; onOpen: () => void }) {
  if (loading || !weather)
    return (
      <div className={s.panel} aria-busy="true" aria-label="Loading weather">
        <div className={s.left}>
          <Skel w={90} h={12} night />
          <Skel w={110} h={64} night style={{ marginTop: 14 }} />
        </div>
        <div className={s.right}>
          <Skel h={80} night r="var(--r-md)" />
        </div>
      </div>
    );
  const today = weather.daily[0];
  const ToneIcon = TONE_ICON[weather.advisory.tone];
  return (
    <motion.button type="button" whileTap={{ scale: 0.985 }} className={s.panel} onClick={onOpen} aria-label={`Weather: ${weather.current.tempC} degrees, ${conditionLabel(weather.current.code)}. ${weather.advisory.title}. Open forecast`}>
      <div className={s.left}>
        <span className={s.loc}>
          <MapPin aria-hidden /> {weather.locationName}
        </span>
        <span className={s.temp}>
          {weather.current.tempC}
          <span className={s.deg}>°</span>
        </span>
        <span className={s.cond}>
          <WeatherGlyph code={weather.current.code} className={s.condIcon} />
          {conditionLabel(weather.current.code)}
        </span>
        {today && (
          <span className={s.hilo}>
            High {today.maxC}° · Low {today.minC}°
          </span>
        )}
      </div>
      <div className={s.right}>
        <div className={`${s.advice} ${s[`adv_${weather.advisory.tone}`]}`}>
          <span className={s.adviceKicker}>
            <ToneIcon aria-hidden /> Spray advice
          </span>
          <strong>{weather.advisory.title}</strong>
          <span>{weather.advisory.text}</span>
        </div>
        <div className={s.hours} aria-hidden>
          {weather.hourly.slice(0, 4).map((h, i) => (
            <span key={h.time} className={s.hour}>
              <span>{i === 0 ? 'Now' : formatTime(h.time).replace(':00', '')}</span>
              <strong>{h.tempC}°</strong>
              <span className={s.rain}>{h.rainChance}%</span>
            </span>
          ))}
        </div>
      </div>
      <span className={s.source}>{weather.source === 'live' ? 'Live · Open-Meteo' : 'Sample forecast'}</span>
    </motion.button>
  );
}

export function WeatherSheet({ open, onClose, weather, onRetry }: { open: boolean; onClose: () => void; weather?: Weather; onRetry: () => void }) {
  if (!weather) return <Sheet open={open} onClose={onClose} title="Weather" />;
  const max = Math.max(...weather.daily.map((d) => d.maxC));
  const min = Math.min(...weather.daily.map((d) => d.minC));
  return (
    <Sheet open={open} onClose={onClose} kicker={`Forecast · updated ${formatRelativeInline(weather.updatedAt)}`} title={weather.locationName}>
      <div className={s.sheet}>
        <div className={s.now}>
          <span className={s.nowTemp}>
            {weather.current.tempC}
            <span className={s.deg}>°</span>
          </span>
          <div>
            <WeatherGlyph code={weather.current.code} className={s.nowIcon} />
            <p className={s.nowCond}>{conditionLabel(weather.current.code)}</p>
          </div>
        </div>
        <dl className={s.stats}>
          {[
            { icon: <ThermometerSun aria-hidden />, label: 'Feels like', value: `${weather.current.feelsLikeC}°` },
            { icon: <Droplets aria-hidden />, label: 'Humidity', value: `${weather.current.humidity}%` },
            { icon: <Wind aria-hidden />, label: 'Wind', value: `${weather.current.windKph} km/h` },
            { icon: <CloudRain aria-hidden />, label: 'Rain', value: `${weather.current.rainChance}%` },
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
        <Note tone={weather.advisory.tone === 'good' ? 'success' : weather.advisory.tone === 'caution' ? 'info' : 'warning'} title={weather.advisory.title}>
          {weather.advisory.text}
        </Note>
        <section>
          <h3 className={s.h3}>Next 12 hours</h3>
          <div className={s.hourRail}>
            {weather.hourly.map((h, i) => (
              <div key={h.time} className={s.hourCell}>
                <span>{i === 0 ? 'Now' : formatTime(h.time).replace(':00', '')}</span>
                <WeatherGlyph code={h.code} className={s.hourIcon} />
                <strong>{h.tempC}°</strong>
                <span className={s.rain}>{h.rainChance}%</span>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3 className={s.h3}>7 days</h3>
          <ul className={s.days}>
            {weather.daily.map((d, i) => {
              const left = ((d.minC - min) / Math.max(1, max - min)) * 100;
              const width = ((d.maxC - d.minC) / Math.max(1, max - min)) * 100;
              return (
                <li key={d.date} className={s.day}>
                  <span className={s.dayName}>{i === 0 ? 'Today' : weekdayShort(d.date)}</span>
                  <WeatherGlyph code={d.code} className={s.dayIcon} />
                  <span className={s.dayRain}>{d.rainChance >= 20 ? `${d.rainChance}%` : ''}</span>
                  <span className={s.dayMin}>{d.minC}°</span>
                  <span className={s.range} aria-hidden>
                    <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.2 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} style={{ left: `${left}%`, width: `${Math.max(width, 8)}%` }} />
                  </span>
                  <span className={s.dayMax}>{d.maxC}°</span>
                  <span className="sr-only">
                    {formatDate(d.date, 'weekday')}: {conditionLabel(d.code)}, {d.minC} to {d.maxC} degrees, {d.rainChance}% chance of rain
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
        {weather.source === 'sample' ? (
          <div className={s.sourceRow}>
            <p>Live weather couldn’t be loaded, so this is a sample forecast.</p>
            <Button variant="secondary" size="sm" icon={<RefreshCw aria-hidden />} onClick={onRetry}>
              Try live weather
            </Button>
          </div>
        ) : (
          <p className={s.sourceRow}>Forecast: Open-Meteo</p>
        )}
      </div>
    </Sheet>
  );
}
