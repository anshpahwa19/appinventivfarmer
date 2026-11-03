import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ClipboardList, Package, Tractor, UserRound } from 'lucide-react';
import type { AppNotification, NotificationCategory } from '@/types';
import { Screen } from '@/components/layout/Screen';
import { Chip, ChipRow } from '@/components/ui/Chip';
import { SkeletonRows } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState, StaleBanner } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import { actions, useStore } from '@/services/store';
import { diffDays } from '@/lib/dates';
import { formatRelative } from '@/lib/format';
import s from './Notifications.module.css';

const CATS: { value: NotificationCategory; label: string; Icon: typeof Package }[] = [
  { value: 'booking', label: 'Bookings', Icon: Tractor },
  { value: 'order', label: 'Orders', Icon: Package },
  { value: 'event', label: 'Events', Icon: CalendarDays },
  { value: 'form', label: 'Forms', Icon: ClipboardList },
];
const ICON: Record<NotificationCategory, typeof Package> = { booking: Tractor, order: Package, event: CalendarDays, form: ClipboardList, account: UserRound };

function groupLabel(iso: string) {
  const d = diffDays(new Date(iso), new Date());
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7) return 'Earlier this week';
  return 'Older';
}

export default function Notifications() {
  const navigate = useNavigate();
  const toast = useToast();
  const unread = useStore((st) => st.unreadNotifications);
  const deviceCount = useStore((st) => st.deviceNotifications.length);
  const q = useQuery(`notifications:${deviceCount}`, () => api.listNotifications());
  const [cat, setCat] = useState<NotificationCategory | 'all'>('all');

  const list = (q.data ?? []).filter((n) => cat === 'all' || n.category === cat);
  const unreadCount = (q.data ?? []).filter((n) => unread.includes(n.id)).length;
  const groups = useMemo(() => {
    const out: { label: string; items: AppNotification[] }[] = [];
    list.forEach((n) => {
      const label = groupLabel(n.createdAt);
      const g = out.find((x) => x.label === label);
      if (g) g.items.push(n);
      else out.push({ label, items: [n] });
    });
    return out;
  }, [list]);

  const markAll = () => {
    const prev = actions.markAllRead();
    toast({ message: 'All notifications marked as read', tone: 'success', action: { label: 'Undo', onClick: () => actions.restoreUnread(prev) } });
  };

  const open = (n: AppNotification) => {
    actions.markRead(n.id);
    if (n.link) navigate(n.link);
  };

  return (
    <Screen
      title="Notifications"
      back
      backTo="/home"
      actions={
        <button type="button" className={s.markAll} onClick={markAll} disabled={unreadCount === 0}>
          Mark all read
        </button>
      }
    >
      {q.status === 'success' && (q.data?.length ?? 0) > 0 && (
        <div className={s.chips}>
          <ChipRow label="Filter by type">
            <Chip selected={cat === 'all'} onClick={() => setCat('all')} count={unreadCount || undefined}>
              All
            </Chip>
            {CATS.filter((c) => q.data?.some((n) => n.category === c.value)).map((c) => (
              <Chip key={c.value} selected={cat === c.value} onClick={() => setCat(cat === c.value ? 'all' : c.value)} icon={<c.Icon aria-hidden />}>
                {c.label}
              </Chip>
            ))}
          </ChipRow>
        </div>
      )}
      <StaleBanner error={q.data ? q.error : undefined} />
      {q.status === 'loading' && (
        <div className="gutter" style={{ paddingTop: 12 }}>
          <SkeletonRows count={5} thumb={42} />
        </div>
      )}
      {q.status === 'error' && (
        <div className="gutter">
          <ErrorState error={q.error} onRetry={q.refetch} />
        </div>
      )}
      {q.status === 'success' && list.length === 0 && (
        <div className="gutter" style={{ paddingTop: 12 }}>
          <EmptyState
            animation="bell"
            title={cat === 'all' ? 'No notifications yet' : 'Nothing in this category'}
            body={cat === 'all' ? 'Updates about your orders, bookings, events and season records will appear here.' : 'Try another category.'}
            action={cat !== 'all' ? <Button onClick={() => setCat('all')}>Show all</Button> : undefined}
          />
        </div>
      )}
      {groups.map((g) => (
        <section key={g.label} className={s.group} aria-label={g.label}>
          <h2 className={s.groupTitle}>{g.label}</h2>
          <AnimatePresence initial={false}>
            {g.items.map((n, i) => {
              const isUnread = unread.includes(n.id);
              const Icon = ICON[n.category];
              return (
                <motion.button
                  key={n.id}
                  type="button"
                  layout
                  className={`${s.item} ${isUnread ? s.unread : ''}`}
                  onClick={() => open(n)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 6) * 0.03 } }}
                >
                  <span className={`${s.icon} ${s[`c_${n.category}`]}`} aria-hidden>
                    <Icon />
                  </span>
                  <span className={s.text}>
                    <span className={s.title} style={{ display: 'block', paddingRight: isUnread ? 18 : 0 }}>
                      {isUnread && <span className="sr-only">Unread: </span>}
                      {n.title}
                    </span>
                    <span className={`${s.body} clamp-2`}>{n.body}</span>
                    <span className={s.time} style={{ display: 'block' }}>
                      {formatRelative(n.createdAt)}
                    </span>
                  </span>
                  {isUnread && <span className={s.dot} aria-hidden />}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </section>
      ))}
    </Screen>
  );
}
