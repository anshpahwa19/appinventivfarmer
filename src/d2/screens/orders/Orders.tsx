import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarRange, Phone, Plus } from 'lucide-react';
import { api } from '@/services/api';
import { usePrime, useQuery } from '@/services/query';
import { useStore } from '@/services/store';
import { Screen } from '../../layout/Screen';
import { SectionTabs, Chip, ChipRow } from '../../ui/Controls';
import { Button } from '../../ui/Button';
import { DateRangeSheet, rangeLabel, type DateRange } from '../../ui/DateRange';
import { EmptyState, ErrorState, Skel, StaleNote } from '../../ui/Blocks';
import { BookingTicket, OrderTicket } from '../../content/Cards';
import { KD_CONTACT, useUI } from '../../providers';
import { useNav } from '../../nav';
import s from './Orders.module.css';

type Tab = 'fom' | 'bookings';
type Status = 'pending' | 'approved' | 'rejected';

const LABELS: Record<Tab, Record<Status, string>> = {
  fom: { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' },
  bookings: { pending: 'Awaiting', approved: 'Approved', rejected: 'Rejected' },
};

const inRange = (iso: string, r: DateRange) => !r.from || !r.to || (iso.slice(0, 10) >= r.from && iso.slice(0, 10) <= r.to);

export default function Orders() {
  const nav = useNav();
  const { openContact } = useUI();
  const verified = useStore((st) => st.session.verified);
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get('tab') === 'bookings' ? 'bookings' : 'fom';
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [range, setRange] = useState<DateRange>({});
  const [dateOpen, setDateOpen] = useState(false);

  const orders = useQuery('orders:all', () => api.listOrders(), { enabled: verified });
  const bookings = useQuery('bookings:all', () => api.listBookings(), { enabled: verified });
  usePrime('order:', orders.data);
  usePrime('booking:', bookings.data);
  const active = tab === 'fom' ? orders : bookings;

  const counts = useMemo(() => {
    const list: { status: string }[] = (tab === 'fom' ? orders.data : bookings.data) ?? [];
    const c: Record<Status, number> = { pending: 0, approved: 0, rejected: 0 };
    list.forEach((x) => (c[x.status as Status] += 1));
    return c;
  }, [tab, orders.data, bookings.data]);

  const vOrders = (orders.data ?? []).filter((o) => (status === 'all' || o.status === status) && inRange(o.createdAt, range));
  const vBookings = (bookings.data ?? []).filter((b) => (status === 'all' || b.status === status) && inRange(b.date, range));
  const count = tab === 'fom' ? vOrders.length : vBookings.length;
  const filtered = status !== 'all' || !!range.from;
  const newPath = tab === 'fom' ? '/orders/fom/new' : '/bookings/new';
  const newLabel = tab === 'fom' ? 'New order' : 'New booking';
  const clear = () => {
    setStatus('all');
    setRange({});
  };

  if (!verified)
    return (
      <Screen title="Orders" variant="masthead" kicker="FOM & field services" tabRoot>
        <div className="fj-gutter">
          <EmptyState
            animation="crate"
            title="Verify your number to order"
            body="Ordering FOM and booking field services need a verified mobile number. It takes a minute with a code by SMS."
            action={
              <>
                <Button onClick={() => nav('/account/verify')}>Verify now</Button>
                <Button variant="secondary" icon={<Phone aria-hidden />} onClick={() => openContact(KD_CONTACT)}>
                  Ask Kisani Didi
                </Button>
              </>
            }
          />
        </div>
      </Screen>
    );

  return (
    <Screen
      title="Orders"
      variant="masthead"
      kicker="FOM & field services"
      tabRoot
      scrollKey={`/d2/orders?${tab}`}
      mastheadAside={
        <Button size="sm" icon={<Plus aria-hidden />} to={newPath}>
          {newLabel}
        </Button>
      }
    >
      <SectionTabs
        label="Order type"
        value={tab}
        onChange={(v) => {
          setParams(v === 'bookings' ? { tab: 'bookings' } : {}, { replace: true });
          clear();
        }}
        items={[
          { value: 'fom', label: 'FOM orders', count: orders.data?.length },
          { value: 'bookings', label: 'Bookings', count: bookings.data?.length },
        ]}
      />

      <div className={s.ledger} role="group" aria-label="Filter by status">
        {(['pending', 'approved', 'rejected'] as Status[]).map((k) => (
          <motion.button key={k} type="button" whileTap={{ scale: 0.96 }} className={`${s.ledgerCell} ${s[`l_${k}`]} ${status === k ? s.ledgerOn : ''}`} aria-pressed={status === k} onClick={() => setStatus(status === k ? 'all' : k)}>
            <span className={s.ledgerNum}>{active.data ? counts[k] : '–'}</span>
            <span className={s.ledgerLabel}>
              <i aria-hidden />
              {LABELS[tab][k]}
            </span>
          </motion.button>
        ))}
      </div>

      <ChipRow label="More filters" className={s.chips}>
        <Chip selected={!!range.from} icon={<CalendarRange aria-hidden />} onClick={() => setDateOpen(true)}>
          {rangeLabel(range) ?? 'Any date'}
        </Chip>
        <Chip selected={status === 'all'} onClick={() => setStatus('all')}>
          All statuses
        </Chip>
      </ChipRow>

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
      <StaleNote error={active.data ? active.error : undefined} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={`${tab}-${status}-${range.from ?? ''}`} className={s.list} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
          {active.status === 'loading' && [0, 1, 2].map((i) => <Skel key={i} h={150} r="var(--r-xl)" />)}
          {active.status === 'error' && <ErrorState error={active.error} onRetry={active.refetch} />}
          {active.status === 'success' && count === 0 && (
            <EmptyState
              animation={tab === 'fom' ? 'crate' : 'calendar'}
              title={filtered ? 'Nothing matches these filters' : tab === 'fom' ? 'No FOM orders yet' : 'No bookings yet'}
              body={filtered ? 'Try another status or dates.' : tab === 'fom' ? 'Order organic manure for your fields and follow every step here.' : 'Book straw clearing and follow its approval here.'}
              action={
                filtered ? (
                  <Button onClick={clear}>Clear filters</Button>
                ) : (
                  <Button icon={<Plus aria-hidden />} to={newPath}>
                    {newLabel}
                  </Button>
                )
              }
            />
          )}
          {active.status === 'success' &&
            (tab === 'fom'
              ? vOrders.map((o, i) => (
                  <motion.div key={o.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                    <OrderTicket order={o} />
                  </motion.div>
                ))
              : vBookings.map((b, i) => (
                  <motion.div key={b.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                    <BookingTicket booking={b} />
                  </motion.div>
                )))}
        </motion.div>
      </AnimatePresence>

      <DateRangeSheet open={dateOpen} onClose={() => setDateOpen(false)} value={range} onApply={setRange} title={tab === 'fom' ? 'Orders placed between' : 'Bookings dated between'} allowFuture={tab === 'bookings'} />
    </Screen>
  );
}
