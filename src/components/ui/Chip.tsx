import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import s from './Chip.module.css';

interface ChipProps {
  selected?: boolean;
  onClick?: () => void;
  children: ReactNode;
  icon?: ReactNode;
  count?: number;
  /** Shows a check mark when selected (multi-select filters). */
  checkable?: boolean;
}

export function Chip({ selected, onClick, children, icon, count, checkable }: ChipProps) {
  return (
    <button type="button" className={`${s.chip} ${selected ? s.selected : ''}`} aria-pressed={selected} onClick={onClick}>
      {checkable && selected ? <Check aria-hidden strokeWidth={2.6} /> : icon}
      {children}
      {count !== undefined && <span className={s.count}>{count}</span>}
    </button>
  );
}

export function ChipRow({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className={s.row} role="group" aria-label={label}>
      {children}
    </div>
  );
}
