import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, CalendarDays, CheckCheck, ClipboardList, Package, Tractor, UserRound } from 'lucide-react';
import type { AppNotification, NotificationCategory } from '@/types';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import { actions, useStore } from '@/services/store';
import { diffDays } from '@/lib/dates';
import { formatDate, formatTime } from '@/lib/format';
import { Screen } from '../../layout/Screen';
import { Chip, ChipRow } from '../../ui/Controls';
import { Button } from '../../ui/Button';
import { EmptyState, ErrorState, SkelList, StaleNote } from '../../ui/Blocks';
import { useToast } from '../../ui/Toast';
import { useNav } from '../../nav';
import s from './Notifications.module.css';

const CATS: { value: NotificationCategory; label: string; Icon: typeof Package }[] = [
  { value: 'booking', label: 'Bookings', Icon: Tractor },
  { value: 'order', label: 'Orders', Icon: Package },
  { value: 'event', label: 'Events', Icon: CalendarDays },
  { value: 'form', label: 'Records', Icon: ClipboardList },
];
const ICON: Record<NotificationCategory, typeof Package> = { booking: Tractor, order: Package, event: CalendarDays, form: ClipboardList, account: UserRound };
const CTA: Record<NotificationCategory, string> = { booking: 'Open booking', order: 'Open order', event: 'Open event', form: 'Open record', account: 'Open' };

function group(iso: string) {
  const d = diffDays(new Date(iso), new Date());
  return d === 0 ? 'Today' : d === 1 ? 'Yesterday' : d < 7 ? 'This week' : 'Earlier';
}
function stamp(iso: string) {
  const d = diffDays(new Date(iso), new Date());
  if (d === 0) {
    const m = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
    return m < 60 ? `${Math.max(1, m)} min ago` : formatTime(iso);
  }
  if (d === 1) return 'Yesterday';
  if (d < 7) return formatDate(iso, 'weekday').split(',')[0];
  return formatDate(iso, 'short');
}

export default function Notifications() {
  const nav = useNav();
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
      const label = group(n.createdAt);
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
    if (n.link) nav(n.link);
  };

  return (
    <Screen
      title="Activity"
      backTo="/home"
      actions={
        <Button size="sm" variant="ghost" icon={<CheckCheck aria-hidden />} onClick={markAll} disabled={unreadCount === 0}>
          Mark all read
        </Button>
      }
    >
      <div className={s.intro}>
        <p className={s.kicker}>Notifications</p>
        <div className={s.titleRow}>
          <h2 className={s.title}>Activity</h2>
          <span className={s.count} aria-live="polite">
            <motion.span key={unreadCount} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
              {q.data ? unreadCount : '–'}
            </motion.span>
            <small>{unreadCount === 1 ? 'new update' : 'new updates'}</small>
          </span>
        </div>
      </div>

      {q.status === 'success' && (q.data?.length ?? 0) > 0 && (
        <ChipRow label="Filter by type" className={s.chips}>
          <Chip selected={cat === 'all'} onClick={() => setCat('all')}>
            Everything
          </Chip>
          {CATS.filter((c) => q.data?.some((n) => n.category === c.value)).map((c) => (
            <Chip key={c.value} selected={cat === c.value} onClick={() => setCat(cat === c.value ? 'all' : c.value)} icon={<c.Icon aria-hidden />}>
              {c.label}
            </Chip>
          ))}
        </ChipRow>
      )}
      <StaleNote error={q.data ? q.error : undefined} />
      {q.status === 'loading' && (
        <div className="fj-gutter">
          <SkelList count={5} thumb={44} />
        </div>
      )}
      {q.status === 'error' && (
        <div className="fj-gutter">
          <ErrorState error={q.error} onRetry={q.refetch} />
        </div>
      )}
      {q.status === 'success' && list.length === 0 && (
        <div className="fj-gutter">
          <EmptyState
            animation="bell"
            title={cat === 'all' ? 'Nothing new yet' : 'Nothing of this type'}
            body={cat === 'all' ? 'Updates about orders, bookings, events and season records will appear here.' : 'Try another type.'}
            action={cat !== 'all' ? <Button onClick={() => setCat('all')}>Show everything</Button> : undefined}
          />
        </div>
      )}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={cat} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {groups.map((g) => {
            const gUnread = g.items.filter((n) => unread.includes(n.id)).length;
            return (
              <section key={g.label} aria-label={g.label} className={s.group}>
                <h3 className={s.groupHead}>
                  <span>{g.label}</span>
                  {gUnread > 0 && <span className={s.groupNew}>{gUnread} new</span>}
                </h3>
                <ol className={s.feed}>
                  {g.items.map((n, i) => {
                    const isUnread = unread.includes(n.id);
                    const Icon = ICON[n.category];
                    return (
                      <motion.li key={n.id} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
                        <button type="button" className={`${s.item} ${isUnread ? s.unread : ''}`} onClick={() => open(n)}>
                          <AnimatePresence initial={false}>{isUnread && <motion.span className={s.bar} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} exit={{ scaleY: 0 }} aria-hidden />}</AnimatePresence>
                          <span className={`${s.icon} ${s[`c_${n.category}`]}`} aria-hidden>
                            <Icon />
                          </span>
                          <span className={s.text}>
                            <span className={s.top}>
                              <span className={s.titleText}>
                                {isUnread && <span className="sr-only">New: </span>}
                                {n.title}
                              </span>
                              <span className={s.time}>{stamp(n.createdAt)}</span>
                            </span>
                            <span className={`${s.body} fj-clamp-2`}>{n.body}</span>
                            {n.link && (
                              <span className={s.cta}>
                                {CTA[n.category]} <ArrowUpRight aria-hidden />
                              </span>
                            )}
                          </span>
                        </button>
                      </motion.li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </Screen>
  );
}
