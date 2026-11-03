import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Bookmark, CalendarDays, Check, Clock3, Leaf, MapPin, Play, Plus, Truck, UserRound } from 'lucide-react';
import type { Booking, ContentItem, FarmEvent, FomOrder, Land } from '@/types';
import { Scene } from '@/components/media/Scene';
import { StatusBadge } from '@/components/ui/Misc';
import { CATEGORY_LABEL, readMinutes } from '@/data/content';
import { eventStatus } from '@/data/events';
import { formatCurrency, formatDate, formatDayDistance, formatDuration, formatRelative, formatTime, formatTimeRange, monthShort, plural, weekdayShort } from '@/lib/format';
import { formatQuantity, orderTotals } from '@/lib/pricing';
import { useStore } from '@/services/store';
import { diffDays, fromISODate } from '@/lib/dates';
import { bookingStatus, eventStatusMeta, orderStatus } from './status';
import s from './Cards.module.css';

export function contentPath(item: Pick<ContentItem, 'kind' | 'id'>): string {
  return item.kind === 'news' ? `/news/${item.id}` : item.kind === 'article' ? `/articles/${item.id}` : `/videos/${item.id}`;
}

/** Link with gentle press feedback. */
export function Press({ to, children, className, label, state }: { to: string; children: ReactNode; className?: string; label?: string; state?: unknown }) {
  return (
    <motion.div whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 600, damping: 30 }} style={{ borderRadius: 'inherit' }}>
      <Link to={to} className={`${s.press} ${className ?? ''}`} aria-label={label} state={state}>
        {children}
      </Link>
    </motion.div>
  );
}

function Meta({ children }: { children: ReactNode[] }) {
  const parts = children.filter(Boolean);
  return (
    <div className={s.meta}>
      {parts.map((p, i) => (
        <span key={i} style={{ display: 'contents' }}>
          {i > 0 && <span className={s.metaDot} aria-hidden />}
          <span>{p}</span>
        </span>
      ))}
    </div>
  );
}

function contentMeta(item: ContentItem) {
  const time = item.kind === 'video' ? `${formatDuration(item.video?.durationSec ?? 0)} video` : `${readMinutes(item)} min read`;
  return [formatRelative(item.publishedAt), time];
}

function SavedMark({ id }: { id: string }) {
  const saved = useStore((st) => st.bookmarks.includes(id));
  if (!saved) return null;
  return (
    <span className={s.savedMark} title="Saved">
      <Bookmark aria-hidden fill="currentColor" />
      <span className="sr-only">Saved</span>
    </span>
  );
}

/* ---------- Feature (lead story) ---------- */

function contentLabel(item: ContentItem) {
  return `${item.title}. ${CATEGORY_LABEL[item.category]}, ${contentMeta(item).join(', ')}`;
}

export function FeatureCard({ item, height = 380, eyebrow = 'Featured' }: { item: ContentItem; height?: number; eyebrow?: string }) {
  return (
    <Press to={contentPath(item)} className={s.feature} label={`${eyebrow}: ${contentLabel(item)}`}>
      <div className={s.feature} style={{ height }}>
        <Scene scene={item.scene} aspect="portrait" detail="high" className={s.featureScene} />
        <div className={s.featureScrim} aria-hidden />
        <div className={s.featureTop}>
          <span className={s.glassChip}>{eyebrow}</span>
          <span className={s.glassChip}>{CATEGORY_LABEL[item.category]}</span>
        </div>
        <SavedMark id={item.id} />
        {item.kind === 'video' && (
          <span className={s.playBig} aria-hidden>
            <Play fill="currentColor" />
          </span>
        )}
        <div className={s.featureBody}>
          <h3 className={s.featureTitle}>{item.title}</h3>
          <p className={`${s.featureSummary} clamp-2`}>{item.summary}</p>
          <div className={s.featureMeta}>
            {contentMeta(item).join('  ·  ')}
          </div>
        </div>
      </div>
    </Press>
  );
}

/* ---------- Media row (lists) ---------- */

export function MediaRow({ item }: { item: ContentItem }) {
  const video = item.kind === 'video';
  return (
    <Press to={contentPath(item)} label={contentLabel(item)}>
      <div className={s.row}>
        <div className={`${s.thumb} ${video ? s.thumbVideo : ''}`}>
          <Scene scene={item.scene} aspect={video ? 'wide' : 'square'} className={s.thumbScene} />
          {video && (
            <span className={`${s.glassChip} ${s.thumbPlay}`}>
              <Play aria-hidden fill="currentColor" /> {formatDuration(item.video?.durationSec ?? 0)}
            </span>
          )}
        </div>
        <div className={s.rowBody}>
          <span className={s.overline}>{CATEGORY_LABEL[item.category]}</span>
          <h3 className={`${s.rowTitle} clamp-3`}>{item.title}</h3>
          <Meta>{contentMeta(item)}</Meta>
        </div>
      </div>
    </Press>
  );
}

/* ---------- Compact (carousels) ---------- */

export function CompactCard({ item, tall }: { item: ContentItem; tall?: boolean }) {
  const video = item.kind === 'video';
  return (
    <Press to={contentPath(item)} label={contentLabel(item)}>
      <div className={s.compact}>
        <div className={`${s.compactMedia} ${tall ? s.compactMediaTall : ''}`}>
          <Scene scene={item.scene} aspect={tall ? 'portrait' : 'wide'} detail={tall ? 'high' : 'low'} className={s.featureScene} />
          <SavedMark id={item.id} />
          {video && (
            <>
              <span className={s.playSmall} aria-hidden>
                <Play fill="currentColor" />
              </span>
              <span className={`${s.glassChip} ${s.duration}`}>{formatDuration(item.video?.durationSec ?? 0)}</span>
            </>
          )}
        </div>
        <div className="stack" style={{ ['--gap' as string]: '6px' }}>
          <span className={s.overline}>{CATEGORY_LABEL[item.category]}</span>
          <h3 className={`${s.compactTitle} clamp-2`}>{item.title}</h3>
          <Meta>{contentMeta(item)}</Meta>
        </div>
      </div>
    </Press>
  );
}

/* ---------- Events ---------- */

export function DateTile({ iso, glass }: { iso: string; glass?: boolean }) {
  const d = new Date(iso);
  return (
    <div className={`${s.dateTile} ${glass ? s.dateTileGlass : ''}`} aria-hidden>
      <span className={s.dateMonth}>{monthShort(d)}</span>
      <span className={s.dateDay}>{d.getDate()}</span>
      <span className={s.dateWeek}>{weekdayShort(d)}</span>
    </div>
  );
}

function InterestNote({ id }: { id: string }) {
  const interest = useStore((st) => st.eventInterest[id]);
  if (interest !== 'interested') return null;
  return (
    <span className={s.interestChip}>
      <Check aria-hidden strokeWidth={3} /> You’re going
    </span>
  );
}

export function EventCard({ event, featured }: { event: FarmEvent; featured?: boolean }) {
  const status = eventStatus(event);
  const meta = eventStatusMeta(status);
  return (
    <Press to={`/events/${event.id}`} label={`${event.title}, ${formatDate(event.start, 'long')}, ${meta.label}`}>
      <div className={`${s.event} ${featured ? s.eventFeatured : ''}`}>
        <div className={s.eventMedia}>
          <Scene scene={event.scene} aspect="wide" detail={featured ? 'high' : 'low'} className={s.featureScene} />
          <div className={s.eventMediaTop}>
            <StatusBadge tone={meta.tone} icon={meta.icon} onImage>
              {meta.label}
            </StatusBadge>
          </div>
          <div className={s.eventTile}>
            <DateTile iso={event.start} glass />
          </div>
        </div>
        <div className={s.eventBody}>
          <h3 className={s.eventTitle}>{event.title}</h3>
          <div className={s.infoLine}>
            <Clock3 aria-hidden />
            {status === 'live' ? `Until ${formatTime(event.end)}` : `${formatDayDistance(event.start)} · ${formatTimeRange(event.start, event.end)}`}
          </div>
          <div className={s.infoLine}>
            <MapPin aria-hidden />
            {event.location.name}, {event.location.village}
          </div>
          <div className={s.eventFoot}>
            <InterestNote id={event.id} />
          </div>
        </div>
      </div>
    </Press>
  );
}

export function EventRow({ event }: { event: FarmEvent }) {
  const status = eventStatus(event);
  const meta = eventStatusMeta(status);
  return (
    <Press to={`/events/${event.id}`}>
      <div className={s.eventRow}>
        <DateTile iso={event.start} />
        <div className={s.eventRowBody}>
          <h3 className={`${s.eventTitle} clamp-2`}>{event.title}</h3>
          <div className={s.meta}>
            {formatTimeRange(event.start, event.end)} · {event.location.village}
          </div>
          <div style={{ marginTop: 4 }}>
            <StatusBadge tone={meta.tone} icon={meta.icon}>
              {meta.label}
            </StatusBadge>
          </div>
        </div>
      </div>
    </Press>
  );
}

/* ---------- Lands ---------- */

export function LandCard({ land, wide }: { land: Land; wide?: boolean }) {
  return (
    <Press to={`/lands/${land.id}`} label={`${land.name}, ${land.areaAcres} acres, ${land.ownership}${land.active ? '' : ', inactive'}`}>
      <div className={`${s.land} ${wide ? s.landWide : ''} ${land.active ? '' : s.landInactive}`}>
        <div className={s.landMedia}>
          <Scene scene={land.scene} aspect="wide" className={s.featureScene} />
          {!land.active && (
            <div className={s.landTop}>
              <StatusBadge tone="neutral" onImage>
                Inactive
              </StatusBadge>
            </div>
          )}
        </div>
        <div className={s.landBody}>
          <h3 className={s.landName}>{land.name}</h3>
          <div className={s.landStats}>
            <span>
              <strong>{land.areaAcres}</strong> acres
            </span>
            <span>{land.ownership}</span>
          </div>
          {land.crops.length ? (
            <span className={s.cropLine}>
              <Leaf aria-hidden /> <span className="clamp-1">{plural(land.crops.length, 'crop')} · {land.crops.map((c) => c.name.replace(/\s*\(.*\)/, '')).join(', ')}</span>
            </span>
          ) : (
            <span className={`${s.cropLine} ${s.cropNone}`}>
              <AlertCircle aria-hidden /> No crops added
            </span>
          )}
        </div>
      </div>
    </Press>
  );
}

export function AddLandCard() {
  return (
    <Link to="/lands/new" className={s.addLand}>
      <span className={s.addLandIcon}>
        <Plus aria-hidden />
      </span>
      Add a field
    </Link>
  );
}

/* ---------- Orders & bookings ---------- */

export function dispatchLabel(dispatchDate: string): string {
  const days = diffDays(new Date(), fromISODate(dispatchDate));
  if (days === 0) return 'Dispatch today';
  if (days === 1) return 'Dispatch tomorrow';
  return days > 1 ? `Dispatch on ${formatDate(dispatchDate, 'weekday')}` : `Dispatched on ${formatDate(dispatchDate, 'weekday')}`;
}

export function OrderCard({ order }: { order: FomOrder }) {
  const meta = orderStatus(order.status);
  const totals = orderTotals(order.quantity, order.unit, order.pricePerKg, order.shipping);
  return (
    <Press to={`/orders/fom/${order.id}`} label={`Order ${order.id}, ${formatQuantity(order.quantity, order.unit)}, ${meta.label}`}>
      <div className={s.order}>
        <div className={s.orderTop}>
          <span className={s.orderId}>#{order.id}</span>
          <StatusBadge tone={meta.tone} icon={meta.icon}>
            {meta.label}
          </StatusBadge>
        </div>
        <div className={s.orderMain}>
          <div>
            <div className={s.orderQty}>
              {formatQuantity(order.quantity, order.unit)}
              <small>FOM</small>
            </div>
            <div className={s.meta} style={{ marginTop: 6 }}>
              Ordered {formatDate(order.createdAt)}
            </div>
          </div>
          <div className={s.orderTotal}>
            <div className={s.orderTotalLabel}>Total</div>
            <div className={s.orderTotalValue}>{formatCurrency(totals.total)}</div>
          </div>
        </div>
        {order.status === 'approved' && order.dispatchDate && (
          <div className={`${s.orderFoot} ${s.success}`}>
            <Truck aria-hidden /> {dispatchLabel(order.dispatchDate)}
          </div>
        )}
        {order.status === 'rejected' && order.rejectionReason && (
          <div className={`${s.orderFoot} ${s.danger}`}>
            <AlertCircle aria-hidden /> <span className="clamp-1">{order.rejectionReason}</span>
          </div>
        )}
        {order.status === 'pending' && (
          <div className={s.orderFoot}>
            <Clock3 aria-hidden /> Waiting for the team to approve
          </div>
        )}
      </div>
    </Press>
  );
}

export function BookingCard({ booking }: { booking: Booking }) {
  const meta = bookingStatus(booking.status);
  return (
    <Press to={`/bookings/${booking.id}`} label={`Booking ${booking.id}, ${booking.crop}, ${booking.acres} acres, ${meta.label}`}>
      <div className={s.order}>
        <div className={s.orderTop}>
          <span className={s.orderId}>Booking #{booking.id}</span>
          <StatusBadge tone={meta.tone} icon={meta.icon}>
            {meta.label}
          </StatusBadge>
        </div>
        <div>
          <div className={s.orderQty} style={{ fontSize: '1.25rem' }}>
            {booking.crop} · {booking.acres} acres
          </div>
          <div className={s.meta} style={{ marginTop: 6 }}>
            {booking.landName}
          </div>
        </div>
        <div className={s.orderFoot}>
          <CalendarDays aria-hidden /> {formatDate(booking.date, 'weekday')} at {formatTime(booking.slot)}
          {booking.requestedBy.role === 'Farm manager' && (
            <>
              <span className={s.metaDot} aria-hidden />
              <UserRound aria-hidden /> {booking.requestedBy.name}
            </>
          )}
        </div>
        {booking.status === 'approved' && booking.operator && (
          <div className={`${s.orderFoot} ${s.success}`} style={{ borderTop: 0, paddingTop: 0 }}>
            <Check aria-hidden /> Operator: {booking.operator.name}
          </div>
        )}
      </div>
    </Press>
  );
}
