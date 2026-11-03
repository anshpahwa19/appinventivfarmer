import { Screen } from '@/components/layout/Screen';
import { EmptyState } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <Screen title="Not found" back backTo="/home">
      <div className="gutter" style={{ paddingTop: 24 }}>
        <EmptyState animation="search" title="This page doesn’t exist" body="The link may be old or mistyped." action={<Button to="/home">Go to home</Button>} />
      </div>
    </Screen>
  );
}
