import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { AlertTriangle, ArrowRight, MapPin } from 'lucide-react';
import type { QuantityUnit } from '@/types';
import { Screen } from '@/components/layout/Screen';
import { Scene } from '@/components/media/Scene';
import { Button } from '@/components/ui/Button';
import { TextField, TextArea } from '@/components/ui/TextField';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Chip } from '@/components/ui/Chip';
import { Sheet } from '@/components/ui/Sheet';
import { Callout, DetailGrid } from '@/components/ui/Blocks';
import { useUI } from '@/app/providers';
import { api } from '@/services/api';
import { invalidate, useMutation } from '@/services/query';
import { useStore } from '@/services/store';
import { FOM_PRICE_PER_KG, FOM_SHIPPING, formatQuantity, orderTotals } from '@/lib/pricing';
import { formatCurrency, formatNumber } from '@/lib/format';
import { validateQuantity } from '@/lib/validation';
import s from './Orders.module.css';

const QUICK: Record<QuantityUnit, number[]> = { kg: [100, 250, 500, 1000], MT: [1, 2, 5] };

function AnimatedRupees({ value }: { value: number }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => formatCurrency(Math.round(v)));
  useEffect(() => {
    const c = animate(mv, value, { duration: 0.35, ease: [0.22, 1, 0.36, 1] });
    return c.stop;
  }, [value, mv]);
  return <motion.span>{text}</motion.span>;
}

export default function NewOrder() {
  const navigate = useNavigate();
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

  const validate = () => {
    const err = validateQuantity(qty, unit);
    setError(err);
    setTouched(true);
    return !err;
  };

  const openReview = () => {
    if (!verified) return requireVerified('Ordering FOM needs a verified mobile number', () => undefined);
    if (!validate()) {
      input.current?.focus();
      return;
    }
    create.reset();
    setReview(true);
  };

  const place = async () => {
    const order = await create.mutate({ quantity: n, unit, deliveryInstructions: notes });
    if (order) {
      invalidate('orders');
      invalidate('notifications');
      setReview(false);
      navigate(`/orders/fom/${order.id}/placed`, { replace: true, state: { order } });
    }
  };

  return (
    <Screen
      title="Order FOM"
      back
      backTo="/orders"
      footer={
        <div className={s.footerRow}>
          <div className={s.footerTotal}>
            <div className={s.footerLabel}>Total to pay</div>
            <div className={s.footerValue} aria-live="polite">
              <AnimatedRupees value={totals.total} />
            </div>
          </div>
          <Button size="lg" iconRight={<ArrowRight aria-hidden />} onClick={openReview}>
            Review order
          </Button>
        </div>
      }
    >
      <div className={s.page}>
        <div className={s.product}>
          <div className={s.productImg}>
            <Scene scene={{ kind: 'soil', seed: 12, time: 'golden' }} aspect="square" style={{ position: 'absolute', inset: 0 }} />
          </div>
          <div>
            <div className={s.productName}>FOM · fermented organic manure</div>
            <div className={s.productSub}>
              {formatCurrency(FOM_PRICE_PER_KG)} per kg · {formatCurrency(FOM_SHIPPING)} shipping per order
            </div>
          </div>
        </div>

        <div className="stack" style={{ ['--gap' as string]: '12px' }}>
          <div className={s.qtyHead}>
            <span className={s.qtyTitle}>How much FOM do you need?</span>
            <SegmentedControl
              label="Unit"
              value={unit}
              onChange={(u) => {
                setUnit(u);
                setQty('');
                setError(null);
                setTouched(false);
              }}
              segments={[
                { value: 'kg', label: 'kg' },
                { value: 'MT', label: 'Tonnes' },
              ]}
            />
          </div>
          <TextField
            ref={input}
            label="Quantity"
            inputMode={unit === 'kg' ? 'numeric' : 'decimal'}
            placeholder={unit === 'kg' ? 'e.g. 250' : 'e.g. 1.5'}
            value={qty}
            onChange={(e) => {
              const v = e.target.value.replace(unit === 'kg' ? /[^\d]/g : /[^\d.]/g, '');
              setQty(v);
              if (touched) setError(validateQuantity(v, unit));
            }}
            onBlur={() => qty && validate()}
            suffix={unit === 'kg' ? 'kg' : 'MT'}
            error={error}
            hint={unit === 'MT' ? '1 MT (metric tonne) = 1,000 kg' : 'Minimum 50 kg'}
          />
          <div className={s.quick} role="group" aria-label="Quick quantities">
            {QUICK[unit].map((v) => (
              <Chip
                key={v}
                selected={Number(qty) === v}
                onClick={() => {
                  setQty(String(v));
                  setError(null);
                }}
              >
                {formatQuantity(v, unit)}
              </Chip>
            ))}
          </div>
        </div>

        <div className={s.price} aria-label="Price breakdown">
          <div className={s.priceRow}>
            <span>
              Subtotal
              {totals.kg > 0 && <span className={s.priceFormula}> · {formatNumber(totals.kg)} kg × {formatCurrency(FOM_PRICE_PER_KG)}</span>}
            </span>
            <strong>{formatCurrency(totals.subtotal)}</strong>
          </div>
          <div className={s.priceRow}>
            <span>Shipping</span>
            <strong>{formatCurrency(totals.kg > 0 ? FOM_SHIPPING : 0)}</strong>
          </div>
          <div className={`${s.priceRow} ${s.priceTotal}`}>
            <span>Total</span>
            <span>{formatCurrency(totals.total)}</span>
          </div>
        </div>

        <TextArea
          label="Delivery instructions"
          optional
          placeholder="Landmarks, gate timings or a number the driver can call"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
        />

        <Callout tone="neutral" icon={<MapPin aria-hidden />} title="Delivering to">
          {profile.village}, {profile.taluka}, {profile.district}, {profile.state} {profile.pincode}
        </Callout>
      </div>

      <Sheet
        open={review}
        onClose={() => !create.pending && setReview(false)}
        title="Review your order"
        description="Check the details before placing the order."
        footer={
          <>
            <Button variant="secondary" onClick={() => setReview(false)} disabled={create.pending}>
              Edit
            </Button>
            <Button onClick={place} loading={create.pending} data-autofocus>
              {create.pending ? 'Placing order…' : `Place order · ${formatCurrency(totals.total)}`}
            </Button>
          </>
        }
      >
        <div className={s.reviewList}>
          <DetailGrid
            items={[
              { label: 'Product', value: 'FOM', full: false },
              { label: 'Quantity', value: formatQuantity(n || 0, unit) },
              { label: 'Subtotal', value: formatCurrency(totals.subtotal), formula: `${formatNumber(totals.kg)} kg × ${formatCurrency(FOM_PRICE_PER_KG)}` },
              { label: 'Shipping', value: formatCurrency(totals.shipping) },
              { label: 'Total', value: formatCurrency(totals.total), total: true },
              ...(notes.trim() ? [{ label: 'Delivery instructions', value: notes.trim(), full: true }] : []),
            ]}
          />
          <p style={{ font: 'var(--t-caption)', color: 'var(--fg-3)' }}>The team approves orders after checking stock. You’ll get a notification at each step.</p>
          {create.error && (
            <Callout tone="danger" icon={<AlertTriangle aria-hidden />} title="Order not placed">
              {create.error.message} Nothing was charged or saved.
            </Callout>
          )}
        </div>
      </Sheet>
    </Screen>
  );
}
