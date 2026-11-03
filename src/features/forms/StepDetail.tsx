import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { StepEntry } from '@/types';
import { Screen } from '@/components/layout/Screen';
import { Accordion, DetailGrid } from '@/components/ui/Blocks';
import { Avatar } from '@/components/ui/Misc';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { KISANI_DIDI } from '@/data/people';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import { formatDate } from '@/lib/format';
import s from './Forms.module.css';

function Entry({ entry, flat }: { entry: StepEntry; flat?: boolean }) {
  return (
    <div className="stack" style={{ ['--gap' as string]: flat ? '18px' : '12px' }}>
      {entry.sections.map((sec) => (
        <section key={sec.title} className={flat ? undefined : s.sectionCard}>
          <h3 className={s.sectionCardTitle}>{sec.title}</h3>
          <DetailGrid items={sec.fields.map((f) => ({ label: f.label, value: f.value, total: f.total, formula: f.formula, full: !!f.formula && !f.total }))} />
        </section>
      ))}
    </div>
  );
}

export default function StepDetail() {
  const { id = '', stepId = '' } = useParams();
  const q = useQuery(`form:${id}`, () => api.getForm(id));
  const c = q.data;
  const idx = c ? c.steps.findIndex((x) => x.id === stepId) : -1;
  const step = c && idx >= 0 ? c.steps[idx] : undefined;
  const prev = c ? c.steps.slice(0, Math.max(0, idx)).reverse().find((x) => x.status === 'submitted') : undefined;
  const next = c ? c.steps.slice(idx + 1).find((x) => x.status === 'submitted') : undefined;

  return (
    <Screen title={step?.title ?? 'Step'} back backTo={`/forms/${id}`}>
      {q.status === 'loading' && (
        <div className={s.page}>
          <Skeleton h={60} r={20} />
          <Skeleton h={320} r={28} />
        </div>
      )}
      {q.status === 'error' && (
        <div className={s.page}>
          <ErrorState error={q.error} onRetry={q.refetch} />
        </div>
      )}
      {c && !step && (
        <div className={s.page}>
          <EmptyState animation="search" title="Step not found" action={<Button to={`/forms/${id}`}>Back to form</Button>} />
        </div>
      )}
      {c && step && (
        <motion.div key={step.id} className={s.page} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div>
            <p className="t-caption c-3">
              Step {idx + 1} of {c.steps.length} · Form cycle #{c.number} · {c.crop.name}
            </p>
            <h1 className="t-title" style={{ marginTop: 8 }}>
              {step.title}
            </h1>
          </div>
          {step.updatedBy && (
            <div className={s.by}>
              <Avatar name={KISANI_DIDI.name} size={40} />
              <div>
                <strong>{step.updatedBy}</strong>
                Recorded {step.updatedAt ? formatDate(step.updatedAt, 'long') : ''}
              </div>
            </div>
          )}
          {step.entries.length === 0 && <EmptyState animation="forms" title="Not recorded yet" body="Your Kisani Didi will record this step on her next visit." />}
          {step.entries.length === 1 && <Entry entry={step.entries[0]} />}
          {step.entries.length > 1 &&
            step.entries.map((e, i) => (
              <Accordion key={e.id} title={`Visit ${i + 1}`} meta={formatDate(e.date, 'long')} defaultOpen={i === 0}>
                <Entry entry={e} flat />
              </Accordion>
            ))}
          <nav className={s.pager} aria-label="Other steps">
            {prev ? (
              <Link to={`/forms/${id}/steps/${prev.id}`} replace className={s.pagerLink}>
                <small>Previous</small>
                {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link to={`/forms/${id}/steps/${next.id}`} replace className={`${s.pagerLink} ${s.pagerNext}`}>
                <small>Next</small>
                {next.title}
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </motion.div>
      )}
    </Screen>
  );
}
