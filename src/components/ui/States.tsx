import type { ReactNode } from 'react';
import { CloudOff, RefreshCw } from 'lucide-react';
import { Lottie } from '@/components/media/Lottie';
import type { AnimationName } from '@/lottie/animations';
import type { ApiError } from '@/services/api';
import { Button } from './Button';
import s from './States.module.css';

interface EmptyProps {
  animation: AnimationName;
  title: string;
  body?: ReactNode;
  action?: ReactNode;
  card?: boolean;
  size?: number;
}

export function EmptyState({ animation, title, body, action, card = true, size = 132 }: EmptyProps) {
  return (
    <div className={`${s.state} ${card ? s.card : ''}`}>
      <Lottie name={animation} size={size} />
      <h3 className={s.title}>{title}</h3>
      {body && <p className={s.body}>{body}</p>}
      {action && <div className={s.actions}>{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry, card = true }: { error?: ApiError; onRetry: () => void; card?: boolean }) {
  const offline = error?.code === 'offline';
  return (
    <div className={`${s.state} ${card ? s.card : ''}`} role="alert">
      <Lottie name={offline ? 'offline' : 'search'} size={124} />
      <h3 className={s.title}>{offline ? 'No internet connection' : error?.code === 'not_found' ? 'Not found' : 'Couldn’t load this'}</h3>
      <p className={s.body}>{error?.message ?? 'Please try again.'}</p>
      <div className={s.actions}>
        <Button variant="primary" icon={<RefreshCw aria-hidden />} onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  );
}

/** Shown above cached content when a background refresh failed. */
export function StaleBanner({ error }: { error?: ApiError }) {
  if (!error) return null;
  return (
    <div className={s.banner} role="status">
      <CloudOff aria-hidden />
      {error.code === 'offline' ? 'You’re offline. Showing what was saved on this phone.' : 'Couldn’t refresh. Showing earlier data.'}
    </div>
  );
}
