import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  CloudLightning,
  CloudRain,
  Droplets,
  Info,
  Leaf,
  Package,
  Radio,
  RefreshCw,
  Snowflake,
  Sprout,
  ThermometerSun,
  WifiOff,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import type { AlertKind, AlertSeverity, HomeAlert } from '@/lib/alerts';
import { countBySeverity } from '@/lib/alerts';
import { alertText, type HomeT } from '@/i18n/home';

/** Class names supplied by each direction's Home stylesheet (same keys, different look). */
export type AlertClasses = Record<string, string>;

export const KIND_ICON: Record<AlertKind, LucideIcon> = {
  storm: CloudLightning,
  heavyRain: CloudRain,
  rainLikely: CloudRain,
  heat: ThermometerSun,
  wind: Wind,
  cold: Snowflake,
  irrigate: Droplets,
  humidity: Leaf,
  nextStep: ClipboardList,
  harvestSoon: Sprout,
  emptyField: Sprout,
  bookingRejected: CalendarClock,
  bookingPending: CalendarClock,
  bookingSoon: CalendarClock,
  orderRejected: Package,
  eventLive: Radio,
};
export const SEVERITY_ICON: Record<AlertSeverity, LucideIcon> = { urgent: AlertOctagon, warning: AlertTriangle, normal: Info };

const VISIBLE = 3;

interface Props {
  t: HomeT;
  alerts: HomeAlert[];
  loading: boolean;
  failed: boolean;
  offline: boolean;
  onRetry: () => void;
  onAction: (a: HomeAlert) => void;
  /** The direction's stylesheet. */
  s: AlertClasses;
  /** Loading placeholder in the direction's own skeleton style. */
  skeleton: ReactNode;
  /** Optional heading block; defaults to a plain h2. */
  heading?: ReactNode;
}

export function AlertsSection({ t, alerts, loading, failed, offline, onRetry, onAction, s, skeleton, heading }: Props) {
  const [all, setAll] = useState(false);
  const counts = countBySeverity(alerts);
  const shown = all ? alerts : alerts.slice(0, VISIBLE);

  return (
    <section className={s.section} aria-labelledby="alerts-h">
      <div className={s.secHead}>
        {heading ?? (
          <h2 id="alerts-h" className={s.secTitle}>
            {t.alertsTitle}
          </h2>
        )}
        {!loading && alerts.length > 0 && (
          <span className={s.sevCounts}>
            {(['urgent', 'warning'] as const).map((sev) =>
              counts[sev] ? (
                <span key={sev} className={`${s.sevPill} ${s[`sev_${sev}`]}`}>
                  {(() => {
                    const I = SEVERITY_ICON[sev];
                    return <I aria-hidden />;
                  })()}
                  {counts[sev]} {t.severity[sev]}
                </span>
              ) : null,
            )}
          </span>
        )}
      </div>

      <div className={s.alerts}>
        {offline && (
          <p className={s.alertNotice}>
            <WifiOff aria-hidden /> {t.alertsOffline}
          </p>
        )}
        {failed && !offline && (
          <div className={s.alertNotice}>
            <AlertTriangle aria-hidden />
            <span>{t.alertsError}</span>
            <button type="button" className={s.textBtn} onClick={onRetry}>
              <RefreshCw aria-hidden /> {t.retry}
            </button>
          </div>
        )}

        {loading && alerts.length === 0 ? (
          <div aria-busy="true" aria-label={t.alertsLoading} className={s.alertList}>
            {skeleton}
          </div>
        ) : alerts.length === 0 && (offline || failed) ? null : alerts.length === 0 ? (
          <div className={s.allClear}>
            <CheckCircle2 aria-hidden />
            <div>
              <strong>{t.alertsNone}</strong>
              <span>{t.alertsNoneBody}</span>
            </div>
          </div>
        ) : (
          <ul className={s.alertList}>
            <AnimatePresence initial={false}>
              {shown.map((a) => (
                <motion.li key={a.id} layout="position" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
                  <AlertCard t={t} alert={a} onAction={onAction} s={s} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}

        {alerts.length > VISIBLE && (
          <button type="button" className={s.moreBtn} onClick={() => setAll((v) => !v)} aria-expanded={all}>
            {all ? t.showFewer : t.showAll(alerts.length)}
          </button>
        )}
      </div>
    </section>
  );
}

function AlertCard({ t, alert, onAction, s }: { t: HomeT; alert: HomeAlert; onAction: (a: HomeAlert) => void; s: AlertClasses }) {
  const text = alertText(t, alert);
  const Kind = KIND_ICON[alert.kind];
  const Sev = SEVERITY_ICON[alert.severity];
  return (
    <article className={`${s.alert} ${s[`sev_${alert.severity}`]}`} aria-label={`${text.severity}: ${text.title}`}>
      <span className={s.alertKind} aria-hidden>
        <Kind />
      </span>
      <div className={s.alertBody}>
        <div className={s.alertMeta}>
          <span className={s.sevTag}>
            <Sev aria-hidden />
            {text.severity}
          </span>
          {alert.sample && <span className={s.sampleTag}>{t.fromSample}</span>}
        </div>
        <h3 className={s.alertTitle}>{text.title}</h3>
        <p className={s.alertText}>{text.body}</p>
        <button type="button" className={s.alertAction} onClick={() => onAction(alert)}>
          {text.action} <ArrowRight aria-hidden />
        </button>
      </div>
    </article>
  );
}
