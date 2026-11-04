import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, RefreshCw, Smartphone, UserRound } from 'lucide-react';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import { KISANI_DIDI } from '@/data/people';
import { formatDate, formatDayDistance, formatPhone, formatTime } from '@/lib/format';
import { Screen } from '../../layout/Screen';
import { Button } from '../../ui/Button';
import { Avatar, ErrorState, Note, Receipt, Skel, StatusTag, Tracker, type TrackStep } from '../../ui/Blocks';
import { bookingMeta } from '../../content/meta';
import { KD_CONTACT, useUI } from '../../providers';
import s from './Orders.module.css';

export default function BookingDetail() {
  const { id = '' } = useParams();
  const { openContact } = useUI();
  const q = useQuery(`booking:${id}`, () => api.getBooking(id));
  const b = q.data;
  return (
    <Screen title={b ? `Booking #${b.id}` : 'Booking'} backTo="/orders?tab=bookings">
      {q.status === 'loading' && (
        <div className={s.page}>
          <Skel h={220} r="var(--r-xl)" />
          <Skel h={220} r="var(--r-xl)" />
        </div>
      )}
      {q.status === 'error' && (
        <div className={s.page}>
          <ErrorState error={q.error} onRetry={q.refetch} />
        </div>
      )}
      {b &&
        (() => {
          const meta = bookingMeta(b.status);
          const steps: TrackStep[] = [
            { label: 'Requested', meta: formatDate(b.createdAt, 'short'), state: 'done' },
            b.status === 'pending' ? { label: 'Approval', meta: 'In review', state: 'current' } : b.status === 'approved' ? { label: 'Approved', meta: b.operator?.name, state: 'done' } : { label: 'Rejected', meta: b.decidedAt ? formatDate(b.decidedAt, 'short') : undefined, state: 'failed' },
            ...(b.status !== 'rejected' ? [{ label: 'Field visit', meta: formatDate(b.date, 'short'), state: 'upcoming' } as TrackStep] : []),
          ];
          return (
            <motion.div className={s.page} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <section className={s.statusHero}>
                <div className={s.statusTop}>
                  <StatusTag tone={meta.tone} icon={meta.icon} size="lg">
                    {meta.label}
                  </StatusTag>
                  <span className={s.statusId}>#{b.id}</span>
                </div>
                <p className={s.bigTitle}>
                  {b.crop} · {b.acres} acres
                </p>
                <p className={s.explain}>
                  {b.landName} · {formatDate(b.date, 'weekday')}, {formatTime(b.slot)}
                </p>
                <Tracker steps={steps} />
              </section>

              {b.status === 'rejected' && (
                <Note tone="danger" title="Why it was rejected" action={<Button size="sm" icon={<RefreshCw aria-hidden />} to="/bookings/new">Book another date</Button>}>
                  {b.rejectionReason ?? 'No reason was given. Your Kisani Didi can explain.'}
                </Note>
              )}
              {b.origin === 'device' && (
                <Note tone="info" icon={<Smartphone aria-hidden />} title="Prototype booking">
                  Created in the prototype and saved on this phone only. It has not been sent.
                </Note>
              )}
              {b.status === 'approved' && b.operator && (
                <section className={s.help}>
                  <Avatar name={b.operator.name} size={48} />
                  <div className={s.helpText}>
                    <strong>{b.operator.name}</strong>
                    Machine operator · {formatPhone(b.operator.phone)}
                  </div>
                  <Button size="sm" variant="tonal" icon={<Phone aria-hidden />} onClick={() => openContact({ name: b.operator!.name, role: 'Machine operator', phone: b.operator!.phone })}>
                    Call
                  </Button>
                </section>
              )}

              <section className={s.card}>
                <p className={s.cardKicker}>Details</p>
                <Receipt
                  rows={[
                    { label: 'Field', value: b.landName },
                    { label: 'Crop', value: b.crop },
                    { label: 'Area', value: `${b.acres} acres` },
                    { label: 'Date', value: `${formatDate(b.date, 'long')}`, formula: formatDayDistance(b.date) },
                    { label: 'Time', value: formatTime(b.slot) },
                    ...(b.notes ? [{ label: 'Notes', value: b.notes, stacked: true }] : []),
                  ]}
                />
              </section>

              {b.requestedBy.role === 'Farm manager' && (
                <Note icon={<UserRound aria-hidden />} title="Requested on your behalf">
                  {b.requestedBy.name}, your farm manager, made this request.
                </Note>
              )}

              <section className={s.help}>
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
