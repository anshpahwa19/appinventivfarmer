import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { StepEntry } from '@/types';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import { KISANI_DIDI } from '@/data/people';
import { formatDate } from '@/lib/format';
import { Screen } from '../../layout/Screen';
import { Accordion, Avatar, EmptyState, ErrorState, Receipt, Segments, Skel } from '../../ui/Blocks';
import { Button } from '../../ui/Button';
import { to } from '../../paths';
import s from './Forms.module.css';

function Entry({ entry, flat }: { entry: StepEntry; flat?: boolean }) {
  return (
    <div className="fj-stack" style={{ ['--gap' as string]: '14px' }}>
      {entry.sections.map((sec) => (
        <section key={sec.title} className={flat ? s.flatSection : s.sheetCard}>
          <h3 className={s.sectionTitle}>{sec.title}</h3>
          <Receipt rows={sec.fields.map((f) => ({ label: f.label, value: f.value, total: f.total, formula: f.formula }))} />
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
    <Screen title={step?.title ?? 'Step'} backTo={`/forms/${id}`}>
      {q.status === 'loading' && (
        <div className={s.page}>
          <Skel h={80} />
          <Skel h={320} r="var(--r-xl)" />
        </div>
      )}
      {q.status === 'error' && (
        <div className={s.page}>
          <ErrorState error={q.error} onRetry={q.refetch} />
        </div>
      )}
      {c && !step && (
        <div className={s.page}>
          <EmptyState animation="search" title="Step not found" action={<Button to={`/forms/${id}`}>Back to the form</Button>} />
        </div>
      )}
      {c && step && (
        <motion.div key={step.id} className={s.page} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
          <div>
            <p className={s.stepNum}>
              {String(idx + 1).padStart(2, '0')}
              <span> / {String(c.steps.length).padStart(2, '0')}</span>
            </p>
            <h2 className={s.stepTitle}>{step.title}</h2>
            <p className={s.stepSub}>
              Form cycle #{c.number} · {c.crop.name}, {c.crop.season}
            </p>
            <div style={{ marginTop: 14 }}>
              <Segments done={idx + 1} total={c.steps.length} label={`Step ${idx + 1} of ${c.steps.length}`} />
            </div>
          </div>
          {step.updatedBy && (
            <div className={s.by}>
              <Avatar name={KISANI_DIDI.name} size={44} />
              <div>
                <strong>{step.updatedBy}</strong>
                Recorded {step.updatedAt ? formatDate(step.updatedAt, 'long') : ''}
              </div>
            </div>
          )}
          {step.entries.length === 0 && <EmptyState animation="records" title="Not recorded yet" body="Your Kisani Didi records this step on her next visit." />}
          {step.entries.length === 1 && <Entry entry={step.entries[0]} />}
          {step.entries.length > 1 &&
            step.entries.map((e, i) => (
              <Accordion key={e.id} title={`Visit ${i + 1}`} meta={formatDate(e.date, 'long')} defaultOpen={i === 0}>
                <Entry entry={e} flat />
              </Accordion>
            ))}
          <nav className={s.pager} aria-label="Other steps">
            {prev ? (
              <Link to={to(`/forms/${id}/steps/${prev.id}`)} replace className={s.pagerLink}>
                <small>
                  <ArrowLeft aria-hidden /> Previous
                </small>
                {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link to={to(`/forms/${id}/steps/${next.id}`)} replace className={`${s.pagerLink} ${s.pagerNext}`}>
                <small>
                  Next <ArrowRight aria-hidden />
                </small>
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
