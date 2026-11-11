import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Info, Phone } from 'lucide-react';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import { useStore } from '@/services/store';
import { cycleProgress } from '@/data/forms';
import { formatDate } from '@/lib/format';
import { Screen } from '../../layout/Screen';
import { Photo } from '../../photo/Photo';
import { Button } from '../../ui/Button';
import { ErrorState, Note, SectionHead, Segments, Skel, Timeline } from '../../ui/Blocks';
import { FieldTile } from '../../content/Cards';
import { photoOf } from '../../content/meta';
import { KD_CONTACT, useUI } from '../../providers';
import { RevealText } from '../../motion/Reveal';
import s from './Forms.module.css';

export default function FormDetail() {
  const { id = '' } = useParams();
  const { openContact } = useUI();
  const q = useQuery(`form:${id}`, () => api.getForm(id));
  const lands = useStore((st) => st.lands);
  const c = q.data;
  const land = c ? lands.find((l) => l.id === c.landId) : undefined;
  const p = c ? cycleProgress(c) : undefined;
  const next = c?.steps.find((x) => x.status === 'pending');

  return (
    <Screen title={c ? `Form cycle #${c.number}` : 'Form cycle'} backTo="/forms">
      {q.status === 'loading' && (
        <div className={s.page}>
          <Skel h={300} r="var(--r-xl)" />
          <Skel h={420} r="var(--r-xl)" />
        </div>
      )}
      {q.status === 'error' && (
        <div className={s.page}>
          <ErrorState error={q.error} onRetry={q.refetch} />
        </div>
      )}
      {c && p && (
        <motion.div className={s.page} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <section className={s.head}>
            <div className={s.headPhoto}>
              <Photo id={land ? photoOf(land) : 'cotton-picking'} ratio="fill" shade="bottom" label="hero" />
            </div>
            <div className={s.headPanel}>
              <p className={s.kicker}>Form cycle No. {String(c.number).padStart(2, '0')}</p>
              <RevealText text={`${c.crop.name}, ${c.crop.season}`} className={s.headTitle} as="h2" />
              <p className={s.headSub}>
                {c.crop.variety} · {c.landName}
              </p>
              <div className={s.score}>
                <span className={s.scoreNum}>
                  {p.done}
                  <span>/{p.total}</span>
                </span>
                <span className={s.scoreLabel}>steps recorded</span>
              </div>
              <Segments done={p.done} total={p.total} label={`${p.done} of ${p.total} steps recorded`} />
              <dl className={s.facts}>
                <div>
                  <dt>Sown</dt>
                  <dd>{formatDate(c.crop.sowingDate, 'short')}</dd>
                </div>
                <div>
                  <dt>Harvest</dt>
                  <dd>{formatDate(c.crop.harvestDate, 'short')}</dd>
                </div>
                <div>
                  <dt>Area</dt>
                  <dd>{c.crop.areaAcres} ac</dd>
                </div>
              </dl>
            </div>
          </section>

          {next ? (
            <Note tone="info" icon={<Info aria-hidden />} title={`Next: ${next.title}`}>
              Your Kisani Didi records this on her next field visit. You don’t need to fill anything.
            </Note>
          ) : (
            <Note tone="success" icon={<Check aria-hidden />} title="All 8 steps recorded">
              This season record is complete.
            </Note>
          )}

          <section>
            <SectionHead title="The season, step by step" inset={false} />
            <Timeline
              items={c.steps.map((st) => {
                const done = st.status === 'submitted';
                return {
                  title: st.title,
                  meta: done ? `Recorded ${st.updatedAt ? formatDate(st.updatedAt) : ''}${st.entries.length > 1 ? ` · ${st.entries.length} visits` : ''}` : st.id === next?.id ? 'Next field visit' : 'Pending',
                  state: done ? 'done' : st.id === next?.id ? 'current' : 'upcoming',
                  to: done ? `/forms/${c.id}/steps/${st.id}` : undefined,
                };
              })}
            />
          </section>

          {land && (
            <section>
              <SectionHead title="The field" inset={false} />
              <FieldTile land={land} width="100%" ratio="16/9" />
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
