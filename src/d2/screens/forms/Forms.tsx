import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { FormCycle } from '@/types';
import { api } from '@/services/api';
import { usePrime, useQuery } from '@/services/query';
import { useStore } from '@/services/store';
import { cycleProgress } from '@/data/forms';
import { formatRelativeInline } from '@/lib/format';
import { Screen, PageTitle } from '../../layout/Screen';
import { Photo } from '../../photo/Photo';
import { Chip, ChipRow } from '../../ui/Controls';
import { Button } from '../../ui/Button';
import { EmptyState, ErrorState, Segments, Skel, StaleNote, StatusTag } from '../../ui/Blocks';
import { photoOf } from '../../content/meta';
import { to } from '../../paths';
import s from './Forms.module.css';

type Filter = 'all' | 'progress' | 'done';

const lastUpdate = (c: FormCycle) => c.steps.filter((x) => x.updatedAt).sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))[0];

export default function Forms() {
  const q = useQuery('forms', () => api.listForms());
  usePrime('form:', q.data);
  const lands = useStore((st) => st.lands);
  const [filter, setFilter] = useState<Filter>('all');
  const all = q.data ?? [];
  const list = all.filter((c) => (filter === 'all' ? true : filter === 'done' ? cycleProgress(c).complete : !cycleProgress(c).complete));
  const nProgress = all.filter((c) => !cycleProgress(c).complete).length;

  return (
    <Screen title="My forms" backTo="/account">
      <PageTitle kicker="Season records" title="My forms" deck="Your Kisani Didi records each step of the season on her field visits. You can read every entry here." />
      {q.status === 'success' && all.length > 0 && (
        <ChipRow label="Filter by status">
          <Chip selected={filter === 'all'} onClick={() => setFilter('all')}>
            All
          </Chip>
          <Chip selected={filter === 'progress'} onClick={() => setFilter('progress')} count={nProgress}>
            In progress
          </Chip>
          <Chip selected={filter === 'done'} onClick={() => setFilter('done')} count={all.length - nProgress}>
            Completed
          </Chip>
        </ChipRow>
      )}
      <StaleNote error={q.data ? q.error : undefined} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={filter} className={s.list} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
          {q.status === 'loading' && [0, 1].map((i) => <Skel key={i} h={300} r="var(--r-xl)" />)}
          {q.status === 'error' && <ErrorState error={q.error} onRetry={q.refetch} />}
          {q.status === 'success' && list.length === 0 && (
            <EmptyState
              animation="records"
              title={filter === 'all' ? 'No season records yet' : 'Nothing here'}
              body={filter === 'all' ? 'Your Kisani Didi starts a record when she visits your field at the start of a season.' : 'Try another filter.'}
              action={filter !== 'all' ? <Button onClick={() => setFilter('all')}>Show all</Button> : undefined}
            />
          )}
          {list.map((c, i) => {
            const p = cycleProgress(c);
            const land = lands.find((l) => l.id === c.landId);
            const last = lastUpdate(c);
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} whileTap={{ scale: 0.985 }}>
                <Link to={to(`/forms/${c.id}`)} className={s.cycle} aria-label={`Form cycle ${c.number}, ${c.crop.name} ${c.crop.season}, ${p.done} of ${p.total} steps recorded`}>
                  <Photo id={land ? photoOf(land) : 'cotton-picking'} ratio="21/9" decorative muted={p.complete} />
                  <div className={s.cycleBody}>
                    <div className={s.cycleTop}>
                      <span className={s.cycleNo}>
                        No. {String(c.number).padStart(2, '0')}
                      </span>
                      <StatusTag tone={p.complete ? 'success' : 'warning'}>{p.complete ? 'Completed' : 'In progress'}</StatusTag>
                    </div>
                    <h2 className={s.cycleTitle}>
                      {c.crop.name} <span>· {c.crop.season}</span>
                    </h2>
                    <p className={s.cycleSub}>
                      {c.landName} · {c.crop.areaAcres} acres · {c.crop.variety}
                    </p>
                    <Segments done={p.done} total={p.total} label={`${p.done} of ${p.total} steps recorded`} />
                    <div className={s.cycleFoot}>
                      <strong>
                        {p.done}/{p.total} steps
                      </strong>
                      {last?.updatedAt && <span>Updated {formatRelativeInline(last.updatedAt)}</span>}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </Screen>
  );
}
