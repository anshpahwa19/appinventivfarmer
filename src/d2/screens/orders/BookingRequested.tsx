import { useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';
import type { Booking } from '@/types';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import { useStatusTone } from '@/lib/statusTone';
import { formatDate, formatTime } from '@/lib/format';
import { FjLottie } from '../../lottie/Lottie';
import { RevealText } from '../../motion/Reveal';
import { Button } from '../../ui/Button';
import { Note, Receipt } from '../../ui/Blocks';
import { useNav } from '../../nav';
import s from './Orders.module.css';

export default function BookingRequested() {
  const { id = '' } = useParams();
  const nav = useNav();
  useStatusTone('light');
  const passed = (useLocation().state as { booking?: Booking } | null)?.booking;
  const q = useQuery(`booking:${id}`, () => api.getBooking(id), { enabled: !passed });
  const b = passed ?? q.data;
  return (
    <div className={`${s.success}`}>
      <div className={s.successTop}>
        <FjLottie name="success" size={132} loop={false} night label="Booking requested" />
        <p className={s.successKicker}>Booking #{id}</p>
        <RevealText text="Request sent" className={s.successTitle} delay={0.4} />
        <motion.p className={s.successBody} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          We’ll notify you when the team approves it and assigns an operator.
        </motion.p>
      </div>
      <motion.div className={s.successBottom} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
        {b && (
          <Receipt
            rows={[
              { label: 'Status', value: 'Awaiting approval' },
              { label: 'Field', value: `${b.landName} · ${b.acres} acres` },
              { label: 'When', value: `${formatDate(b.date, 'weekday')}, ${formatTime(b.slot)}` },
            ]}
          />
        )}
        <Note tone="info" icon={<Smartphone aria-hidden />} title="Prototype">
          Saved on this phone only. No request was sent.
        </Note>
        <div className={s.successActions}>
          <Button size="lg" block onClick={() => nav(`/bookings/${id}`, { replace: true })}>
            View booking
          </Button>
          <Button variant="ghost" block onClick={() => nav('/home', { replace: true })}>
            Back to Today
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
