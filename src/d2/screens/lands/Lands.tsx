import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import { useStore } from '@/services/store';
import { Screen } from '../../layout/Screen';
import { Button } from '../../ui/Button';
import { EmptyState, ErrorState, Skel } from '../../ui/Blocks';
import { FieldTile } from '../../content/Cards';
import s from './Lands.module.css';

export default function Lands() {
  const lands = useStore((st) => st.lands);
  const q = useQuery(`lands:${lands.length}`, () => api.listLands());
  const list = q.data ? lands.filter((l) => q.data!.some((x) => x.id === l.id)) : [];
  const acres = list.reduce((a, l) => a + l.areaAcres, 0);
  const crops = new Set(list.flatMap((l) => l.crops.map((c) => c.name))).size;
  return (
    <Screen title="My fields" backTo="/home" actions={<Button size="sm" icon={<Plus aria-hidden />} to="/lands/new">Add field</Button>}>
      <div className={s.intro}>
        <p className={s.kicker}>Your land</p>
        <h2 className={s.title}>My fields</h2>
        {q.data && list.length > 0 && (
          <dl className={s.totals}>
            <div>
              <dt>Fields</dt>
              <dd>{list.length}</dd>
            </div>
            <div>
              <dt>Acres</dt>
              <dd>{acres}</dd>
            </div>
            <div>
              <dt>Crops</dt>
              <dd>{crops}</dd>
            </div>
          </dl>
        )}
      </div>
      <div className={s.list}>
        {q.status === 'loading' && [0, 1].map((i) => <Skel key={i} h={220} r="var(--r-xl)" />)}
        {q.status === 'error' && <ErrorState error={q.error} onRetry={q.refetch} />}
        {q.status === 'success' && list.length === 0 && <EmptyState animation="sprout" title="No fields yet" body="Add your land to book services and keep season records." action={<Button to="/lands/new">Add a field</Button>} />}
        {list.map((l, i) => (
          <motion.div key={l.id} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
            <FieldTile land={l} width="100%" ratio={i === 0 ? '4/5' : '16/9'} />
          </motion.div>
        ))}
      </div>
    </Screen>
  );
}
