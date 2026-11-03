import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Info, Phone } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { Scene } from '@/components/media/Scene';
import { ProgressRing } from '@/components/ui/Misc';
import { Callout } from '@/components/ui/Blocks';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/States';
import { LandCard } from '@/components/content/Cards';
import { useUI, KD_CONTACT } from '@/app/providers';
import { cycleProgress } from '@/data/forms';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import { useStore } from '@/services/store';
import { formatDate } from '@/lib/format';
import s from './Forms.module.css';

export default function FormDetail() {
  const { id = '' } = useParams();
  const { openContact } = useUI();
  const q = useQuery(`form:${id}`, () => api.getForm(id));
  const lands = useStore((st) => st.lands);
  const c = q.data;
  const land = c ? lands.find((l) => l.id === c.landId) : undefined;
  const p = c ? cycleProgress(c) : undefined;
  const nextPending = c?.steps.find((x) => x.status === 'pending');

  return (
    <Screen title={c ? `Form cycle #${c.number}` : 'Form cycle'} back backTo="/forms">
      {q.status === 'loading' && (
        <div className={s.page}>
          <Skeleton h={240} r={28} />
          <Skeleton h={420} r={28} />
        </div>
      )}
      {q.status === 'error' && (
        <div className={s.page}>
          <ErrorState error={q.error} onRetry={q.refetch} />
        </div>
      )}
      {c && p && (
        <motion.div className={s.page} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
          <section className={s.head}>
            <div className={s.headMedia}>
              <Scene scene={land?.scene ?? { kind: 'cotton', seed: 3 }} aspect="wide" detail="high" style={{ position: 'absolute', inset: 0 }} />
              <div className={s.headScrim} />
              <div className={s.headText}>
                <div>
                  <h1 className={s.headTitle}>
                    {c.crop.name} · {c.crop.variety}
                  </h1>
                  <p className={s.headSub}>
                    {c.crop.season} · {c.landName}
                  </p>
                </div>
                <div className={s.ringWrap}>
                  <ProgressRing value={p.done} total={p.total} size={58} />
                </div>
              </div>
            </div>
            <div className={s.headFacts}>
              <div className={s.fact}>
                <div className={s.factLabel}>Sown</div>
                <div className={s.factValue}>{formatDate(c.crop.sowingDate, 'short')}</div>
              </div>
              <div className={s.fact}>
                <div className={s.factLabel}>Harvest (expected)</div>
                <div className={s.factValue}>{formatDate(c.crop.harvestDate, 'short')}</div>
              </div>
              <div className={s.fact}>
                <div className={s.factLabel}>Area</div>
                <div className={s.factValue}>{c.crop.areaAcres} acres</div>
              </div>
            </div>
          </section>

          {nextPending ? (
            <Callout tone="info" icon={<Info aria-hidden />} title={`Next: ${nextPending.title}`}>
              Your Kisani Didi will record this on her next field visit. You don’t need to fill anything.
            </Callout>
          ) : (
            <Callout tone="success" icon={<Check aria-hidden />} title="All 8 steps recorded">
              This season record is complete.
            </Callout>
          )}

          <section className="stack" style={{ ['--gap' as string]: '12px' }}>
            <h2 className={s.sectionTitle}>Season steps</h2>
            <ol className={s.steps}>
              {c.steps.map((st, i) => {
                const done = st.status === 'submitted';
                const inner = (
                  <>
                    <span className={`${s.stepDot} ${done ? s.stepDone : s.stepPending}`} aria-hidden>
                      {done ? <Check strokeWidth={3} /> : i + 1}
                    </span>
                    <span className={s.stepText}>
                      <span className={s.stepTitle} style={{ display: 'block' }}>
                        {st.title}
                      </span>
                      <span className={s.stepMeta} style={{ display: 'block' }}>
                        {done ? `Recorded ${st.updatedAt ? formatDate(st.updatedAt) : ''}${st.entries.length > 1 ? ` · ${st.entries.length} visits` : ''}` : 'Pending · next field visit'}
                      </span>
                    </span>
                    {done && <ChevronRight className={s.chev} aria-hidden />}
                  </>
                );
                return (
                  <li key={st.id}>
                    {done ? (
                      <Link to={`/forms/${c.id}/steps/${st.id}`} className={s.step} aria-label={`${st.title}, recorded. Open details`}>
                        {inner}
                      </Link>
                    ) : (
                      <div className={s.step} aria-label={`${st.title}, pending`}>
                        {inner}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>

          {land && (
            <section className="stack" style={{ ['--gap' as string]: '12px' }}>
              <h2 className={s.sectionTitle}>Field</h2>
              <LandCard land={land} wide />
            </section>
          )}

          <Button variant="secondary" icon={<Phone aria-hidden />} onClick={() => openContact({ ...KD_CONTACT, message: `Namaste, I have a question about form cycle #${c.number}.` })}>
            Question about this record?
          </Button>
        </motion.div>
      )}
    </Screen>
  );
}
