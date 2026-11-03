import { useId, useRef, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import s from './SegmentedControl.module.css';

export interface Segment<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface Props<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}

/** Tabs with an animated thumb. Arrow keys move between options (WAI-ARIA tabs pattern). */
export function SegmentedControl<T extends string>({ segments, value, onChange, label, className }: Props<T>) {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + segments.length) % segments.length;
    onChange(segments[next].value);
    refs.current[next]?.focus();
  };
  return (
    <div className={`${s.root} ${className ?? ''}`} role="tablist" aria-label={label}>
      {segments.map((seg, i) => {
        const selected = seg.value === value;
        return (
          <button
            key={seg.value}
            ref={(el) => (refs.current[i] = el)}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className={s.option}
            onClick={() => onChange(seg.value)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {selected && <motion.span layoutId={`seg-${id}`} className={s.thumb} transition={{ type: 'spring', stiffness: 480, damping: 38 }} />}
            {seg.label}
            {seg.count !== undefined && <span className={s.count}>{seg.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
