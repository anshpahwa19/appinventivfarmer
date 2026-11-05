import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSun, Droplets, MapPin, RefreshCw, Sun, Wind, ChevronRight, ThermometerSun, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import type { Weather } from '@/types';
import { conditionIcon, sprayKind, type ConditionIcon, type SprayKind } from '@/lib/weather';
import { sprayText, type HomeT } from '@/i18n/home';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import s from './Home.module.css';

const ICONS: Record<ConditionIcon, typeof Sun> = { sun: Sun, 'cloud-sun': CloudSun, cloud: Cloud, fog: CloudFog, drizzle: CloudDrizzle, rain: CloudRain, storm: CloudLightning };

export function WeatherIcon({ code, className }: { code: number; className?: string }) {
  const Icon = ICONS[conditionIcon(code)];
  return <Icon className={className} aria-hidden />;
}

const SPRAY_TONE: Record<SprayKind, 'good' | 'caution' | 'warning'> = { good: 'good', heat: 'caution', wind: 'caution', rain: 'warning' };
const TONE_ICON = { good: CheckCircle2, caution: Info, warning: AlertTriangle };

function spraySummary(weather: Weather, t: HomeT) {
  const rainMax = Math.max(0, ...weather.hourly.map((h) => h.rainChance));
  const kind = sprayKind(weather.current, rainMax);
  return { tone: SPRAY_TONE[kind], ...sprayText(t, kind, weather.current, rainMax) };
}

export function WeatherCard({ weather, loading, onOpen, t }: { weather?: Weather; loading: boolean; onOpen: () => void; t: HomeT }) {
  if (loading || !weather) {
    return (
      <div className={`${s.weather} glass`} aria-busy="true" aria-label={t.loadingWeather}>
        <Skeleton w="45%" h={14} />
        <Skeleton w={110} h={48} style={{ marginTop: 16 }} />
        <Skeleton h={44} r={14} style={{ marginTop: 16 }} />
        <Skeleton h={64} r={14} style={{ marginTop: 12 }} />
      </div>
    );
  }
  const today = weather.daily[0];
  const spray = spraySummary(weather, t);
  const ToneIcon = TONE_ICON[spray.tone];
  const cond = t.condition(weather.current.code);
  return (
    <button type="button" className={`${s.weather} glass`} onClick={onOpen} aria-label={t.weatherA11y(weather.current.tempC, cond, spray.title)}>
      <span className={s.weatherTop}>
        <span className={s.weatherLoc}>
          <MapPin aria-hidden /> {weather.locationName}
        </span>
        <span className={`${s.weatherSource} ${weather.source === 'sample' ? s.weatherSample : ''}`}>{weather.source === 'live' ? t.live : t.sample}</span>
      </span>
      <span className={s.weatherMain}>
        <span>
          <span className={s.temp}>
            <AnimatedNumber value={weather.current.tempC} from={Math.max(0, weather.current.tempC - 12)} />
            <span className={s.deg}>°</span>
          </span>
          <span className={s.cond}>{cond}</span>
          {today && (
            <span className={s.hiLo}>
              <span>
                {t.high} {today.maxC}°
              </span>
              <span>
                {t.low} {today.minC}°
              </span>
            </span>
          )}
        </span>
        <WeatherIcon code={weather.current.code} className={s.weatherIcon} />
      </span>
      <span className={s.wxChips} aria-hidden>
        <span>
          <small>
            <CloudRain /> {t.rain}
          </small>
          <b>{weather.current.rainChance}%</b>
        </span>
        <span>
          <small>
            <Droplets /> {t.humidity}
          </small>
          <b>{weather.current.humidity}%</b>
        </span>
        <span>
          <small>
            <Wind /> {t.wind}
          </small>
          <b>{t.kph(weather.current.windKph)}</b>
        </span>
      </span>
      <span className={s.wxStrip} aria-hidden>
        {weather.daily.slice(0, 5).map((d, i) => (
          <span key={d.date} className={s.wxDay}>
            <small>{t.dayLabel(d.date, i, true)}</small>
            <WeatherIcon code={d.code} className={s.wxDayIcon} />
            <b>{d.maxC}°</b>
            <span className={s.wxDayMin}>{d.minC}°</span>
            <span className={`${s.wxDayRain} ${d.rainChance >= 60 ? s.wxDayWet : ''}`}>{d.rainChance}%</span>
          </span>
        ))}
      </span>
      <span className={`${s.advisory} ${s[`adv_${spray.tone}`]}`}>
        <ToneIcon aria-hidden />
        <span className={s.advText}>
          <span className={s.advKicker}>{t.sprayKicker}</span>
          <strong>{spray.title}</strong>
          <span>{spray.text}</span>
        </span>
        <ChevronRight aria-hidden className={s.advChevron} />
      </span>
    </button>
  );
}

export function WeatherSheet({ open, onClose, weather, onRetry, t, tokens }: { open: boolean; onClose: () => void; weather?: Weather; onRetry: () => void; t: HomeT; tokens: string }) {
  if (!weather) return <Sheet open={open} onClose={onClose} title={t.weather} />;
  const max = Math.max(...weather.daily.map((d) => d.maxC));
  const min = Math.min(...weather.daily.map((d) => d.minC));
  const spray = spraySummary(weather, t);
  return (
    <Sheet open={open} onClose={onClose} title={`${t.weather} · ${weather.locationName}`} description={t.updated(t.ago(weather.updatedAt))}>
      <div className={`stack ${tokens}`} lang={t.contentLang} style={{ ['--gap' as string]: '16px' }}>
        <div className={s.wxNow}>
          <WeatherIcon code={weather.current.code} className={s.wxNowIcon} />
          <div>
            <div className={s.temp}>
              {weather.current.tempC}
              <span className={s.deg}>°</span>
            </div>
            <div className={s.cond}>{t.condition(weather.current.code)}</div>
          </div>
          <span className={`${s.weatherSource} ${weather.source === 'sample' ? s.weatherSample : ''}`} style={{ marginLeft: 'auto' }}>
            {weather.source === 'live' ? t.live : t.sample}
          </span>
        </div>
        <div className={s.wxStats}>
          <div>
            <ThermometerSun aria-hidden />
            <span>{t.feelsLike}</span>
            <strong>{weather.current.feelsLikeC}°</strong>
          </div>
          <div>
            <Droplets aria-hidden />
            <span>{t.humidity}</span>
            <strong>{weather.current.humidity}%</strong>
          </div>
          <div>
            <Wind aria-hidden />
            <span>{t.wind}</span>
            <strong>{t.kph(weather.current.windKph)}</strong>
          </div>
          <div>
            <CloudRain aria-hidden />
            <span>{t.rain}</span>
            <strong>{weather.current.rainChance}%</strong>
          </div>
        </div>

        <div className={`${s.advisory} ${s[`adv_${spray.tone}`]}`} style={{ marginTop: 0 }}>
          {(() => {
            const I = TONE_ICON[spray.tone];
            return <I aria-hidden />;
          })()}
          <span className={s.advText}>
            <span className={s.advKicker}>{t.sprayKicker}</span>
            <strong>{spray.title}</strong>
            <span>{spray.text}</span>
          </span>
        </div>

        <section>
          <h3 className={s.wxHeading}>{t.next12}</h3>
          <div className={`${s.hours} no-scrollbar`}>
            {weather.hourly.map((h, i) => (
              <div key={h.time} className={s.hour}>
                <span className={s.hourTime}>{i === 0 ? t.now : t.time(h.time)}</span>
                <WeatherIcon code={h.code} className={s.hourIcon} />
                <span className={s.hourTemp}>{h.tempC}°</span>
                <span className={s.hourRain}>{h.rainChance}%</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className={s.wxHeading}>{t.days7}</h3>
          <ul className={s.days}>
            {weather.daily.map((d, i) => {
              const left = ((d.minC - min) / Math.max(1, max - min)) * 100;
              const width = ((d.maxC - d.minC) / Math.max(1, max - min)) * 100;
              return (
                <li key={d.date} className={s.day}>
                  <span className={s.dayName} aria-hidden>
                    {t.dayLabel(d.date, i)}
                  </span>
                  <WeatherIcon code={d.code} className={s.dayIcon} />
                  <span className={s.dayRain} aria-hidden>
                    {d.rainChance >= 20 ? `${d.rainChance}%` : ''}
                  </span>
                  <span className={s.dayMin} aria-hidden>
                    {d.minC}°
                  </span>
                  <span className={s.dayBar} aria-hidden>
                    <span style={{ left: `${left}%`, width: `${Math.max(width, 8)}%` }} />
                  </span>
                  <span className={s.dayMax} aria-hidden>
                    {d.maxC}°
                  </span>
                  <span className="sr-only">{t.dayA11y(t.weekday(d.date, 'long'), t.condition(d.code), d.minC, d.maxC, d.rainChance)}</span>
                </li>
              );
            })}
          </ul>
        </section>

        {weather.source === 'sample' ? (
          <div className={s.wxSource}>
            <p>{t.sampleLong}</p>
            <Button variant="secondary" size="sm" icon={<RefreshCw aria-hidden />} onClick={onRetry}>
              {t.tryLive}
            </Button>
          </div>
        ) : (
          <p className={s.wxSource}>{t.source}</p>
        )}
      </div>
    </Sheet>
  );
}
