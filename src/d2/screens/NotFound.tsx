import { Screen } from '../layout/Screen';
import { EmptyState } from '../ui/Blocks';
import { Button } from '../ui/Button';

export default function NotFound() {
  return (
    <Screen title="Not found" backTo="/home">
      <div className="fj-gutter">
        <EmptyState animation="search" title="This page doesn’t exist" body="The link may be old or mistyped." action={<Button to="/home">Go to Today</Button>} />
      </div>
    </Screen>
  );
}
