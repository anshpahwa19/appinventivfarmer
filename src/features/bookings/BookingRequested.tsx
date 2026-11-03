import { useStatusTone } from '@/lib/statusTone';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { Booking } from '@/types';
import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';
import { Lottie } from '@/components/media/Lottie';
import { Button } from '@/components/ui/Button';
import { Callout, DetailGrid } from '@/components/ui/Blocks';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import { formatDate, formatTime } from '@/lib/format';
import s from '../orders/Orders.module.css';

export default function BookingRequested() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  useStatusTone('dark');
  const passed = (useLocation().state as { booking?: Booking } | null)?.booking;
  const q = useQuery(`booking:${id}`, () => api.getBooking(id), { enabled: !passed });
  const b = passed ?? q.data;
  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: 'var(--bg)' }}>
      <div className={s.success}>
        <Lottie name="success" size={170} loop={false} label="Booking requested" />
        <motion.h1 className={s.successTitle} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          Booking requested
        </motion.h1>
        <motion.p className={s.successBody} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          We’ll notify you when the team approves it and assigns an operator.
        </motion.p>
        {b && (
          <motion.div className={s.receipt} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <DetailGrid
              items={[
                { label: 'Booking', value: `#${b.id}` },
                { label: 'Status', value: 'Awaiting approval' },
                { label: 'Field', value: `${b.landName} · ${b.acres} acres`, full: true },
                { label: 'When', value: `${formatDate(b.date, 'long')}, ${formatTime(b.slot)}`, full: true },
              ]}
            />
            <div style={{ marginTop: 12 }}>
              <Callout tone="info" icon={<Smartphone aria-hidden />} title="Prototype">
                Saved on this phone only. No request was sent.
              </Callout>
            </div>
          </motion.div>
        )}
        <div className={s.successActions}>
          <Button size="lg" block onClick={() => navigate(`/bookings/${id}`, { replace: true })}>
            View booking
          </Button>
          <Button variant="ghost" block onClick={() => navigate('/home', { replace: true })}>
            Back to home
          </Button>
        </div>
      </div>
    </div>
  );
}
