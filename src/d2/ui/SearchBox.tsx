import { forwardRef } from 'react';
import { CalendarRange, Search, X } from 'lucide-react';
import s from './SearchBox.module.css';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label?: string;
  onFilter?: () => void;
  filterLabel?: string | null;
  autoFocus?: boolean;
}

export const SearchBox = forwardRef<HTMLInputElement, Props>(function SearchBox({ value, onChange, placeholder, label, onFilter, filterLabel, autoFocus }, ref) {
  return (
    <div className={s.row}>
      <div className={s.box}>
        <Search className={s.icon} aria-hidden />
        <input ref={ref} type="search" className={s.input} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={label ?? placeholder} autoFocus={autoFocus} enterKeyHint="search" />
        {value && (
          <button type="button" className={s.clear} onClick={() => onChange('')} aria-label="Clear search">
            <X aria-hidden />
          </button>
        )}
      </div>
      {onFilter && (
        <button type="button" className={`${s.filter} ${filterLabel ? s.filterOn : ''}`} onClick={onFilter} aria-label={filterLabel ? `Date filter: ${filterLabel}. Change` : 'Filter by date'}>
          <CalendarRange aria-hidden />
          {filterLabel && <span>{filterLabel}</span>}
        </button>
      )}
    </div>
  );
});
