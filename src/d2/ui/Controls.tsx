import { useId, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import s from './Controls.module.css';

/* ---------- Chips: filter pills ---------- */

export function Chip({ selected, onClick, children, count, icon, night }: { selected?: boolean; onClick?: () => void; children: ReactNode; count?: number; icon?: ReactNode; night?: boolean }) {
  return (
    <motion.button type="button" whileTap={{ scale: 0.95 }} className={`${s.chip} ${night ? s.chipNight : ''} ${selected ? s.chipOn : ''}`} aria-pressed={!!selected} onClick={onClick}>
      {icon && <span className={s.chipIcon}>{icon}</span>}
      {children}
      {count !== undefined && <span className={s.count}>{count}</span>}
    </motion.button>
  );
}

export function ChipRow({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`${s.chipRow} ${className ?? ''}`} role="group" aria-label={label}>
      {children}
    </div>
  );
}

/* ---------- Section tabs: large text tabs with a sliding ink bar ---------- */

export interface TabItem<T extends string> {
  value: T;
  label: string;
  count?: number;
}

export function SectionTabs<T extends string>({ value, onChange, items, label, night, size = 'lg' }: { value: T; onChange: (v: T) => void; items: TabItem<T>[]; label: string; night?: boolean; size?: 'lg' | 'md' }) {
  const id = useId();
  return (
    <div className={`${s.tabs} ${night ? s.tabsNight : ''} ${size === 'md' ? s.tabsMd : ''}`} role="tablist" aria-label={label}>
      {items.map((t) => {
        const on = t.value === value;
        return (
          <button key={t.value} type="button" role="tab" aria-selected={on} className={`${s.tab} ${on ? s.tabOn : ''}`} onClick={() => onChange(t.value)}>
            <span>{t.label}</span>
            {t.count !== undefined && <span className={s.tabCount}>{t.count}</span>}
            {on && <motion.span layoutId={`${id}-bar`} className={s.tabBar} transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Toggle: compact segmented choice with a sliding thumb ---------- */

export function Toggle<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) {
  const id = useId();
  return (
    <div className={s.toggle} role="radiogroup" aria-label={label}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button key={o.value} type="button" role="radio" aria-checked={on} className={`${s.toggleOpt} ${on ? s.toggleOn : ''}`} onClick={() => onChange(o.value)}>
            {on && <motion.span layoutId={`${id}-thumb`} className={s.thumb} transition={{ type: 'spring', stiffness: 520, damping: 38 }} />}
            <span className={s.toggleLabel}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Switch ---------- */

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`${s.switch} ${checked ? s.switchOn : ''}`} onClick={() => onChange(!checked)}>
      <motion.span className={s.knob} layout transition={{ type: 'spring', stiffness: 600, damping: 34 }} />
    </button>
  );
}

/* ---------- Counter ---------- */

export function Counter({ value, onChange, label, max = 20 }: { value: number; onChange: (n: number) => void; label: string; max?: number }) {
  return (
    <div className={s.counter} role="group" aria-label={`${label} count`}>
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))} disabled={value === 0} aria-label={`Fewer ${label}`}>
        <Minus aria-hidden />
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`More ${label}`}>
        <Plus aria-hidden />
      </button>
    </div>
  );
}
