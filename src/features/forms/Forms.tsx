import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Screen } from '@/components/layout/Screen';
import { Scene } from '@/components/media/Scene';
import { Chip, ChipRow } from '@/components/ui/Chip';
import { ProgressBar, StatusBadge } from '@/components/ui/Misc';
import { SkeletonCards } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState, StaleBanner } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { Press } from '@/components/content/Cards';
import { CheckCircle2, Clock3 } from 'lucide-react';
import { cycleProgress } from '@/data/forms';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import { useStore } from '@/services/store';
import { formatRelativeInline } from '@/lib/format';
import type { FormCycle } from '@/types';
import s from './Forms.module.css';

type Filter = 'all' | 'progress' | 'done';

function lastUpdate(c: FormCycle) {
  const done = c.steps.filter((x) => x.updatedAt).sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
  return done[0];
}

export default function Forms() {
  const q = useQuery('forms', () => api.listForms());
  const lands = useStore((st) => st.lands);
  const [filter, setFilter] = useState<Filter>('all');
  const list = (q.data ?? []).filter((c) => (filter === 'all' ? true : filter === 'done' ? cycleProgress(c).complete : !cycleProgress(c).complete));
  const counts = { progress: (q.data ?? []).filter((c) => !cycleProgress(c).complete).length, done: (q.data ?? []).filter((c) => cycleProgress(c).complete).length };

  return (
    <Screen title="My forms" subtitle="Season records kept by your Kisani Didi" largeTitle back backTo="/account">
      {q.status === 'success' && (q.data?.length ?? 0) > 0 && (
        <ChipRow label="Filter by status">
          <Chip selected={filter === 'all'} onClick={() => setFilter('all')}>
            All
          </Chip>
          <Chip selected={filter === 'progress'} onClick={() => setFilter('progress')} count={counts.progress}>
            In progress
          </Chip>
          <Chip selected={filter === 'done'} onClick={() => setFilter('done')} count={counts.done}>
            Completed
          </Chip>
        </ChipRow>
      )}
      <StaleBanner error={q.data ? q.error : undefined} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={filter} className={s.list} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {q.status === 'loading' && <SkeletonCards count={2} h={240} />}
          {q.status === 'error' && <ErrorState error={q.error} onRetry={q.refetch} />}
          {q.status === 'success' && list.length === 0 && (
            <EmptyState
              animation="forms"
              title={filter === 'all' ? 'No season records yet' : 'Nothing here'}
              body={filter === 'all' ? 'Your Kisani Didi starts a record when she visits your field at the start of a season.' : 'Try another filter.'}
              action={filter !== 'all' ? <Button onClick={() => setFilter('all')}>Show all</Button> : undefined}
            />
          )}
          {list.map((c) => {
            const p = cycleProgress(c);
            const land = lands.find((l) => l.id === c.landId);
            const last = lastUpdate(c);
            return (
              <Press key={c.id} to={`/forms/${c.id}`} label={`Form cycle ${c.number}, ${c.crop.name} ${c.crop.season}, ${p.done} of ${p.total} steps`}>
                <div className={s.cycle}>
                  <div className={s.cycleMedia}>
                    <Scene scene={land?.scene ?? { kind: 'cotton', seed: 1 }} aspect="wide" style={{ position: 'absolute', inset: 0 }} />
                  </div>
                  <div className={s.cycleBody}>
                    <div className={s.cycleTop}>
                      <span className={s.cycleNo}>Form cycle #{c.number}</span>
                      {p.complete ? (
                        <StatusBadge tone="success" icon={<CheckCircle2 aria-hidden />}>
                          Completed
                        </StatusBadge>
                      ) : (
                        <StatusBadge tone="warning" icon={<Clock3 aria-hidden />}>
                          In progress
                        </StatusBadge>
                      )}
                    </div>
                    <div>
                      <h2 className={s.cycleTitle}>
                        {c.crop.name} · {c.crop.season}
                      </h2>
                      <p className={s.cycleSub}>
                        {c.landName} · {c.crop.areaAcres} acres
                      </p>
                    </div>
                    <div className={s.progressRow}>
                      <span>
                        {p.done} of {p.total} steps recorded
                      </span>
                      {last?.updatedAt && <span style={{ color: 'var(--fg-3)', fontWeight: 600 }}>Updated {formatRelativeInline(last.updatedAt)}</span>}
                    </div>
                    <ProgressBar value={p.done} total={p.total} label={`${p.done} of ${p.total} steps recorded`} />
                  </div>
                </div>
              </Press>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </Screen>
  );
}
