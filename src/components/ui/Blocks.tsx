import { useId, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Calculator, Check, ChevronDown, ChevronRight, X } from 'lucide-react';
import s from './Blocks.module.css';

/* ---------- List group ---------- */

export function ListGroup({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section>
      {title && <h3 className={s.groupTitle}>{title}</h3>}
      <div className={s.group}>{children}</div>
    </section>
  );
}

interface RowProps {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  value?: ReactNode;
  to?: string;
  onClick?: () => void;
  trailing?: ReactNode;
  danger?: boolean;
  chevron?: boolean;
}

export function ListRow({ icon, title, subtitle, value, to, onClick, trailing, danger, chevron = true }: RowProps) {
  const inner = (
    <>
      {icon && <span className={s.rowIcon}>{icon}</span>}
      <span className={s.rowText}>
        <span className={s.rowTitle}>{title}</span>
        {subtitle && <span className={`${s.rowSub} clamp-2`} style={{ display: '-webkit-box' }}>{subtitle}</span>}
      </span>
      {value && <span className={s.rowValue}>{value}</span>}
      {trailing}
      {(to || onClick) && chevron && !trailing && <ChevronRight className={s.chev} aria-hidden />}
    </>
  );
  const cls = `${s.row} ${danger ? s.danger : ''}`;
  if (to)
    return (
      <Link to={to} className={cls}>
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

/* ---------- Accordion ---------- */

export function Accordion({ title, meta, children, defaultOpen = false }: { title: ReactNode; meta?: ReactNode; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className={`${s.acc} ${open ? s.accOpen : ''}`}>
      <button type="button" className={s.accHead} aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        <span className={s.accTitle}>
          {title}
          {meta && <span className={s.accMeta} style={{ display: 'block' }}>{meta}</span>}
        </span>
        <ChevronDown className={s.accChev} aria-hidden />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            className={s.accBody}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={s.accInner}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Stepper ---------- */

export function Stepper({ step, total, title }: { step: number; total: number; title: string }) {
  return (
    <div className={s.stepper}>
      <div className={s.stepperTop}>
        <span className={s.stepperTitle}>{title}</span>
        <span className={s.stepperLabel}>
          Step {step} of {total}
        </span>
      </div>
      <div className={s.segments} role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step} aria-label={`Step ${step} of ${total}: ${title}`}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={s.segment}>
            <motion.span className={s.segmentFill} style={{ display: 'block' }} initial={false} animate={{ scaleX: i < step ? 1 : 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Detail grid ---------- */

export interface DetailItem {
  label: string;
  value: ReactNode;
  full?: boolean;
  total?: boolean;
  formula?: string;
}

export function DetailGrid({ items }: { items: DetailItem[] }) {
  // A lone half-width item at the end would leave a gap; stretch it.
  const lastHalf = items.filter((i) => !i.full && !i.total).length % 2 === 1;
  let halfSeen = 0;
  const halfCount = items.filter((i) => !i.full && !i.total).length;
  return (
    <dl className={s.grid}>
      {items.map((it, idx) => {
        const isHalf = !it.full && !it.total;
        if (isHalf) halfSeen++;
        const stretch = isHalf && lastHalf && halfSeen === halfCount;
        return (
          <div key={idx} className={`${s.cell} ${it.full || it.total || stretch ? s.full : ''} ${it.total ? s.total : ''}`}>
            <dt className={s.cellLabel}>{it.label}</dt>
            <dd className={s.cellValue}>{it.value}</dd>
            {it.formula && (
              <dd className={s.formula}>
                <Calculator aria-hidden />
                <span>{it.formula}</span>
              </dd>
            )}
          </div>
        );
      })}
    </dl>
  );
}

/* ---------- Timeline ---------- */

export interface TimelineItem {
  title: ReactNode;
  meta?: ReactNode;
  state: 'done' | 'current' | 'upcoming' | 'failed';
  to?: string;
  index?: number;
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className={s.timeline}>
      {items.map((it, i) => {
        const cls = { done: s.tDone, current: s.tCurrent, upcoming: '', failed: s.tFail }[it.state];
        const dot = it.state === 'done' ? <Check strokeWidth={3} /> : it.state === 'failed' ? <X strokeWidth={3} /> : (it.index ?? i + 1);
        const body = (
          <div className={s.tBody}>
            <div className={s.tTitle}>{it.title}</div>
            {it.meta && <div className={s.tMeta}>{it.meta}</div>}
          </div>
        );
        return (
          <li key={i} className={`${s.tItem} ${cls}`}>
            <span className={s.tDot} aria-hidden>
              {dot}
            </span>
            {body}
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- Callout ---------- */

export function Callout({ tone = 'neutral', icon, title, children }: { tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'; icon?: ReactNode; title?: ReactNode; children?: ReactNode }) {
  const cls = { success: s.cSuccess, warning: s.cWarning, danger: s.cDanger, info: s.cInfo, neutral: s.cNeutral }[tone];
  return (
    <div className={`${s.callout} ${cls}`}>
      {icon}
      <div>
        {title && <div className={s.calloutTitle}>{title}</div>}
        {children && <div className={s.calloutText}>{children}</div>}
      </div>
    </div>
  );
}
