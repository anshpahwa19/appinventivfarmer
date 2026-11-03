import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import s from './SearchField.module.css';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
  /** Shows a filter button next to the field. */
  onFilter?: () => void;
  activeFilters?: number;
  debounceMs?: number;
}

export function SearchField({ value, onChange, placeholder = 'Search', label = 'Search', onFilter, activeFilters = 0, debounceMs = 200 }: Props) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  useEffect(() => {
    if (local === value) return;
    const t = setTimeout(() => onChange(local), debounceMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return (
    <div className={s.wrap}>
      <div className={s.search}>
        <Search aria-hidden />
        <input type="search" inputMode="search" enterKeyHint="search" value={local} onChange={(e) => setLocal(e.target.value)} placeholder={placeholder} aria-label={label} />
        {local && (
          <button
            type="button"
            className={s.clear}
            aria-label="Clear search"
            onClick={() => {
              setLocal('');
              onChange('');
            }}
          >
            <X aria-hidden strokeWidth={2.5} />
          </button>
        )}
      </div>
      {onFilter && (
        <button type="button" className={`${s.filterBtn} ${activeFilters ? s.filterActive : ''}`} onClick={onFilter} aria-label={activeFilters ? `Filters, ${activeFilters} active` : 'Filters'}>
          <SlidersHorizontal aria-hidden />
          {activeFilters > 0 && (
            <span className={s.filterCount} aria-hidden>
              {activeFilters}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
