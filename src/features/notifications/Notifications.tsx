import { Fragment, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, CheckCheck, ChevronRight, ClipboardList, Package, Tractor, UserRound } from 'lucide-react';
import type { AppNotification, NotificationCategory } from '@/types';
import { Screen } from '@/components/layout/Screen';
import { Chip, ChipRow } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { SkeletonRows } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState, StaleBanner } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import { actions, useStore } from '@/services/store';
import { diffDays } from '@/lib/dates';
import { formatDate, formatTime } from '@/lib/format';
import s from './Notifications.module.css';

const CATS: { value: NotificationCategory; label: string; Icon: typeof Package }[] = [
  { value: 'booking', label: 'Bookings', Icon: Tractor },
  { value: 'order', label: 'Orders', Icon: Package },
  { value: 'event', label: 'Events', Icon: CalendarDays },
  { value: 'form', label: 'Forms', Icon: ClipboardList },
];
const ICON: Record<NotificationCategory, typeof Package> = { booking: Tractor, order: Package, event: CalendarDays, form: ClipboardList, account: UserRound };
const CTA: Record<NotificationCategory, string> = { booking: 'View booking', order: 'View order', event: 'View event', form: 'View record', account: 'Open' };

function groupLabel(iso: string) {
  const d = diffDays(new Date(iso), new Date());
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7) return 'This week';
  return 'Earlier';
}

/** Short time stamp for the title line: "4:20 PM", "Yesterday", "Mon", "12 Oct". */
function stamp(iso: string) {
  const d = diffDays(new Date(iso), new Date());
  if (d === 0) {
    const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
    return mins < 60 ? `${Math.max(1, mins)}m ago` : formatTime(iso);
  }
  if (d === 1) return 'Yesterday';
  if (d < 7) return formatDate(iso, 'weekday').split(',')[0];
  return formatDate(iso, 'short');
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
    toast({ message: 'All caught up', tone: 'success', action: { label: 'Undo', onClick: () => actions.restoreUnread(prev) } });
  };

  const open = (n: AppNotification) => {
    actions.markRead(n.id);
    if (n.link) navigate(n.link);
  };

  return (
    <Screen
      title="Notifications"
      subtitle={q.data ? (unreadCount ? `${unreadCount} unread` : 'You’re all caught up') : ' '}
      largeTitle
      band
      back
      backTo="/home"
      actions={
        <button type="button" className={s.markAll} onClick={markAll} disabled={unreadCount === 0}>
          <CheckCheck aria-hidden /> Mark all read
        </button>
      }
    >
      {q.status === 'success' && (q.data?.length ?? 0) > 0 && (
        <div className={s.filters}>
          <ChipRow label="Filter by type">
            <Chip selected={cat === 'all'} onClick={() => setCat('all')}>
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
        <div className={s.state}>
          <SkeletonRows count={5} thumb={44} />
        </div>
      )}
      {q.status === 'error' && (
        <div className={s.state}>
          <ErrorState error={q.error} onRetry={q.refetch} />
        </div>
      )}
      {q.status === 'success' && list.length === 0 && (
        <div className={s.state}>
          <EmptyState
            animation="bell"
            title={cat === 'all' ? 'No notifications yet' : 'Nothing in this category'}
            body={cat === 'all' ? 'Updates about your orders, bookings, events and season records will appear here.' : 'Try another category.'}
            action={cat !== 'all' ? <Button onClick={() => setCat('all')}>Show all</Button> : undefined}
          />
        </div>
      )}
      {groups.length > 0 && (
        <Stagger key={cat} className={s.groups}>
          {groups.map((g) => {
            const groupUnread = g.items.filter((n) => unread.includes(n.id)).length;
            return (
              <StaggerItem key={g.label}>
                <section aria-label={g.label}>
                  <h2 className={s.groupTitle}>
                    <span>{g.label}</span>
                    {groupUnread > 0 && <span>{groupUnread} new</span>}
                  </h2>
                  <div className={s.list}>
                    {g.items.map((n, i) => {
                      const isUnread = unread.includes(n.id);
                      const Icon = ICON[n.category];
                      return (
                        <Fragment key={n.id}>
                          {i > 0 && <div className={s.sep} aria-hidden />}
                          <button type="button" className={`${s.item} ${isUnread ? s.unread : ''}`} onClick={() => open(n)}>
                            <span className={s.dotCol} aria-hidden>
                              <AnimatePresence initial={false}>
                                {isUnread && <motion.span className={s.dot} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 28 }} />}
                              </AnimatePresence>
                            </span>
                            <span className={`${s.icon} ${s[`c_${n.category}`]}`} aria-hidden>
                              <Icon />
                            </span>
                            <span className={s.text}>
                              <span className={s.top}>
                                <span className={s.title}>
                                  {isUnread && <span className="sr-only">Unread: </span>}
                                  {n.title}
                                </span>
                                <span className={s.time}>{stamp(n.createdAt)}</span>
                              </span>
                              <span className={`${s.body} clamp-2`}>{n.body}</span>
                              {n.link && (
                                <span className={s.cta}>
                                  {CTA[n.category]} <ChevronRight aria-hidden />
                                </span>
                              )}
                            </span>
                          </button>
                        </Fragment>
                      );
                    })}
                  </div>
                </section>
              </StaggerItem>
            );
          })}
        </Stagger>
      )}
    </Screen>
  );
}
