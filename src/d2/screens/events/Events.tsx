import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { FarmEvent } from '@/types';
import { api } from '@/services/api';
import { usePrime, useQuery } from '@/services/query';
import { eventStatus } from '@/data/events';
import { addDays, isSameDay, startOfDay } from '@/lib/dates';
import { formatDate, monthShort, monthYear, weekdayShort } from '@/lib/format';
import { Screen, PageTitle } from '../../layout/Screen';
import { Toggle } from '../../ui/Controls';
import { Button } from '../../ui/Button';
import { EmptyState, ErrorState, Skel, SkelList, StaleNote } from '../../ui/Blocks';
import { EventLine, EventPoster } from '../../content/Cards';
import { JournalNav } from '../../content/JournalNav';
import { InView } from '../../motion/Reveal';
import s from './Events.module.css';

type Tab = 'upcoming' | 'past';

function byMonth(list: FarmEvent[]) {
  const out: { label: string; items: FarmEvent[] }[] = [];
  list.forEach((e) => {
    const label = monthYear(e.start);
    const g = out.find((x) => x.label === label);
    if (g) g.items.push(e);
    else out.push({ label, items: [e] });
  });
  return out;
}

export default function Events() {
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get('tab') === 'past' ? 'past' : 'upcoming';
  const [day, setDay] = useState<Date | null>(null);
  const q = useQuery('events', () => api.listEvents());
  usePrime('event:', q.data);
  const all = q.data ?? [];
  const upcoming = all.filter((e) => eventStatus(e) !== 'completed');
  const past = all.filter((e) => eventStatus(e) === 'completed').reverse();
  const days = useMemo(() => Array.from({ length: 21 }, (_, i) => addDays(startOfDay(new Date()), i)), []);
  const has = (d: Date) => upcoming.some((e) => isSameDay(new Date(e.start), d));
  const visible = day ? upcoming.filter((e) => isSameDay(new Date(e.start), day)) : upcoming;
  const featured = !day ? visible[0] : undefined;
  const rest = featured ? visible.slice(1) : visible;

  return (
    <Screen title="Events" backTo="/learn">
      <PageTitle kicker="The Journal" title="Events near you" deck="Workshops, camps and field demonstrations around Ratanpur." />
      <JournalNav value="events" counts={q.data ? { events: all.length } : undefined} />
      <div className={s.toggleRow}>
        <Toggle
          label="When"
          value={tab}
          onChange={(v) => {
            setParams(v === 'past' ? { tab: 'past' } : {}, { replace: true });
            setDay(null);
          }}
          options={[
            { value: 'upcoming', label: `Upcoming${q.data ? ` · ${upcoming.length}` : ''}` },
            { value: 'past', label: `Past${q.data ? ` · ${past.length}` : ''}` },
          ]}
        />
      </div>

      {tab === 'upcoming' && q.status === 'success' && upcoming.length > 0 && (
        <div className={s.ribbon} role="group" aria-label="Pick a date">
          <button type="button" className={`${s.day} ${s.dayAll} ${!day ? s.daySel : ''}`} aria-pressed={!day} onClick={() => setDay(null)}>
            All
            <br />
            dates
          </button>
          {days.map((d) => {
            const on = !!day && isSameDay(d, day);
            const ev = has(d);
            return (
              <button key={d.toISOString()} type="button" className={`${s.day} ${on ? s.daySel : ''} ${ev ? '' : s.dayNone}`} aria-pressed={on} aria-label={`${formatDate(d, 'long')}${ev ? ', has events' : ', no events'}`} onClick={() => setDay(on ? null : d)}>
                <span className={s.wd}>{isSameDay(d, new Date()) ? 'Today' : weekdayShort(d)}</span>
                <span className={s.num}>{d.getDate()}</span>
                <span className={s.mo}>{monthShort(d)}</span>
                {ev && <span className={s.mark} aria-hidden />}
              </button>
            );
          })}
        </div>
      )}

      <StaleNote error={q.data ? q.error : undefined} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={`${tab}-${day?.toDateString() ?? 'all'}`} className={s.body} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
          {q.status === 'loading' && (
            <div className="fj-stack" style={{ ['--gap' as string]: '20px' }}>
              <Skel h={440} r="var(--r-xl)" />
              <SkelList count={2} thumb={72} />
            </div>
          )}
          {q.status === 'error' && <ErrorState error={q.error} onRetry={q.refetch} />}
          {q.status === 'success' && tab === 'upcoming' && (
            <>
              {visible.length === 0 && (
                <EmptyState
                  animation="calendar"
                  title={day ? `Nothing on ${formatDate(day, 'weekday')}` : 'No upcoming events'}
                  body={day ? 'Pick another date or see all dates.' : 'Your Kisani Didi will post workshops and camps here.'}
                  action={day ? <Button onClick={() => setDay(null)}>Show all dates</Button> : undefined}
                />
              )}
              {featured && (
                <div className={s.feature}>
                  <EventPoster event={featured} />
                </div>
              )}
              {byMonth(rest).map((g) => (
                <section key={g.label} className={s.month} aria-label={g.label}>
                  <h2 className={s.monthTitle}>{g.label}</h2>
                  <ol className={s.timeline}>
                    {g.items.map((e) => (
                      <InView key={e.id}>
                        <li className={s.tlItem}>
                          <EventLine event={e} />
                        </li>
                      </InView>
                    ))}
                  </ol>
                </section>
              ))}
            </>
          )}
          {q.status === 'success' && tab === 'past' && (
            <>
              {past.length === 0 && <EmptyState animation="calendar" title="No past events" body="Events will be listed here after they end, with their photos." />}
              <ol className={s.timeline}>
                {past.map((e) => (
                  <li key={e.id} className={s.tlItem}>
                    <EventLine event={e} />
                  </li>
                ))}
              </ol>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </Screen>
  );
}
