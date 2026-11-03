import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarRange, Phone, Plus } from 'lucide-react';
import type { BookingStatus, OrderStatus } from '@/types';
import { Screen } from '@/components/layout/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Chip, ChipRow } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { DateRangeSheet, rangeLabel, type DateRange } from '@/components/ui/DateRange';
import { SkeletonCards } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState, StaleBanner } from '@/components/ui/States';
import { BookingCard, OrderCard } from '@/components/content/Cards';
import { useUI, KD_CONTACT } from '@/app/providers';
import { api } from '@/services/api';
import { usePrime, useQuery } from '@/services/query';
import { useStore } from '@/services/store';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import s from './Orders.module.css';

type Tab = 'fom' | 'bookings';

const ORDER_FILTERS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];
const BOOKING_FILTERS: { value: BookingStatus; label: string }[] = [
  { value: 'pending', label: 'Awaiting approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

function inRange(iso: string, range: DateRange) {
  if (!range.from || !range.to) return true;
  const d = iso.slice(0, 10);
  return d >= range.from && d <= range.to;
}

export default function Orders() {
  const navigate = useNavigate();
  const { openContact } = useUI();
  const verified = useStore((st) => st.session.verified);
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get('tab') === 'bookings' ? 'bookings' : 'fom';
  const [status, setStatus] = useState<string | 'all'>('all');
  const [range, setRange] = useState<DateRange>({});
  const [dateOpen, setDateOpen] = useState(false);

  const orders = useQuery('orders:all', () => api.listOrders(), { enabled: verified });
  const bookings = useQuery('bookings:all', () => api.listBookings(), { enabled: verified });
  usePrime('order:', orders.data);
  usePrime('booking:', bookings.data);
  const active = tab === 'fom' ? orders : bookings;

  const counts = useMemo(() => {
    const list: { status: string }[] = (tab === 'fom' ? orders.data : bookings.data) ?? [];
    const c: Record<string, number> = {};
    list.forEach((x) => (c[x.status] = (c[x.status] ?? 0) + 1));
    return c;
  }, [tab, orders.data, bookings.data]);

  const visibleOrders = (orders.data ?? []).filter((o) => (status === 'all' || o.status === status) && inRange(o.createdAt, range));
  const visibleBookings = (bookings.data ?? []).filter((b) => (status === 'all' || b.status === status) && inRange(b.date, range));
  const filtered = status !== 'all' || !!range.from;
  const count = tab === 'fom' ? visibleOrders.length : visibleBookings.length;
  const newPath = tab === 'fom' ? '/orders/fom/new' : '/bookings/new';
  const newLabel = tab === 'fom' ? 'New order' : 'New booking';

  const clear = () => {
    setStatus('all');
    setRange({});
  };

  if (!verified) {
    return (
      <Screen title="Orders" subtitle="FOM and field services" largeTitle tabRoot>
        <div className={s.locked}>
          <EmptyState
            animation="emptyBox"
            title="Verify your number to order"
            body="Ordering FOM and booking field services need a verified mobile number. It takes a minute with an OTP."
            action={
              <>
                <Button onClick={() => navigate('/account/verify')}>Verify now</Button>
                <Button variant="secondary" icon={<Phone aria-hidden />} onClick={() => openContact(KD_CONTACT)}>
                  Ask Kisani Didi
                </Button>
              </>
            }
          />
        </div>
      </Screen>
    );
  }

  return (
    <Screen
      title="Orders"
      subtitle="FOM and field services"
      largeTitle
      band
      tabRoot
      scrollKey={`/orders?${tab}`}
      largeActions={
        <Button size="sm" icon={<Plus aria-hidden />} to={newPath}>
          {newLabel}
        </Button>
      }
    >
      <div className={s.tabs}>
        <SegmentedControl
          label="Order type"
          value={tab}
          onChange={(v) => {
            setParams(v === 'bookings' ? { tab: 'bookings' } : {}, { replace: true });
            clear();
          }}
          segments={[
            { value: 'fom', label: 'FOM orders', count: orders.data?.length },
            { value: 'bookings', label: 'Bookings', count: bookings.data?.length },
          ]}
        />
      </div>

      <div className={s.filters}>
        <ChipRow label="Filter orders">
          <Chip selected={!!range.from} icon={<CalendarRange aria-hidden />} onClick={() => setDateOpen(true)}>
            {rangeLabel(range) ?? 'Any date'}
          </Chip>
          <Chip selected={status === 'all'} onClick={() => setStatus('all')}>
            All
          </Chip>
          {(tab === 'fom' ? ORDER_FILTERS : BOOKING_FILTERS).map((f) => (
            <Chip key={f.value} selected={status === f.value} onClick={() => setStatus(status === f.value ? 'all' : f.value)} count={counts[f.value] ?? 0}>
              {f.label}
            </Chip>
          ))}
        </ChipRow>
      </div>

      {filtered && active.status === 'success' && (
        <div className={s.summary} aria-live="polite">
          <span>
            {count} {count === 1 ? 'result' : 'results'}
            {rangeLabel(range) ? ` · ${rangeLabel(range)}` : ''}
          </span>
          <button type="button" onClick={clear}>
            Clear filters
          </button>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <StaleBanner error={active.data ? active.error : undefined} />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={`${tab}-${status}-${range.from ?? ''}`} className={s.list} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {active.status === 'loading' && <SkeletonCards count={3} h={150} />}
          {active.status === 'error' && <ErrorState error={active.error} onRetry={active.refetch} />}
          {active.status === 'success' && count === 0 && (
            <EmptyState
              animation={tab === 'fom' ? 'emptyBox' : 'calendar'}
              title={filtered ? 'Nothing matches these filters' : tab === 'fom' ? 'No FOM orders yet' : 'No bookings yet'}
              body={filtered ? 'Try another status or date range.' : tab === 'fom' ? 'Order organic manure for your fields. You’ll see every step here.' : 'Book a field service and follow its approval here.'}
              action={filtered ? <Button onClick={clear}>Clear filters</Button> : <Button icon={<Plus aria-hidden />} to={newPath}>{newLabel}</Button>}
            />
          )}
          {active.status === 'success' && count > 0 && (
            <Stagger className="stack" style={{ ['--gap' as string]: 'var(--space-stack)' }}>
              {tab === 'fom'
                ? visibleOrders.map((o) => (
                    <StaggerItem key={o.id}>
                      <OrderCard order={o} />
                    </StaggerItem>
                  ))
                : visibleBookings.map((b) => (
                    <StaggerItem key={b.id}>
                      <BookingCard booking={b} />
                    </StaggerItem>
                  ))}
            </Stagger>
          )}
        </motion.div>
      </AnimatePresence>

      <DateRangeSheet open={dateOpen} onClose={() => setDateOpen(false)} value={range} onApply={setRange} title={tab === 'fom' ? 'Orders placed between' : 'Bookings dated between'} allowFuture={tab === 'bookings'} />
    </Screen>
  );
}
