import { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { AlertTriangle, ArrowRight, MapPin, Minus, Plus } from 'lucide-react';
import type { QuantityUnit } from '@/types';
import { api } from '@/services/api';
import { invalidate, useMutation } from '@/services/query';
import { useStore } from '@/services/store';
import { FOM_PRICE_PER_KG, FOM_SHIPPING, formatQuantity, orderTotals } from '@/lib/pricing';
import { formatCurrency, formatNumber } from '@/lib/format';
import { validateQuantity } from '@/lib/validation';
import { Screen } from '../../layout/Screen';
import { Photo } from '../../photo/Photo';
import { Button } from '../../ui/Button';
import { TextArea, TextField } from '../../ui/Field';
import { Chip, Toggle } from '../../ui/Controls';
import { Sheet } from '../../ui/Sheet';
import { Note, Receipt } from '../../ui/Blocks';
import { useUI } from '../../providers';
import { useNav } from '../../nav';
import s from './Orders.module.css';

const QUICK: Record<QuantityUnit, number[]> = { kg: [100, 250, 500, 1000], MT: [1, 2, 5] };
const STEP: Record<QuantityUnit, number> = { kg: 50, MT: 0.5 };

function Rupees({ value }: { value: number }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => formatCurrency(Math.round(v)));
  useEffect(() => animate(mv, value, { duration: 0.45, ease: [0.16, 1, 0.3, 1] }).stop, [value, mv]);
  return <motion.span>{text}</motion.span>;
}

export default function NewOrder() {
  const nav = useNav();
  const { requireVerified } = useUI();
  const verified = useStore((st) => st.session.verified);
  const profile = useStore((st) => st.profile);
  const [unit, setUnit] = useState<QuantityUnit>('kg');
  const [qty, setQty] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [review, setReview] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const create = useMutation(api.createOrder);

  useEffect(() => {
    if (!verified) requireVerified('Ordering FOM needs a verified mobile number', () => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const n = Number(qty);
  const totals = orderTotals(Number.isFinite(n) ? n : 0, unit);
  const setValue = (v: string) => {
    setQty(v);
    if (touched) setError(validateQuantity(v, unit));
  };
  const bump = (d: number) => {
    const next = Math.max(0, Math.round(((Number.isFinite(n) ? n : 0) + d) * 100) / 100);
    setValue(next ? String(next) : '');
  };
  const validate = () => {
    const e = validateQuantity(qty, unit);
    setError(e);
    setTouched(true);
    return !e;
  };
  const openReview = () => {
    if (!verified) return requireVerified('Ordering FOM needs a verified mobile number', () => undefined);
    if (!validate()) return input.current?.focus();
    create.reset();
    setReview(true);
  };
  const place = async () => {
    const order = await create.mutate({ quantity: n, unit, deliveryInstructions: notes });
    if (order) {
      invalidate('orders');
      invalidate('notifications');
      setReview(false);
      nav(`/orders/fom/${order.id}/placed`, { replace: true, state: { order } });
    }
  };

  return (
    <Screen
      title="Order FOM"
      backTo="/orders"
      footer={
        <div className={s.footer}>
          <div className={s.footTotal}>
            <div className={s.footLabel}>Total to pay on delivery</div>
            <div className={s.footValue} aria-live="polite">
              <Rupees value={totals.total} />
            </div>
          </div>
          <Button size="lg" iconRight={<ArrowRight aria-hidden />} onClick={openReview}>
            Review
          </Button>
        </div>
      }
    >
      <div className={s.page}>
        <div className={s.product}>
          <Photo id="fom-product" ratio="1/1" reveal />
          <div>
            <p className={s.productKicker}>New order</p>
            <h2 className={s.productName}>FOM, fermented organic manure</h2>
            <p className={s.productSub}>
              {formatCurrency(FOM_PRICE_PER_KG)} per kg · {formatCurrency(FOM_SHIPPING)} delivery per order
            </p>
          </div>
        </div>

        <section className="fj-stack" style={{ ['--gap' as string]: '12px' }} aria-label="How much FOM">
          <div className={s.qtyHead}>
            <span className={s.qtyTitle}>How much do you need?</span>
            <Toggle
              label="Unit"
              value={unit}
              onChange={(u) => {
                setUnit(u);
                setQty('');
                setError(null);
                setTouched(false);
              }}
              options={[
                { value: 'kg', label: 'kg' },
                { value: 'MT', label: 'Tonnes' },
              ]}
            />
          </div>
          <div className={s.stepper}>
            <button type="button" className={s.stepBtn} onClick={() => bump(-STEP[unit])} disabled={!n} aria-label={`Less, by ${STEP[unit]} ${unit}`}>
              <Minus aria-hidden />
            </button>
            <TextField
              ref={input}
              big
              label="Quantity"
              inputMode={unit === 'kg' ? 'numeric' : 'decimal'}
              placeholder={unit === 'kg' ? '250' : '1.5'}
              value={qty}
              onChange={(e) => setValue(e.target.value.replace(unit === 'kg' ? /[^\d]/g : /[^\d.]/g, ''))}
              onBlur={() => qty && validate()}
              suffix={unit === 'kg' ? 'kg' : 'MT'}
              error={error}
              hint={unit === 'MT' ? '1 MT (tonne) = 1,000 kg' : 'Minimum 50 kg'}
            />
            <button type="button" className={s.stepBtn} onClick={() => bump(STEP[unit])} aria-label={`More, by ${STEP[unit]} ${unit}`}>
              <Plus aria-hidden />
            </button>
          </div>
          <div className={s.quick} role="group" aria-label="Common amounts">
            {QUICK[unit].map((v) => (
              <Chip
                key={v}
                selected={n === v}
                onClick={() => {
                  setQty(String(v));
                  setError(null);
                }}
              >
                {formatQuantity(v, unit)}
              </Chip>
            ))}
          </div>
        </section>

        <section className={s.receiptPanel} aria-label="Price">
          <p className={s.receiptKicker}>Live price</p>
          <Receipt
            night
            rows={[
              { label: 'Subtotal', value: formatCurrency(totals.subtotal), formula: totals.kg > 0 ? `${formatNumber(totals.kg)} kg × ${formatCurrency(FOM_PRICE_PER_KG)}` : undefined },
              { label: 'Delivery', value: formatCurrency(totals.shipping) },
              { label: 'Total', value: formatCurrency(totals.total), total: true },
            ]}
          />
        </section>

        <TextArea label="Delivery instructions" optional placeholder="Landmarks, gate timings, or a number the driver can call" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} />

        <Note icon={<MapPin aria-hidden />} title="Delivering to">
          {profile.village}, {profile.taluka}, {profile.district}, {profile.state} {profile.pincode}
        </Note>
      </div>

      <Sheet
        open={review}
        onClose={() => !create.pending && setReview(false)}
        kicker="Check before placing"
        title="Review your order"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReview(false)} disabled={create.pending}>
              Edit
            </Button>
            <Button onClick={place} loading={create.pending} data-autofocus>
              {create.pending ? 'Placing…' : `Place order · ${formatCurrency(totals.total)}`}
            </Button>
          </>
        }
      >
        <div className="fj-stack" style={{ ['--gap' as string]: '14px' }}>
          <Receipt
            rows={[
              { label: 'Product', value: 'FOM' },
              { label: 'Quantity', value: formatQuantity(n || 0, unit) },
              { label: 'Subtotal', value: formatCurrency(totals.subtotal), formula: `${formatNumber(totals.kg)} kg × ${formatCurrency(FOM_PRICE_PER_KG)}` },
              { label: 'Delivery', value: formatCurrency(totals.shipping) },
              { label: 'Total', value: formatCurrency(totals.total), total: true },
              ...(notes.trim() ? [{ label: 'Delivery instructions', value: notes.trim(), stacked: true }] : []),
            ]}
          />
          <p className="fj-small fj-c3">The team approves orders after checking stock. You’ll get a notification at each step.</p>
          {create.error && (
            <Note tone="danger" icon={<AlertTriangle aria-hidden />} title="Order not placed">
              {create.error.message} Nothing was charged or saved.
            </Note>
          )}
        </div>
      </Sheet>
    </Screen>
  );
}
