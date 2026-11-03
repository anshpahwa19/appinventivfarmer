import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Screen } from '@/components/layout/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SkeletonCards } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState, StaleBanner } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { EventCard, EventRow } from '@/components/content/Cards';
import { eventStatus } from '@/data/events';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import { addDays, isSameDay, startOfDay } from '@/lib/dates';
import { formatDate, monthYear, weekdayShort } from '@/lib/format';
import type { FarmEvent } from '@/types';
import s from './Events.module.css';

type Tab = 'upcoming' | 'past';

function groupByMonth(list: FarmEvent[]) {
  const groups: { label: string; items: FarmEvent[] }[] = [];
  for (const ev of list) {
    const label = monthYear(ev.start);
    const g = groups.find((x) => x.label === label);
    if (g) g.items.push(ev);
    else groups.push({ label, items: [ev] });
  }
  return groups;
}

export default function Events() {
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get('tab') === 'past' ? 'past' : 'upcoming';
  const [day, setDay] = useState<Date | null>(null);
  const q = useQuery('events', () => api.listEvents());
  const all = q.data ?? [];
  const upcoming = all.filter((e) => eventStatus(e) !== 'completed');
  const past = all.filter((e) => eventStatus(e) === 'completed').reverse();

  const days = useMemo(() => Array.from({ length: 21 }, (_, i) => addDays(startOfDay(new Date()), i)), []);
  const hasEvent = (d: Date) => upcoming.some((e) => isSameDay(new Date(e.start), d));

  const visibleUpcoming = day ? upcoming.filter((e) => isSameDay(new Date(e.start), day)) : upcoming;
  const featured = !day ? visibleUpcoming[0] : undefined;
  const rest = featured ? visibleUpcoming.slice(1) : visibleUpcoming;

  return (
    <Screen title="Events" subtitle="Workshops, camps and demos near you" largeTitle back backTo="/home">
      <div className={s.tabs}>
        <SegmentedControl
          label="Event time"
          value={tab}
          onChange={(v) => {
            setParams(v === 'past' ? { tab: 'past' } : {}, { replace: true });
            setDay(null);
          }}
          segments={[
            { value: 'upcoming', label: 'Upcoming', count: q.data ? upcoming.length : undefined },
            { value: 'past', label: 'Past', count: q.data ? past.length : undefined },
          ]}
        />
      </div>

      {tab === 'upcoming' && q.status === 'success' && upcoming.length > 0 && (
        <div className={s.strip} role="group" aria-label="Pick a date">
          <button type="button" className={`${s.day} ${s.dayAll} ${!day ? s.daySel : ''}`} aria-pressed={!day} onClick={() => setDay(null)}>
            All dates
          </button>
          {days.map((d) => {
            const has = hasEvent(d);
            const sel = !!day && isSameDay(d, day);
            return (
              <button
                key={d.toISOString()}
                type="button"
                className={`${s.day} ${sel ? s.daySel : ''} ${!has ? s.dayEmpty : ''}`}
                aria-pressed={sel}
                aria-label={`${formatDate(d, 'long')}${has ? ', has events' : ', no events'}`}
                onClick={() => setDay(sel ? null : d)}
              >
                <span className={s.dayWd}>{isSameDay(d, new Date()) ? 'Today' : weekdayShort(d)}</span>
                <span className={s.dayNum}>{d.getDate()}</span>
                <span className={has ? s.dayDot : s.dayNoDot} aria-hidden />
              </button>
            );
          })}
        </div>
      )}

      <StaleBanner error={q.data ? q.error : undefined} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={`${tab}-${day?.toDateString() ?? 'all'}`} className={s.list} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
          {q.status === 'loading' && <SkeletonCards count={2} h={300} />}
          {q.status === 'error' && <ErrorState error={q.error} onRetry={q.refetch} />}
          {q.status === 'success' && tab === 'upcoming' && (
            <>
              {visibleUpcoming.length === 0 && (
                <EmptyState
                  animation="calendar"
                  title={day ? `Nothing on ${formatDate(day, 'weekday')}` : 'No upcoming events'}
                  body={day ? 'Pick another date or see all events.' : 'Your Kisani Didi will post workshops and camps here.'}
                  action={day ? <Button onClick={() => setDay(null)}>Show all dates</Button> : undefined}
                />
              )}
              {featured && <EventCard event={featured} featured />}
              {groupByMonth(rest).map((g) => (
                <section key={g.label} className="stack" style={{ ['--gap' as string]: '10px' }}>
                  <h2 className={s.month}>{g.label}</h2>
                  {g.items.map((e) => (
                    <EventRow key={e.id} event={e} />
                  ))}
                </section>
              ))}
            </>
          )}
          {q.status === 'success' && tab === 'past' && (
            <>
              {past.length === 0 && <EmptyState animation="calendar" title="No past events" body="Events you could attend will be listed here after they end." />}
              {past.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </Screen>
  );
}
