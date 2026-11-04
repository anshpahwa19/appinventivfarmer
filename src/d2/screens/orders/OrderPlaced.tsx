import { useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';
import type { FomOrder } from '@/types';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import { useStatusTone } from '@/lib/statusTone';
import { formatCurrency } from '@/lib/format';
import { formatQuantity, orderTotals } from '@/lib/pricing';
import { FjLottie } from '../../lottie/Lottie';
import { RevealText } from '../../motion/Reveal';
import { Button } from '../../ui/Button';
import { Note, Receipt, Tracker } from '../../ui/Blocks';
import { useNav } from '../../nav';
import s from './Orders.module.css';

export default function OrderPlaced() {
  const { id = '' } = useParams();
  const nav = useNav();
  useStatusTone('light');
  const passed = (useLocation().state as { order?: FomOrder } | null)?.order;
  const q = useQuery(`order:${id}`, () => api.getOrder(id), { enabled: !passed });
  const o = passed ?? q.data;
  return (
    <div className={`${s.success}`}>
      <div className={s.successTop}>
        <FjLottie name="success" size={132} loop={false} night label="Order placed" />
        <p className={s.successKicker}>Order {o?.id ?? id}</p>
        <RevealText text="Order placed" className={s.successTitle} delay={0.4} />
        <motion.p className={s.successBody} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          {o ? `${formatQuantity(o.quantity, o.unit)} of FOM is waiting for approval. We’ll notify you at each step.` : 'Your order is waiting for approval.'}
        </motion.p>
      </div>
      <motion.div className={s.successBottom} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
        <Tracker
          steps={[
            { label: 'Placed', meta: 'Just now', state: 'done' },
            { label: 'Approval', meta: 'Next', state: 'current' },
            { label: 'Dispatch', meta: 'Date set on approval', state: 'upcoming' },
          ]}
        />
        {o && (
          <Receipt
            rows={[
              { label: 'Order', value: o.id },
              { label: 'Quantity', value: formatQuantity(o.quantity, o.unit) },
              { label: 'Total', value: formatCurrency(orderTotals(o.quantity, o.unit, o.pricePerKg, o.shipping).total), total: true },
            ]}
          />
        )}
        <Note tone="info" icon={<Smartphone aria-hidden />} title="Prototype">
          Saved on this phone only. No order was sent and nothing was charged.
        </Note>
        <div className={s.successActions}>
          <Button size="lg" block onClick={() => nav(`/orders/fom/${id}`, { replace: true })}>
            Track this order
          </Button>
          <Button variant="ghost" block onClick={() => nav('/home', { replace: true })}>
            Back to Today
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
