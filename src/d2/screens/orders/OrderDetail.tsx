import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Info, MessageSquareText, Phone, RefreshCw, Smartphone, Truck } from 'lucide-react';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import { KISANI_DIDI } from '@/data/people';
import { formatCurrency, formatDate, formatDateTime, formatNumber } from '@/lib/format';
import { formatQuantity, orderTotals } from '@/lib/pricing';
import { Screen } from '../../layout/Screen';
import { Button } from '../../ui/Button';
import { Avatar, ErrorState, Note, Receipt, Skel, StatusTag, Tracker, type TrackStep } from '../../ui/Blocks';
import { dispatchLabel } from '../../content/Cards';
import { orderMeta } from '../../content/meta';
import { KD_CONTACT, useUI } from '../../providers';
import s from './Orders.module.css';

export default function OrderDetail() {
  const { id = '' } = useParams();
  const { openContact } = useUI();
  const q = useQuery(`order:${id}`, () => api.getOrder(id));
  const o = q.data;

  return (
    <Screen title={o ? `Order #${o.id}` : 'Order'} backTo="/orders">
      {q.status === 'loading' && (
        <div className={s.page}>
          <Skel h={220} r="var(--r-xl)" />
          <Skel h={260} r="var(--r-xl)" />
        </div>
      )}
      {q.status === 'error' && (
        <div className={s.page}>
          <ErrorState error={q.error} onRetry={q.refetch} />
        </div>
      )}
      {o &&
        (() => {
          const meta = orderMeta(o.status);
          const t = orderTotals(o.quantity, o.unit, o.pricePerKg, o.shipping);
          const dispatched = !!o.dispatchDate && new Date(o.dispatchDate) < new Date();
          const steps: TrackStep[] = [
            { label: 'Placed', meta: formatDate(o.createdAt, 'short'), state: 'done' },
            o.status === 'pending' ? { label: 'Approval', meta: 'In review', state: 'current' } : o.status === 'approved' ? { label: 'Approved', meta: o.decidedAt ? formatDate(o.decidedAt, 'short') : undefined, state: 'done' } : { label: 'Rejected', meta: o.decidedAt ? formatDate(o.decidedAt, 'short') : undefined, state: 'failed' },
            ...(o.status !== 'rejected' ? [{ label: dispatched ? 'Dispatched' : 'Dispatch', meta: o.dispatchDate ? formatDate(o.dispatchDate, 'short') : 'Date set on approval', state: dispatched ? 'done' : 'upcoming' } as TrackStep] : []),
          ];
          return (
            <motion.div className={s.page} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <section className={s.statusHero} aria-label="Status">
                <div className={s.statusTop}>
                  <StatusTag tone={meta.tone} icon={meta.icon} size="lg" night>
                    {meta.label}
                  </StatusTag>
                  <span className={s.statusId}>#{o.id}</span>
                </div>
                <p className={s.bigQty}>
                  {formatQuantity(o.quantity, o.unit)}
                  <small>FOM</small>
                </p>
                <p className={s.explain}>{meta.explain}</p>
                <Tracker steps={steps} night />
              </section>

              {o.status === 'approved' && o.dispatchDate && (
                <Note tone="success" icon={<Truck aria-hidden />} title={dispatchLabel(o.dispatchDate)}>
                  Keep someone at the delivery spot on {formatDate(o.dispatchDate, 'long')}.
                </Note>
              )}
              {o.status === 'rejected' && (
                <Note tone="danger" title="Why it was rejected" action={<Button size="sm" icon={<RefreshCw aria-hidden />} to="/orders/fom/new">Place a new order</Button>}>
                  {o.rejectionReason ?? 'No reason was given. Your Kisani Didi can explain.'}
                </Note>
              )}
              {o.origin === 'device' && (
                <Note tone="info" icon={<Smartphone aria-hidden />} title="Prototype order">
                  Created in the prototype and saved on this phone only. It has not been sent to Kisani Urjaa.
                </Note>
              )}

              <section className={s.card}>
                <p className={s.cardKicker}>Receipt</p>
                <Receipt
                  rows={[
                    { label: 'Product', value: 'FOM, fermented organic manure', stacked: true },
                    { label: 'Quantity', value: `${formatQuantity(o.quantity, o.unit)}${o.unit === 'MT' ? ` (${formatNumber(t.kg)} kg)` : ''}` },
                    { label: 'Price', value: `${formatCurrency(o.pricePerKg)} / kg` },
                    { label: 'Subtotal', value: formatCurrency(t.subtotal), formula: `${formatNumber(t.kg)} kg × ${formatCurrency(o.pricePerKg)}` },
                    { label: 'Shipping', value: formatCurrency(t.shipping) },
                    { label: 'Total', value: formatCurrency(t.total), total: true, formula: `${formatCurrency(t.subtotal)} + ${formatCurrency(t.shipping)} shipping` },
                  ]}
                />
                <p className={s.meta}>Placed {formatDateTime(o.createdAt)}</p>
              </section>

              {o.deliveryInstructions && (
                <section className={s.card}>
                  <p className={s.cardKicker}>
                    <MessageSquareText aria-hidden /> Your delivery instructions
                  </p>
                  <p className={s.note}>{o.deliveryInstructions}</p>
                </section>
              )}
              {o.adminNote && (
                <Note tone="info" icon={<Info aria-hidden />} title="Note from Kisani Urjaa">
                  {o.adminNote}
                </Note>
              )}

              <section className={s.help}>
                <Avatar name={KISANI_DIDI.name} size={48} />
                <div className={s.helpText}>
                  <strong>Questions about this order?</strong>
                  {KISANI_DIDI.name}, your Kisani Didi, can help.
                </div>
                <Button size="sm" variant="tonal" icon={<Phone aria-hidden />} onClick={() => openContact({ ...KD_CONTACT, message: `Namaste, I have a question about my FOM order ${o.id}.` })}>
                  Contact
                </Button>
              </section>
            </motion.div>
          );
        })()}
    </Screen>
  );
}
