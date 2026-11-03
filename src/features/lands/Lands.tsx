import { Plus } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { SkeletonCards } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { LandCard } from '@/components/content/Cards';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import { useStore } from '@/services/store';
import s from './Lands.module.css';

export default function Lands() {
  const lands = useStore((st) => st.lands);
  const q = useQuery(`lands:${lands.length}`, () => api.listLands());
  const list = q.data ? lands.filter((l) => q.data!.some((x) => x.id === l.id)) : [];
  const acres = list.reduce((a, l) => a + l.areaAcres, 0);
  return (
    <Screen
      title="My fields"
      subtitle={q.data ? `${list.length} fields · ${acres} acres` : 'Your registered land'}
      largeTitle
      back
      backTo="/home"
      largeActions={
        <Button size="sm" icon={<Plus aria-hidden />} to="/lands/new">
          Add
        </Button>
      }
    >
      <div className={s.list}>
        {q.status === 'loading' && <SkeletonCards count={2} h={260} />}
        {q.status === 'error' && <ErrorState error={q.error} onRetry={q.refetch} />}
        {q.status === 'success' && list.length === 0 && <EmptyState animation="emptyBox" title="No fields yet" body="Add your land to book services and keep season records." action={<Button to="/lands/new">Add a field</Button>} />}
        {list.map((l) => (
          <LandCard key={l.id} land={l} wide />
        ))}
      </div>
    </Screen>
  );
}
