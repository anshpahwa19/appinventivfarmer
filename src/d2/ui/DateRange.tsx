import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { addDays, diffDays, fromISODate, isSameDay, startOfDay, toISODate } from '@/lib/dates';
import { formatDate, monthYear } from '@/lib/format';
import { Sheet } from './Sheet';
import { Button } from './Button';
import { Chip } from './Controls';
import s from './DateRange.module.css';

export interface DateRange {
  from?: string;
  to?: string;
}

const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const WEEK_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function grid(month: Date): (Date | null)[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  while (cells.length % 7) cells.push(null);
  return cells;
}

export function rangeLabel(r: DateRange): string | null {
  if (!r.from || !r.to) return null;
  return `${formatDate(r.from, 'short')} – ${formatDate(r.to, 'short')}`;
}

interface Props {
  open: boolean;
  onClose: () => void;
  value: DateRange;
  onApply: (r: DateRange) => void;
  title?: string;
  maxDays?: number;
  allowFuture?: boolean;
}

/**
 * Date-range filter. The 90-day limit is prevented, not reported: once a start
 * is picked, days beyond the limit are disabled and the hint says why.
 */
export function DateRangeSheet({ open, onClose, value, onApply, title = 'Filter by date', maxDays = 90, allowFuture = false }: Props) {
  const today = startOfDay(new Date());
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  useEffect(() => {
    if (!open) return;
    setFrom(value.from ? fromISODate(value.from) : null);
    setTo(value.to ? fromISODate(value.to) : null);
    const anchor = value.to ? fromISODate(value.to) : new Date();
    setMonth(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const cells = useMemo(() => grid(month), [month]);
  const picking: 'from' | 'to' = from && !to ? 'to' : 'from';
  const disabled = (d: Date) => (!allowFuture && d > today) || (picking === 'to' && !!from && Math.abs(diffDays(from, d)) >= maxDays);
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
  const isPreset = (days: number) => !!(from && to && isSameDay(to, today) && span === days);
  const nextDisabled = !allowFuture && month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();
  const between = (d: Date) => !!(from && to && d > from && d < to);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      kicker="Filter"
      title={title}
      description={`Pick a start and an end date, up to ${maxDays} days apart.`}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => {
              setFrom(null);
              setTo(null);
            }}
          >
            Clear
          </Button>
          <Button
            disabled={!!from && !to}
            onClick={() => {
              onApply({ from: from ? toISODate(from) : undefined, to: to ? toISODate(to) : undefined });
              onClose();
            }}
          >
            {from && to ? `Show ${span} day${span === 1 ? '' : 's'}` : from ? 'Pick an end date' : 'Show all dates'}
          </Button>
        </>
      }
    >
      <div className={s.wrap}>
        <div className={s.presets} role="group" aria-label="Quick ranges">
          {[7, 30, 90]
            .filter((d) => d <= maxDays)
            .map((d) => (
              <Chip key={d} selected={isPreset(d)} onClick={() => preset(d)}>
                Last {d} days
              </Chip>
            ))}
        </div>

        <div className={s.ends}>
          <button
            type="button"
            className={`${s.end} ${picking === 'from' ? s.endOn : ''}`}
            onClick={() => {
              setFrom(null);
              setTo(null);
            }}
          >
            <span>From</span>
            <strong>{from ? formatDate(from) : 'Pick a date'}</strong>
          </button>
          <div className={`${s.end} ${picking === 'to' ? s.endOn : ''}`}>
            <span>To</span>
            <strong>{to ? formatDate(to) : from ? 'Pick a date' : '—'}</strong>
          </div>
        </div>

        <div className={s.cal}>
          <div className={s.head}>
            <span className={s.month} aria-live="polite">
              {monthYear(month)}
            </span>
            <div className={s.navs}>
              <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month">
                <ChevronLeft aria-hidden />
              </button>
              <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month" disabled={nextDisabled}>
                <ChevronRight aria-hidden />
              </button>
            </div>
          </div>
          <div className={s.grid} role="grid" aria-label={monthYear(month)}>
            {WEEK.map((w, i) => (
              <span key={i} className={s.wd} role="columnheader" aria-label={WEEK_LONG[i]}>
                {w}
              </span>
            ))}
            {cells.map((d, i) => {
              if (!d) return <span key={i} />;
              const isStart = !!from && isSameDay(d, from);
              const isEnd = !!to && isSameDay(d, to);
              return (
                <button
                  key={i}
                  type="button"
                  role="gridcell"
                  className={[s.day, between(d) ? s.between : '', isStart ? s.start : '', isEnd ? s.endDay : '', isStart && !to ? s.solo : '', isSameDay(d, today) ? s.today : ''].join(' ')}
                  disabled={disabled(d)}
                  aria-pressed={isStart || isEnd}
                  aria-label={formatDate(d, 'long')}
                  onClick={() => pick(d)}
                >
                  {(isStart || isEnd) && <motion.span layoutId="fj-cal-pick" className={s.pickBg} transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
                  <span className={s.dayNum}>{d.getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>
        {picking === 'to' && (
          <p className={s.hint}>
            <Info aria-hidden /> Days more than {maxDays} days from {from ? formatDate(from, 'short') : 'the start'} can’t be picked.
          </p>
        )}
      </div>
    </Sheet>
  );
}
