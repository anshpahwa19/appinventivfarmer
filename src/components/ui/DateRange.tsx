import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { addDays, diffDays, fromISODate, isSameDay, startOfDay, toISODate } from '@/lib/dates';
import { formatDate, monthYear } from '@/lib/format';
import { Sheet } from './Sheet';
import { Button } from './Button';
import { Chip } from './Chip';
import s from './DateRange.module.css';

export interface DateRange {
  from?: string;
  to?: string;
}

const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function monthGrid(month: Date): (Date | null)[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7; // Monday first
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  while (cells.length % 7) cells.push(null);
  return cells;
}

interface Props {
  open: boolean;
  onClose: () => void;
  value: DateRange;
  onApply: (range: DateRange) => void;
  title?: string;
  maxDays?: number;
  /** Allow future dates (e.g. for scheduling). Default: past only. */
  allowFuture?: boolean;
}

export function DateRangeSheet({ open, onClose, value, onApply, title = 'Filter by date', maxDays = 90, allowFuture = false }: Props) {
  const today = startOfDay(new Date());
  const [from, setFrom] = useState<Date | null>(value.from ? fromISODate(value.from) : null);
  const [to, setTo] = useState<Date | null>(value.to ? fromISODate(value.to) : null);
  const [month, setMonth] = useState(() => new Date((value.to ? fromISODate(value.to) : today).getFullYear(), (value.to ? fromISODate(value.to) : today).getMonth(), 1));

  useEffect(() => {
    if (!open) return;
    setFrom(value.from ? fromISODate(value.from) : null);
    setTo(value.to ? fromISODate(value.to) : null);
    const anchor = value.to ? fromISODate(value.to) : new Date();
    setMonth(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const cells = useMemo(() => monthGrid(month), [month]);
  const picking: 'from' | 'to' = from && !to ? 'to' : 'from';

  const disabled = (d: Date) => {
    if (!allowFuture && d > today) return true;
    if (picking === 'to' && from) return Math.abs(diffDays(from, d)) >= maxDays;
    return false;
  };

  const pick = (d: Date) => {
    if (picking === 'from' || !from) {
      setFrom(d);
      setTo(null);
    } else if (d < from) {
      setTo(from);
      setFrom(d);
    } else setTo(d);
  };

  const preset = (days: number) => {
    setTo(today);
    setFrom(addDays(today, -(days - 1)));
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const span = from && to ? diffDays(from, to) + 1 : 0;
  const canApply = (!!from && !!to) || (!from && !to);
  const inRange = (d: Date) => from && to && d > from && d < to;
  const isPreset = (days: number) => !!(from && to && isSameDay(to, today) && span === days);
  const nextDisabled = !allowFuture && month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      description={`Choose up to ${maxDays} days.`}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => {
              setFrom(null);
              setTo(null);
            }}
          >
            Reset
          </Button>
          <Button
            disabled={!canApply}
            onClick={() => {
              onApply({ from: from ? toISODate(from) : undefined, to: to ? toISODate(to) : undefined });
              onClose();
            }}
          >
            {from && to ? `Apply · ${span} day${span === 1 ? '' : 's'}` : from ? 'Pick an end date' : 'Show all dates'}
          </Button>
        </>
      }
    >
      <div className="stack" style={{ ['--gap' as string]: '16px' }}>
        <div className="row" style={{ flexWrap: 'wrap', ['--gap' as string]: '8px' }}>
          {[7, 30, 90].filter((d) => d <= maxDays).map((d) => (
            <Chip key={d} selected={isPreset(d)} onClick={() => preset(d)}>
              Last {d} days
            </Chip>
          ))}
        </div>

        <div className={s.ends}>
          <button type="button" className={`${s.end} ${picking === 'from' ? s.endActive : ''}`} onClick={() => { setFrom(null); setTo(null); }}>
            <span className={s.endLabel}>From</span>
            <span className={s.endValue}>{from ? formatDate(from) : 'Select a date'}</span>
          </button>
          <span className={s.endArrow} aria-hidden>
            →
          </span>
          <div className={`${s.end} ${picking === 'to' ? s.endActive : ''}`}>
            <span className={s.endLabel}>To</span>
            <span className={s.endValue}>{to ? formatDate(to) : from ? 'Select a date' : '—'}</span>
          </div>
        </div>

        <div className={s.cal}>
          <div className={s.calHead}>
            <button type="button" className={s.nav} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month">
              <ChevronLeft aria-hidden />
            </button>
            <span className={s.month} aria-live="polite">
              {monthYear(month)}
            </span>
            <button type="button" className={s.nav} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month" disabled={nextDisabled}>
              <ChevronRight aria-hidden />
            </button>
          </div>
          <div className={s.grid} role="grid" aria-label={monthYear(month)}>
            {WEEK.map((w) => (
              <span key={w} className={s.wd} role="columnheader">
                {w}
              </span>
            ))}
            {cells.map((d, i) =>
              d ? (
                <button
                  key={i}
                  type="button"
                  role="gridcell"
                  className={[s.day, inRange(d) && s.inRange, from && isSameDay(d, from) && s.start, to && isSameDay(d, to) && s.endDay, isSameDay(d, today) && s.today].filter(Boolean).join(' ')}
                  disabled={disabled(d)}
                  aria-pressed={!!((from && isSameDay(d, from)) || (to && isSameDay(d, to)))}
                  aria-label={formatDate(d, 'long')}
                  onClick={() => pick(d)}
                >
                  {d.getDate()}
                </button>
              ) : (
                <span key={i} />
              ),
            )}
          </div>
        </div>
        {picking === 'to' && (
          <p className={s.hint}>
            <Info aria-hidden /> Dates more than {maxDays} days from {from ? formatDate(from, 'short') : 'the start'} are greyed out.
          </p>
        )}
      </div>
    </Sheet>
  );
}

export function rangeLabel(range: DateRange): string | null {
  if (!range.from || !range.to) return null;
  return `${formatDate(range.from, 'short')} – ${formatDate(range.to, 'short')}`;
}
