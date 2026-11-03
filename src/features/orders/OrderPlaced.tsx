import { useStatusTone } from '@/lib/statusTone';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { FomOrder } from '@/types';
import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';
import { Lottie } from '@/components/media/Lottie';
import { Button } from '@/components/ui/Button';
import { Callout, DetailGrid } from '@/components/ui/Blocks';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import { formatCurrency } from '@/lib/format';
import { formatQuantity, orderTotals } from '@/lib/pricing';
import s from './Orders.module.css';

export default function OrderPlaced() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  useStatusTone('dark');
  const passed = (useLocation().state as { order?: FomOrder } | null)?.order;
  const q = useQuery(`order:${id}`, () => api.getOrder(id), { enabled: !passed });
  const o = passed ?? q.data;
  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: 'var(--bg)' }}>
      <div className={s.success}>
        <Lottie name="success" size={170} loop={false} label="Order placed" />
        <motion.h1 className={s.successTitle} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          Order placed
        </motion.h1>
        <motion.p className={s.successBody} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          {o ? `Order ${o.id} for ${formatQuantity(o.quantity, o.unit)} is waiting for approval. We’ll notify you when it’s approved.` : 'Your order is waiting for approval.'}
        </motion.p>
        {o && (
          <motion.div className={s.receipt} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <DetailGrid
              items={[
                { label: 'Order ID', value: o.id },
                { label: 'Status', value: 'Pending approval' },
                { label: 'Total', value: formatCurrency(orderTotals(o.quantity, o.unit, o.pricePerKg, o.shipping).total), total: true },
              ]}
            />
            <div style={{ marginTop: 12 }}>
              <Callout tone="info" icon={<Smartphone aria-hidden />} title="Prototype">
                Saved on this phone only. No order was sent and nothing was charged.
              </Callout>
            </div>
          </motion.div>
        )}
        <div className={s.successActions}>
          <Button size="lg" block onClick={() => navigate(`/orders/fom/${id}`, { replace: true })}>
            View order
          </Button>
          <Button variant="ghost" block onClick={() => navigate('/home', { replace: true })}>
            Back to home
          </Button>
        </div>
      </div>
    </div>
  );
}
