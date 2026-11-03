import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { initials } from '@/lib/format';
import s from './Misc.module.css';

/* ---------- Switch ---------- */

export function Switch({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; id?: string }) {
  return (
    <button id={id} type="button" role="switch" aria-checked={checked} aria-label={label} className={s.switch} onClick={() => onChange(!checked)}>
      <motion.span className={s.knob} animate={{ x: checked ? 20 : 0 }} transition={{ type: 'spring', stiffness: 600, damping: 34 }}>
        {checked && <Check aria-hidden strokeWidth={3} />}
      </motion.span>
    </button>
  );
}

/* ---------- Status badge ---------- */

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'live';

export function StatusBadge({ tone, icon, children, size = 'md', onImage }: { tone: Tone; icon?: ReactNode; children: ReactNode; size?: 'md' | 'lg'; onImage?: boolean }) {
  return (
    <span className={`${s.badge} ${s[tone]} ${size === 'lg' ? s.badgeLg : ''} ${onImage ? s.onImage : ''}`}>
      {tone === 'live' ? <span className={s.liveDot} aria-hidden /> : icon}
      {children}
    </span>
  );
}

/* ---------- Avatar ---------- */

const AVATAR_COLORS = ['#2a6345', '#8a6a49', '#b54e15', '#1d5a7a', '#6b4e8a', '#3c8a5a'];

export function Avatar({ name, size = 44, verified, ring }: { name: string; size?: number; verified?: boolean; ring?: boolean }) {
  const hue = AVATAR_COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
  return (
    <span
      className={`${s.avatar} ${ring ? s.avatarRing : ''}`}
      style={{ ['--size' as string]: `${size}px`, background: `linear-gradient(145deg, ${hue}, color-mix(in srgb, ${hue} 70%, #000))` }}
      aria-hidden
    >
      {initials(name)}
      {verified && (
        <span className={s.verifiedTick}>
          <Check strokeWidth={3.5} />
        </span>
      )}
    </span>
  );
}

/* ---------- Section header ---------- */

export function SectionHeader({ title, subtitle, to, action = 'See all', count, id }: { title: string; subtitle?: string; to?: string; action?: string; count?: number; id?: string }) {
  return (
    <div className={s.section}>
      <div>
        <h2 className={s.sectionTitle} id={id}>
          {title}
        </h2>
        {subtitle && <p className={s.sectionSub}>{subtitle}</p>}
      </div>
      {to && (
        <Link to={to} className={s.seeAll} aria-label={`${action}: ${title}${count !== undefined ? ` (${count})` : ''}`}>
          {action}
          <ChevronRight aria-hidden strokeWidth={2.4} />
        </Link>
      )}
    </div>
  );
}

/* ---------- Progress ring ---------- */

export function ProgressRing({ value, total, size = 56, stroke = 6, label }: { value: number; total: number; size?: number; stroke?: number; label?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = total ? value / total : 0;
  return (
    <div className={s.ring} style={{ width: size, height: size }} role="img" aria-label={`${value} of ${total} complete`}>
      <svg width={size} height={size} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={pct >= 1 ? 'var(--success-solid)' : 'var(--accent)'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        />
      </svg>
      <span className={s.ringLabel}>{label ?? `${value}/${total}`}</span>
    </div>
  );
}

export function ProgressBar({ value, total, label }: { value: number; total: number; label: string }) {
  const pct = total ? Math.min(1, value / total) : 0;
  return (
    <div className={s.bar} role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={value} aria-label={label}>
      <motion.div className={s.barFill} initial={{ scaleX: 0 }} animate={{ scaleX: pct }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
    </div>
  );
}
