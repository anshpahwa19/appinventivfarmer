import { useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Check, ChevronDown, ChevronRight, RefreshCw, WifiOff, X } from 'lucide-react';
import type { ApiError } from '@/services/api';
import { initials } from '@/lib/format';
import { to as d2 } from '../paths';
import { FjLottie } from '../lottie/Lottie';
import type { AnimationName } from '../lottie/animations';
import { Button } from './Button';
import s from './Blocks.module.css';

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'live' | 'neutral';

/* ---------- Status tag: always a word plus a shape, never colour alone ---------- */

export function StatusTag({ tone, children, icon, size = 'md', night }: { tone: Tone; children: ReactNode; icon?: ReactNode; size?: 'md' | 'lg'; night?: boolean }) {
  return (
    <span className={`${s.tag} ${s[`tag_${tone}`]} ${size === 'lg' ? s.tagLg : ''} ${night ? s.tagNight : ''}`}>
      {icon ? <span className={s.tagIcon}>{icon}</span> : <span className={s.tagDot} aria-hidden />}
      {children}
    </span>
  );
}

/* ---------- Note: inline explanation ---------- */

export function Note({ tone = 'neutral', title, children, icon, action }: { tone?: Tone; title?: ReactNode; children?: ReactNode; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className={`${s.note} ${s[`note_${tone}`]}`} role={tone === 'danger' ? 'alert' : undefined}>
      {icon && <span className={s.noteIcon}>{icon}</span>}
      <div className={s.noteText}>
        {title && <strong>{title}</strong>}
        {children && <div>{children}</div>}
        {action && <div className={s.noteAction}>{action}</div>}
      </div>
    </div>
  );
}

/* ---------- Skeletons ---------- */

export function Skel({ w = '100%', h = 16, r, night, style }: { w?: number | string; h?: number | string; r?: string; night?: boolean; style?: CSSProperties }) {
  return <div className={`fj-skel ${night ? 'fj-skel-night' : ''}`} style={{ width: w, height: h, borderRadius: r ?? 'var(--r-sm)', ...style }} aria-hidden />;
}

export function SkelList({ count = 3, thumb = 88 }: { count?: number; thumb?: number }) {
  return (
    <div className={s.skelList} aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={s.skelRow}>
          <Skel w={thumb} h={thumb} r="var(--r-lg)" />
          <div className={s.skelText}>
            <Skel w="40%" h={12} />
            <Skel h={18} />
            <Skel w="70%" h={18} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- States ---------- */

export function EmptyState({ animation = 'search', title, body, action, compact }: { animation?: AnimationName; title: string; body?: ReactNode; action?: ReactNode; compact?: boolean }) {
  return (
    <motion.div className={`${s.state} ${compact ? s.stateCompact : ''}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
      <FjLottie name={animation} size={compact ? 110 : 150} />
      <h2 className={s.stateTitle}>{title}</h2>
      {body && <p className={s.stateBody}>{body}</p>}
      {action && <div className={s.stateActions}>{action}</div>}
    </motion.div>
  );
}

export function ErrorState({ error, onRetry }: { error?: ApiError; onRetry: () => void }) {
  const offline = error?.code === 'offline';
  return (
    <EmptyState
      animation={offline ? 'offline' : 'search'}
      title={offline ? 'You’re offline' : error?.code === 'not_found' ? 'Not found' : 'Something went wrong'}
      body={error?.message ?? 'Please try again.'}
      action={
        error?.code !== 'not_found' && (
          <Button icon={<RefreshCw aria-hidden />} onClick={onRetry}>
            Try again
          </Button>
        )
      }
    />
  );
}

/** Shown above cached content when a refresh failed. */
export function StaleNote({ error }: { error?: ApiError }) {
  if (!error) return null;
  return (
    <div className={s.stale} role="status">
      <WifiOff aria-hidden /> {error.code === 'offline' ? 'Offline. Showing what was saved on this phone.' : 'Couldn’t refresh. Showing saved data.'}
    </div>
  );
}

export function Loading({ label = 'Loading', night }: { label?: string; night?: boolean }) {
  return (
    <div className={s.loading} role="status" aria-label={label}>
      <FjLottie name="loader" size={84} night={night} />
      <span>{label}…</span>
    </div>
  );
}

/* ---------- Avatar: a monogram tile ---------- */

export function Avatar({ name, size = 48, verified, night }: { name: string; size?: number; verified?: boolean; night?: boolean }) {
  return (
    <span className={`${s.avatar} ${night ? s.avatarNight : ''}`} style={{ width: size, height: size, fontSize: size * 0.36, borderRadius: size > 60 ? 'var(--r-lg)' : 'var(--r-md)' }} aria-hidden>
      {initials(name)}
      {verified && (
        <span className={s.verified} style={{ width: size * 0.36, height: size * 0.36 }}>
          <Check strokeWidth={3.5} />
        </span>
      )}
    </span>
  );
}

/* ---------- Progress: discrete segments ---------- */

export function Segments({ done, total, night, label }: { done: number; total: number; night?: boolean; label: string }) {
  return (
    <div className={`${s.segments} ${night ? s.segNight : ''}`} role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label={label}>
      {Array.from({ length: total }, (_, i) => (
        <motion.span key={i} className={`${s.seg} ${i < done ? s.segOn : ''}`} initial={{ scaleY: 0.3, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} transition={{ delay: 0.15 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }} />
      ))}
    </div>
  );
}

/* ---------- Tracker: horizontal status steps ---------- */

export interface TrackStep {
  label: string;
  meta?: string;
  state: 'done' | 'current' | 'upcoming' | 'failed';
}

export function Tracker({ steps, night }: { steps: TrackStep[]; night?: boolean }) {
  return (
    <ol className={`${s.tracker} ${night ? s.trackerNight : ''}`}>
      {steps.map((st, i) => (
        <li key={st.label} className={`${s.trackStep} ${s[`ts_${st.state}`]}`}>
          <div className={s.trackHead}>
            <motion.span className={s.trackNode} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 + i * 0.15, type: 'spring', stiffness: 400, damping: 22 }}>
              {st.state === 'done' ? <Check strokeWidth={3} /> : st.state === 'failed' ? <X strokeWidth={3} /> : <span />}
            </motion.span>
            {i < steps.length - 1 && (
              <span className={s.trackLine}>
                <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: st.state === 'done' ? 1 : 0 }} transition={{ delay: 0.3 + i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />
              </span>
            )}
          </div>
          <span className={s.trackLabel}>{st.label}</span>
          {st.meta && <span className={s.trackMeta}>{st.meta}</span>}
          <span className="sr-only">{st.state === 'done' ? '(done)' : st.state === 'current' ? '(in progress)' : st.state === 'failed' ? '(stopped)' : '(not yet)'}</span>
        </li>
      ))}
    </ol>
  );
}

/* ---------- Timeline: vertical steps ---------- */

export interface TimelineItem {
  title: ReactNode;
  meta?: ReactNode;
  state: 'done' | 'current' | 'upcoming' | 'failed';
  to?: string;
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className={s.timeline}>
      {items.map((it, i) => {
        const body = (
          <>
            <span className={`${s.tlNode} ${s[`tl_${it.state}`]}`} aria-hidden>
              {it.state === 'done' ? <Check strokeWidth={3} /> : it.state === 'failed' ? <X strokeWidth={3} /> : <span>{i + 1}</span>}
            </span>
            <span className={s.tlText}>
              <span className={s.tlTitle}>{it.title}</span>
              {it.meta && <span className={s.tlMeta}>{it.meta}</span>}
            </span>
            {it.to && <ChevronRight className={s.tlChev} aria-hidden />}
          </>
        );
        return (
          <li key={i} className={`${s.tlItem} ${it.state === 'done' ? s.tlDone : ''}`}>
            {it.to ? (
              <Link to={d2(it.to)} className={s.tlRow}>
                {body}
              </Link>
            ) : (
              <div className={s.tlRow}>{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- Receipt: label/value rows with dotted leaders ---------- */

export interface ReceiptRow {
  label: ReactNode;
  value: ReactNode;
  formula?: string;
  total?: boolean;
  /** Long values wrap under the label. */
  stacked?: boolean;
}

export function Receipt({ rows, night }: { rows: ReceiptRow[]; night?: boolean }) {
  return (
    <dl className={`${s.receipt} ${night ? s.receiptNight : ''}`}>
      {rows.map((r, i) => (
        <div key={i} className={`${s.rRow} ${r.total ? s.rTotal : ''} ${r.stacked ? s.rStacked : ''}`}>
          <dt>
            {r.label}
            {r.formula && <span className={s.rFormula}>{r.formula}</span>}
          </dt>
          {!r.stacked && <span className={s.rLeader} aria-hidden />}
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------- Accordion ---------- */

export function Accordion({ title, meta, children, defaultOpen }: { title: ReactNode; meta?: ReactNode; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className={`${s.acc} ${open ? s.accOpen : ''}`}>
      <button type="button" className={s.accHead} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className={s.accTitle}>{title}</span>
        {meta && <span className={s.accMeta}>{meta}</span>}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }} className={s.accChev}>
          <ChevronDown aria-hidden />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: 'hidden' }}>
            <div className={s.accBody}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Index rows: the journal's list style ---------- */

interface RowProps {
  index?: string;
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  value?: ReactNode;
  to?: string;
  onClick?: () => void;
  danger?: boolean;
  trailing?: ReactNode;
  chevron?: boolean;
}

export function Row({ index, icon, title, subtitle, value, to, onClick, danger, trailing, chevron = true }: RowProps) {
  const inner = (
    <>
      {index && <span className={s.rowIndex}>{index}</span>}
      {icon && <span className={s.rowIcon}>{icon}</span>}
      <span className={s.rowText}>
        <span className={s.rowTitle}>{title}</span>
        {subtitle && <span className={s.rowSub}>{subtitle}</span>}
      </span>
      {value && <span className={s.rowValue}>{value}</span>}
      {trailing}
      {chevron && (to || onClick) && !trailing && <ArrowUpRight className={s.rowChev} aria-hidden />}
    </>
  );
  const cls = `${s.row} ${danger ? s.rowDanger : ''}`;
  if (to)
    return (
      <Link to={d2(to)} className={cls}>
        {inner}
      </Link>
    );
  if (onClick)
    return (
      <button type="button" className={cls} onClick={onClick}>
        {inner}
      </button>
    );
  return <div className={cls}>{inner}</div>;
}

export function RowGroup({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className={s.group} aria-label={title}>
      {title && <h2 className={s.groupTitle}>{title}</h2>}
      <div className={s.groupList}>{children}</div>
    </section>
  );
}

/* ---------- Section head: index numeral, title, optional link ---------- */

export function SectionHead({ index, title, kicker, to, action = 'See all', night }: { index?: string; title: string; kicker?: string; to?: string; action?: string; night?: boolean }) {
  const link = to && (
    <Link to={d2(to)} className={s.shLink}>
      {action}
      <ArrowUpRight aria-hidden />
    </Link>
  );
  return (
    <div className={`${s.sh} ${night ? s.shNight : ''}`}>
      {/* The link sits on the kicker line, so it stays aligned however the title wraps. */}
      <div className={s.shTop}>
        {(index || kicker) && (
          <p className={s.shKicker}>
            {index && <span className={s.shIndex}>{index}</span>}
            {kicker}
          </p>
        )}
        {link}
      </div>
      <h2 className={s.shTitle}>{title}</h2>
    </div>
  );
}
