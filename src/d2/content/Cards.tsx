import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin, Play, Truck } from 'lucide-react';
import type { Booking, ContentItem, FarmEvent, FomOrder, Land } from '@/types';
import { eventStatus } from '@/data/events';
import { formatCurrency, formatDate, formatDayDistance, formatRelative, formatTime, monthShort, weekdayShort } from '@/lib/format';
import { formatQuantity, orderTotals } from '@/lib/pricing';
import { Photo, type Ratio } from '../photo/Photo';
import { StatusTag } from '../ui/Blocks';
import { to } from '../paths';
import { bookingMeta, category, contentMeta, contentPath, eventMeta, orderMeta, photoOf } from './meta';
import s from './Cards.module.css';

function Tap({ to: path, children, className, label }: { to: string; children: ReactNode; className?: string; label?: string }) {
  return (
    <motion.div whileTap={{ scale: 0.985 }} className={s.tapWrap}>
      <Link to={to(path)} className={`${s.tap} ${className ?? ''}`} aria-label={label}>
        {children}
      </Link>
    </motion.div>
  );
}

/* ---------- Cover story: full-bleed photo, headline set over it ---------- */

export function CoverStory({ item, kicker = 'Cover story', ratio = '4/5', bleed = true }: { item: ContentItem; kicker?: string; ratio?: Ratio; bleed?: boolean }) {
  return (
    <Tap to={contentPath(item)} className={`${s.cover} ${bleed ? s.bleed : ''}`}>
      <Photo id={photoOf(item)} src={item.scene.src} ratio={ratio} shade="bottom" reveal label drift>
        <div className={s.coverText}>
          <p className={s.coverKicker}>
            <span>{kicker}</span> {category(item)}
          </p>
          <h3 className={s.coverTitle}>{item.title}</h3>
          <p className={s.coverMeta}>
            {formatRelative(item.publishedAt)} · {contentMeta(item)}
          </p>
        </div>
        {item.kind === 'video' && (
          <span className={s.playBig} aria-hidden>
            <Play fill="currentColor" />
          </span>
        )}
      </Photo>
    </Tap>
  );
}

/* ---------- Story row: magazine list item, image on either side ---------- */

export function StoryRow({ item, flip, index }: { item: ContentItem; flip?: boolean; index?: number }) {
  return (
    <Tap to={contentPath(item)} className={`${s.row} ${flip ? s.rowFlip : ''}`}>
      <div className={s.rowText}>
        <p className={s.kicker}>
          {index !== undefined && <span className={s.num}>{String(index).padStart(2, '0')}</span>}
          {category(item)}
        </p>
        <h3 className={s.rowTitle}>{item.title}</h3>
        <p className={s.meta}>
          {formatRelative(item.publishedAt)} · {contentMeta(item)}
        </p>
      </div>
      <div className={s.rowMedia}>
        <Photo id={photoOf(item)} src={item.scene.src} ratio={flip ? '3/4' : '1/1'} decorative />
        {item.kind === 'video' && (
          <span className={s.playSmall} aria-hidden>
            <Play fill="currentColor" />
          </span>
        )}
      </div>
    </Tap>
  );
}

/* ---------- Index story: typographic, no image ---------- */

export function IndexStory({ item, index }: { item: ContentItem; index: number }) {
  return (
    <Tap to={contentPath(item)} className={s.index}>
      <span className={s.indexNum}>{String(index).padStart(2, '0')}</span>
      <span className={s.indexBody}>
        <span className={s.kicker}>{category(item)}</span>
        <span className={s.indexTitle}>{item.title}</span>
        <span className={s.meta}>{formatRelative(item.publishedAt)}</span>
      </span>
      <ArrowUpRight className={s.indexArrow} aria-hidden />
    </Tap>
  );
}

/* ---------- Video tile: cinematic, in several aspect ratios ---------- */

export function VideoTile({ item, ratio = '16/9', width, night }: { item: ContentItem; ratio?: Ratio; width?: number; night?: boolean }) {
  return (
    <div style={width ? { width } : undefined}>
      <Tap to={contentPath(item)} className={`${s.video} ${night ? s.videoNight : ''}`} label={`${item.title}, ${contentMeta(item)}`}>
        <Photo id={photoOf(item)} src={item.scene.src} ratio={ratio} shade="bottom" decorative>
          <span className={s.videoPlay} aria-hidden>
            <Play fill="currentColor" />
          </span>
          <span className={s.videoDur}>{contentMeta(item).replace(' watch', '')}</span>
          {ratio === '9/16' || ratio === '3/4' ? (
            <span className={s.videoOverTitle} aria-hidden>
              {item.title}
            </span>
          ) : null}
        </Photo>
        {ratio !== '9/16' && ratio !== '3/4' && (
          <span className={s.videoText} aria-hidden>
            <span className={s.kicker}>{category(item)}</span>
            <span className={s.videoTitle}>{item.title}</span>
          </span>
        )}
      </Tap>
    </div>
  );
}

/* ---------- Guide card: tall photo, title beneath ---------- */

export function GuideCard({ item, width = 220 }: { item: ContentItem; width?: number }) {
  return (
    <div style={{ width }}>
      <Tap to={contentPath(item)} className={s.guide}>
        <Photo id={photoOf(item)} src={item.scene.src} ratio="3/4" decorative />
        <span className={s.kicker}>{category(item)}</span>
        <span className={s.guideTitle}>{item.title}</span>
        <span className={s.meta}>{contentMeta(item)}</span>
      </Tap>
    </div>
  );
}

/* ---------- Event poster: big date numerals over the photo ---------- */

export function EventPoster({ event, ratio = '4/5' }: { event: FarmEvent; ratio?: Ratio }) {
  const st = eventStatus(event);
  const meta = eventMeta(st);
  const d = new Date(event.start);
  return (
    <Tap to={`/events/${event.id}`} className={s.poster}>
      <Photo id={photoOf(event)} src={event.scene.src} ratio={ratio} shade="full" reveal>
        <div className={s.posterTop}>
          <span className={s.posterDate}>
            <span className={s.posterDay}>{String(d.getDate()).padStart(2, '0')}</span>
            <span className={s.posterMonth}>
              {monthShort(d)}
              <br />
              {weekdayShort(d)}
            </span>
          </span>
          <StatusTag tone={meta.tone} night>
            {meta.label}
          </StatusTag>
        </div>
        <div className={s.posterBottom}>
          <p className={s.coverKicker}>
            <span>{event.topic}</span>
          </p>
          <h3 className={s.posterTitle}>{event.title}</h3>
          <p className={s.posterMeta}>
            <MapPin aria-hidden /> {event.location.village} · {formatTime(event.start)}
            {st === 'upcoming' && <> · {formatDayDistance(event.start)}</>}
          </p>
        </div>
      </Photo>
    </Tap>
  );
}

/* ---------- Event line: used on the events timeline ---------- */

export function EventLine({ event }: { event: FarmEvent }) {
  const st = eventStatus(event);
  const meta = eventMeta(st);
  const d = new Date(event.start);
  return (
    <Tap to={`/events/${event.id}`} className={s.eventLine}>
      <span className={s.eventDate}>
        <span className={s.eventDay}>{d.getDate()}</span>
        <span className={s.eventWd}>{weekdayShort(d)}</span>
      </span>
      <span className={s.eventBody}>
        <span className={s.kicker}>{event.topic}</span>
        <span className={s.eventTitle}>{event.title}</span>
        <span className={s.meta}>
          {formatTime(event.start)} · {event.location.village}
        </span>
        {st !== 'upcoming' && (
          <span style={{ marginTop: 6 }}>
            <StatusTag tone={meta.tone}>{meta.label}</StatusTag>
          </span>
        )}
      </span>
      <span className={s.eventThumb}>
        <Photo id={photoOf(event)} src={event.scene.src} ratio="3/4" decorative muted={st === 'completed'} />
      </span>
    </Tap>
  );
}

/* ---------- Order ticket ---------- */

export function dispatchLabel(iso: string) {
  const days = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return 'Dispatched';
  if (days === 0) return 'Dispatching today';
  return `Dispatch ${formatDayDistance(iso).toLowerCase()}`;
}

export function OrderTicket({ order }: { order: FomOrder }) {
  const meta = orderMeta(order.status);
  const t = orderTotals(order.quantity, order.unit, order.pricePerKg, order.shipping);
  const step = order.status === 'pending' ? 1 : order.status === 'approved' ? (order.dispatchDate && new Date(order.dispatchDate) < new Date() ? 3 : 2) : 1;
  return (
    <Tap to={`/orders/fom/${order.id}`} className={`${s.ticket} ${s[`ticket_${meta.tone}`]}`} label={`Order ${order.id}, ${formatQuantity(order.quantity, order.unit)}, ${meta.label}, ${formatCurrency(t.total)}`}>
      <span className={s.ticketRail} aria-hidden />
      <span className={s.ticketMain}>
        <span className={s.ticketTop}>
          <StatusTag tone={meta.tone} icon={meta.icon}>
            {meta.label}
          </StatusTag>
          <span className={s.ticketId}>#{order.id}</span>
        </span>
        <span className={s.ticketQty}>
          {formatQuantity(order.quantity, order.unit)}
          <small> FOM</small>
        </span>
        <span className={s.ticketFoot}>
          <span>{formatDate(order.createdAt)}</span>
          <strong>{formatCurrency(t.total)}</strong>
        </span>
        {order.status !== 'rejected' && (
          <span className={s.ticketSteps} aria-hidden>
            {[1, 2, 3].map((i) => (
              <span key={i} className={i <= step ? s.stepOn : ''} />
            ))}
          </span>
        )}
        {order.status === 'approved' && order.dispatchDate && (
          <span className={s.ticketNote}>
            <Truck aria-hidden /> {dispatchLabel(order.dispatchDate)} · {formatDate(order.dispatchDate, 'short')}
          </span>
        )}
        {order.origin === 'device' && <span className={s.deviceNote}>Saved on this phone only</span>}
      </span>
    </Tap>
  );
}

export function BookingTicket({ booking }: { booking: Booking }) {
  const meta = bookingMeta(booking.status);
  const d = new Date(booking.date);
  return (
    <Tap to={`/bookings/${booking.id}`} className={`${s.ticket} ${s[`ticket_${meta.tone}`]}`} label={`Booking ${booking.id}, ${booking.crop}, ${booking.acres} acres, ${meta.label}`}>
      <span className={s.ticketRail} aria-hidden />
      <span className={s.ticketDate} aria-hidden>
        <span className={s.eventDay}>{booking.date.slice(8, 10)}</span>
        <span className={s.eventWd}>{monthShort(d)}</span>
      </span>
      <span className={s.ticketMain}>
        <span className={s.ticketTop}>
          <StatusTag tone={meta.tone} icon={meta.icon}>
            {meta.label}
          </StatusTag>
          <span className={s.ticketId}>#{booking.id}</span>
        </span>
        <span className={s.ticketTitle}>
          {booking.crop} · {booking.acres} acres
        </span>
        <span className={s.meta}>
          {booking.landName} · {formatTime(booking.slot)}
          {booking.requestedBy.role === 'Farm manager' ? ` · by ${booking.requestedBy.name}` : ''}
        </span>
        {booking.origin === 'device' && <span className={s.deviceNote}>Saved on this phone only</span>}
      </span>
    </Tap>
  );
}

/* ---------- Field tile ---------- */

export function FieldTile({ land, width = 240, ratio = '4/5' }: { land: Land; width?: number | string; ratio?: Ratio }) {
  const crops = land.crops.map((c) => c.name.replace(/\s*\(.*\)/, '')).join(', ') || 'No crops yet';
  return (
    <div style={{ width }}>
      <Tap to={`/lands/${land.id}`} className={s.field} label={`${land.name}, ${land.areaAcres} acres, ${crops}${land.active ? '' : ', inactive'}`}>
        <Photo id={photoOf(land)} src={land.scene.src} ratio={ratio} shade="bottom" decorative muted={!land.active}>
          <span className={s.fieldAcres}>
            {land.areaAcres}
            <small>acres</small>
          </span>
          <span className={s.fieldText}>
            <span className={s.fieldName}>{land.name}</span>
            <span className={s.fieldCrops}>{land.active ? crops : 'Inactive'}</span>
          </span>
        </Photo>
      </Tap>
    </div>
  );
}
