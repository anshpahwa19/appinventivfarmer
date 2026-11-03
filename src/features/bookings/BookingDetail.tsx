import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarClock, Phone, RefreshCw, Smartphone, UserRound } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { Callout, DetailGrid, Timeline, type TimelineItem } from '@/components/ui/Blocks';
import { Avatar, StatusBadge } from '@/components/ui/Misc';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/States';
import { bookingStatus } from '@/components/content/status';
import { useUI, KD_CONTACT } from '@/app/providers';
import { KISANI_DIDI } from '@/data/people';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import { formatDate, formatDateTime, formatDayDistance, formatPhone, formatTime } from '@/lib/format';
import s from '../orders/Orders.module.css';

export default function BookingDetail() {
  const { id = '' } = useParams();
  const { openContact } = useUI();
  const q = useQuery(`booking:${id}`, () => api.getBooking(id));
  const b = q.data;

  return (
    <Screen title={b ? `Booking #${b.id}` : 'Booking'} back backTo="/orders?tab=bookings">
      {q.status === 'loading' && (
        <div className={s.page}>
          <Skeleton h={160} r={28} />
          <Skeleton h={220} r={28} />
        </div>
      )}
      {q.status === 'error' && (
        <div className={s.page}>
          <ErrorState error={q.error} onRetry={q.refetch} />
        </div>
      )}
      {b &&
        (() => {
          const meta = bookingStatus(b.status);
          const timeline: TimelineItem[] = [
            { title: b.requestedBy.role === 'You' ? 'You requested this booking' : `Requested by ${b.requestedBy.name} (farm manager)`, meta: formatDateTime(b.createdAt), state: 'done' },
            b.status === 'pending'
              ? { title: 'Waiting for approval', meta: 'You’ll be notified when an operator is assigned', state: 'current' }
              : b.status === 'approved'
                ? { title: `Approved · operator ${b.operator?.name ?? 'assigned'}`, meta: b.decidedAt ? formatDateTime(b.decidedAt) : undefined, state: 'done' }
                : { title: 'Rejected', meta: b.decidedAt ? formatDateTime(b.decidedAt) : undefined, state: 'failed' },
          ];
          if (b.status !== 'rejected') timeline.push({ title: 'Field visit', meta: `${formatDate(b.date, 'long')}, ${formatTime(b.slot)}`, state: 'upcoming' });
          return (
            <motion.div className={s.page} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
              <section className={s.statusCard}>
                <StatusBadge tone={meta.tone} icon={meta.icon} size="lg">
                  {meta.label}
                </StatusBadge>
                <div className={s.big}>
                  {b.crop} · {b.acres} acres
                </div>
                <div className={s.bigSub}>{b.landName}</div>
                <p className={s.statusText}>{meta.explain}</p>
                {b.status === 'rejected' && b.rejectionReason && (
                  <Callout tone="danger" title="Reason">
                    {b.rejectionReason}
                  </Callout>
                )}
                {b.status === 'rejected' && (
                  <Button icon={<RefreshCw aria-hidden />} to="/bookings/new">
                    Book another date
                  </Button>
                )}
              </section>

              {b.origin === 'device' && (
                <Callout tone="info" icon={<Smartphone aria-hidden />} title="Prototype booking">
                  Created in the prototype and saved on this phone only. It has not been sent.
                </Callout>
              )}

              {b.status === 'approved' && b.operator && (
                <section className={`${s.card} ${s.help}`}>
                  <Avatar name={b.operator.name} size={48} />
                  <div className={s.helpText}>
                    <strong>{b.operator.name}</strong>
                    Operator · {formatPhone(b.operator.phone)}
                  </div>
                  <Button size="sm" variant="tonal" icon={<Phone aria-hidden />} onClick={() => openContact({ name: b.operator!.name, role: 'Machine operator', phone: b.operator!.phone })}>
                    Call
                  </Button>
                </section>
              )}

              <section className={s.card}>
                <h2 className={s.cardTitle}>Details</h2>
                <DetailGrid
                  items={[
                    { label: 'Field', value: b.landName },
                    { label: 'Crop', value: b.crop },
                    { label: 'Area', value: `${b.acres} acres` },
                    { label: 'Time', value: formatTime(b.slot) },
                    { label: 'Date', value: `${formatDate(b.date, 'long')} (${formatDayDistance(b.date).toLowerCase()})`, full: true },
                    ...(b.notes ? [{ label: 'Notes', value: b.notes, full: true }] : []),
                  ]}
                />
              </section>

              <section className={s.card}>
                <h2 className={s.cardTitle}>
                  <CalendarClock aria-hidden style={{ width: 14, height: 14 }} />
                  Progress
                </h2>
                <Timeline items={timeline} />
              </section>

              {b.requestedBy.role === 'Farm manager' && (
                <Callout tone="neutral" icon={<UserRound aria-hidden />} title="Requested on your behalf">
                  {b.requestedBy.name}, your farm manager, made this request.
                </Callout>
              )}

              <section className={`${s.card} ${s.help}`}>
                <Avatar name={KISANI_DIDI.name} size={48} />
                <div className={s.helpText}>
                  <strong>Need to change the date?</strong>
                  Ask {KISANI_DIDI.name.split(' ')[0]}, your Kisani Didi.
                </div>
                <Button size="sm" variant="tonal" icon={<Phone aria-hidden />} onClick={() => openContact({ ...KD_CONTACT, message: `Namaste, I want to change booking #${b.id}.` })}>
                  Contact
                </Button>
              </section>
            </motion.div>
          );
        })()}
    </Screen>
  );
}
