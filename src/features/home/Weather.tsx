import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSun, Droplets, MapPin, RefreshCw, Sun, Wind, ChevronRight, ThermometerSun, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import type { Weather } from '@/types';
import { conditionIcon, conditionLabel, type ConditionIcon } from '@/lib/weather';
import { formatDate, formatRelativeInline, formatTime, weekdayShort } from '@/lib/format';
import { Sheet } from '@/components/ui/Sheet';
import { Callout } from '@/components/ui/Blocks';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import s from './Home.module.css';

const ICONS: Record<ConditionIcon, typeof Sun> = { sun: Sun, 'cloud-sun': CloudSun, cloud: Cloud, fog: CloudFog, drizzle: CloudDrizzle, rain: CloudRain, storm: CloudLightning };

export function WeatherIcon({ code, className }: { code: number; className?: string }) {
  const Icon = ICONS[conditionIcon(code)];
  return <Icon className={className} aria-hidden />;
}

const TONE_ICON = { good: CheckCircle2, caution: Info, warning: AlertTriangle };

export function WeatherCard({ weather, loading, onOpen }: { weather?: Weather; loading: boolean; onOpen: () => void }) {
  if (loading || !weather) {
    return (
      <div className={`${s.weather} glass`} aria-busy="true" aria-label="Loading weather">
        <Skeleton w="45%" h={14} />
        <Skeleton w={110} h={48} style={{ marginTop: 16 }} />
        <Skeleton h={40} r={14} style={{ marginTop: 16 }} />
      </div>
    );
  }
  const today = weather.daily[0];
  const ToneIcon = TONE_ICON[weather.advisory.tone];
  return (
    <button type="button" className={`${s.weather} glass`} onClick={onOpen} aria-label={`Weather: ${weather.current.tempC} degrees, ${conditionLabel(weather.current.code)}. ${weather.advisory.title}. Open forecast`}>
      <div className={s.weatherTop}>
        <span className={s.weatherLoc}>
          <MapPin aria-hidden /> {weather.locationName}
        </span>
        <span className={s.weatherSource}>{weather.source === 'live' ? 'Live' : 'Sample forecast'}</span>
      </div>
      <div className={s.weatherMain}>
        <div>
          <div className={s.temp}>
            <AnimatedNumber value={weather.current.tempC} from={Math.max(0, weather.current.tempC - 12)} />
            <span className={s.deg}>°</span>
          </div>
          <div className={s.cond}>
            {conditionLabel(weather.current.code)}
            {today && (
              <span className={s.hiLo}>
                {' '}
                · H {today.maxC}° L {today.minC}°
              </span>
            )}
          </div>
        </div>
        <WeatherIcon code={weather.current.code} className={s.weatherIcon} />
      </div>
      <div className={`${s.advisory} ${s[`adv_${weather.advisory.tone}`]}`}>
        <ToneIcon aria-hidden />
        <div className={s.advText}>
          <strong>{weather.advisory.title}</strong>
          <span>{weather.advisory.text}</span>
        </div>
        <ChevronRight aria-hidden className={s.advChevron} />
      </div>
    </button>
  );
}

export function WeatherSheet({ open, onClose, weather, onRetry }: { open: boolean; onClose: () => void; weather?: Weather; onRetry: () => void }) {
  if (!weather) return <Sheet open={open} onClose={onClose} title="Weather" />;
  const max = Math.max(...weather.daily.map((d) => d.maxC));
  const min = Math.min(...weather.daily.map((d) => d.minC));
  return (
    <Sheet open={open} onClose={onClose} title={`Weather · ${weather.locationName}`} description={`Updated ${formatRelativeInline(weather.updatedAt)}`}>
      <div className="stack" style={{ ['--gap' as string]: '16px' }}>
        <div className={s.wxNow}>
          <WeatherIcon code={weather.current.code} className={s.wxNowIcon} />
          <div>
            <div className={s.temp}>
              {weather.current.tempC}
              <span className={s.deg}>°</span>
            </div>
            <div className={s.cond}>{conditionLabel(weather.current.code)}</div>
          </div>
        </div>
        <div className={s.wxStats}>
          <div>
            <ThermometerSun aria-hidden />
            <span>Feels like</span>
            <strong>{weather.current.feelsLikeC}°</strong>
          </div>
          <div>
            <Droplets aria-hidden />
            <span>Humidity</span>
            <strong>{weather.current.humidity}%</strong>
          </div>
          <div>
            <Wind aria-hidden />
            <span>Wind</span>
            <strong>{weather.current.windKph} km/h</strong>
          </div>
          <div>
            <CloudRain aria-hidden />
            <span>Rain</span>
            <strong>{weather.current.rainChance}%</strong>
          </div>
        </div>

        <Callout tone={weather.advisory.tone === 'good' ? 'success' : weather.advisory.tone === 'caution' ? 'info' : 'warning'} title={weather.advisory.title}>
          {weather.advisory.text}
        </Callout>

        <section>
          <h3 className={s.wxHeading}>Next 12 hours</h3>
          <div className={`${s.hours} no-scrollbar`}>
            {weather.hourly.map((h, i) => (
              <div key={h.time} className={s.hour}>
                <span className={s.hourTime}>{i === 0 ? 'Now' : formatTime(h.time).replace(':00', '')}</span>
                <WeatherIcon code={h.code} className={s.hourIcon} />
                <span className={s.hourTemp}>{h.tempC}°</span>
                <span className={s.hourRain}>{h.rainChance}%</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className={s.wxHeading}>7 days</h3>
          <ul className={s.days}>
            {weather.daily.map((d, i) => {
              const left = ((d.minC - min) / Math.max(1, max - min)) * 100;
              const width = ((d.maxC - d.minC) / Math.max(1, max - min)) * 100;
              return (
                <li key={d.date} className={s.day}>
                  <span className={s.dayName}>{i === 0 ? 'Today' : weekdayShort(d.date)}</span>
                  <WeatherIcon code={d.code} className={s.dayIcon} />
                  <span className={s.dayRain}>{d.rainChance >= 20 ? `${d.rainChance}%` : ''}</span>
                  <span className={s.dayMin}>{d.minC}°</span>
                  <span className={s.dayBar} aria-hidden>
                    <span style={{ left: `${left}%`, width: `${Math.max(width, 8)}%` }} />
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
          <div className={s.wxSource}>
            <p>Live weather couldn’t be loaded, so this is a sample forecast.</p>
            <Button variant="secondary" size="sm" icon={<RefreshCw aria-hidden />} onClick={onRetry}>
              Try live weather
            </Button>
          </div>
        ) : (
          <p className={s.wxSource}>Forecast: Open-Meteo</p>
        )}
      </div>
    </Sheet>
  );
}
