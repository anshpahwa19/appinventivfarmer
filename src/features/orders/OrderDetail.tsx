import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Info, MessageSquareText, Phone, RefreshCw, Smartphone, Truck } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { Callout, DetailGrid, Timeline, type TimelineItem } from '@/components/ui/Blocks';
import { StatusBadge, Avatar } from '@/components/ui/Misc';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/States';
import { orderStatus } from '@/components/content/status';
import { dispatchLabel } from '@/components/content/Cards';
import { useUI, KD_CONTACT } from '@/app/providers';
import { KISANI_DIDI } from '@/data/people';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import { formatCurrency, formatDate, formatDateTime, formatNumber } from '@/lib/format';
import { formatQuantity, orderTotals } from '@/lib/pricing';
import s from './Orders.module.css';

export default function OrderDetail() {
  const { id = '' } = useParams();
  const { openContact } = useUI();
  const q = useQuery(`order:${id}`, () => api.getOrder(id));
  const o = q.data;

  return (
    <Screen title={o ? `Order #${o.id}` : 'Order'} back backTo="/orders">
      {q.status === 'loading' && (
        <div className={s.page}>
          <Skeleton h={150} r={28} />
          <Skeleton h={200} r={28} />
          <Skeleton h={260} r={28} />
        </div>
      )}
      {q.status === 'error' && (
        <div className={s.page}>
          <ErrorState error={q.error} onRetry={q.refetch} />
        </div>
      )}
      {o &&
        (() => {
          const meta = orderStatus(o.status);
          const t = orderTotals(o.quantity, o.unit, o.pricePerKg, o.shipping);
          const timeline: TimelineItem[] = [
            { title: 'Order placed', meta: formatDateTime(o.createdAt), state: 'done' },
            o.status === 'pending'
              ? { title: 'Waiting for approval', meta: 'The team checks stock and delivery route', state: 'current' }
              : o.status === 'approved'
                ? { title: 'Approved', meta: o.decidedAt ? formatDateTime(o.decidedAt) : undefined, state: 'done' }
                : { title: 'Rejected', meta: o.decidedAt ? formatDateTime(o.decidedAt) : undefined, state: 'failed' },
          ];
          if (o.status !== 'rejected') timeline.push({ title: o.dispatchDate ? dispatchLabel(o.dispatchDate) : 'Dispatch date', meta: o.dispatchDate ? formatDate(o.dispatchDate, 'long') : 'Set when the order is approved', state: o.dispatchDate && new Date(o.dispatchDate) < new Date() ? 'done' : 'upcoming' });
          return (
            <motion.div className={s.page} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
              <section className={s.statusCard} aria-label="Status">
                <StatusBadge tone={meta.tone} icon={meta.icon} size="lg">
                  {meta.label}
                </StatusBadge>
                <div className={s.big}>
                  {formatQuantity(o.quantity, o.unit)} <span style={{ color: 'var(--fg-3)', fontWeight: 600 }}>FOM</span>
                </div>
                <p className={s.statusText}>{meta.explain}</p>
                {o.status === 'approved' && o.dispatchDate && (
                  <Callout tone="success" icon={<Truck aria-hidden />} title={dispatchLabel(o.dispatchDate)}>
                    Keep someone at the delivery spot on {formatDate(o.dispatchDate, 'long')}.
                  </Callout>
                )}
                {o.status === 'rejected' && o.rejectionReason && (
                  <Callout tone="danger" title="Reason">
                    {o.rejectionReason}
                  </Callout>
                )}
                {o.status === 'rejected' && (
                  <Button variant="primary" icon={<RefreshCw aria-hidden />} to="/orders/fom/new">
                    Place a new order
                  </Button>
                )}
              </section>

              {o.origin === 'device' && (
                <Callout tone="info" icon={<Smartphone aria-hidden />} title="Prototype order">
                  This order was created in the prototype and is saved on this phone only. It has not been sent to Kisani Urjaa.
                </Callout>
              )}

              <section className={s.card}>
                <h2 className={s.cardTitle}>Progress</h2>
                <Timeline items={timeline} />
              </section>

              <section className={s.card}>
                <h2 className={s.cardTitle}>Order summary</h2>
                <DetailGrid
                  items={[
                    { label: 'Product', value: 'FOM (fermented organic manure)', full: true },
                    { label: 'Quantity', value: `${formatQuantity(o.quantity, o.unit)}${o.unit === 'MT' ? ` (${formatNumber(t.kg)} kg)` : ''}` },
                    { label: 'Price', value: `${formatCurrency(o.pricePerKg)} per kg` },
                    { label: 'Subtotal', value: formatCurrency(t.subtotal), formula: `${formatNumber(t.kg)} kg × ${formatCurrency(o.pricePerKg)}` },
                    { label: 'Shipping', value: formatCurrency(t.shipping) },
                    { label: 'Total', value: formatCurrency(t.total), total: true, formula: `${formatCurrency(t.subtotal)} + ${formatCurrency(t.shipping)} shipping` },
                  ]}
                />
                <p style={{ marginTop: 10, font: 'var(--t-caption)', color: 'var(--fg-3)' }}>Order ID {o.id} · placed {formatDate(o.createdAt)}</p>
              </section>

              {o.deliveryInstructions && (
                <section className={s.card}>
                  <h2 className={s.cardTitle}>
                    <MessageSquareText aria-hidden style={{ width: 14, height: 14 }} />
                    Your delivery instructions
                  </h2>
                  <p className={s.note}>{o.deliveryInstructions}</p>
                </section>
              )}

              {o.adminNote && (
                <Callout tone="info" icon={<Info aria-hidden />} title="Note from Kisani Urjaa">
                  {o.adminNote}
                </Callout>
              )}

              <section className={`${s.card} ${s.help}`}>
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
