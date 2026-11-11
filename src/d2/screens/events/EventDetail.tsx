import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion, useTransform } from 'framer-motion';
import { Check, CheckCircle2, ChevronLeft, ChevronRight, ExternalLink, Phone, Share2, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import type { EventStatus, FarmEvent, SceneSpec } from '@/types';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import { actions, useStore } from '@/services/store';
import { eventStatus } from '@/data/events';
import { formatDate, formatDayDistance, formatTime, formatTimeRange, monthShort, weekdayShort } from '@/lib/format';
import { Screen, useScreenScroll } from '../../layout/Screen';
import { Photo, PhotoCredit } from '../../photo/Photo';
import { slotFor } from '../../photo/catalog';
import { RevealText } from '../../motion/Reveal';
import { Button, IconButton } from '../../ui/Button';
import { ErrorState, Note, SectionHead, Skel, StatusTag, Timeline } from '../../ui/Blocks';
import { useToast } from '../../ui/Toast';
import { overlayRoot } from '../../ui/Sheet';
import { eventMeta, photoOf } from '../../content/meta';
import { ShareSheet, shareOrOpen, shareUrl } from '../../content/Share';
import { useUI } from '../../providers';
import s from './EventDetail.module.css';

const HERO = 560;

function Viewer({ items, index, onIndex, onClose }: { items: SceneSpec[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const go = useCallback((d: number) => onIndex((index + d + items.length) % items.length), [index, items.length, onIndex]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [go, onClose]);
  return createPortal(
    <motion.div className={s.viewer} role="dialog" aria-modal="true" aria-label="Event photos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className={s.viewerTop}>
        <span aria-live="polite" className={s.viewerCount}>
          {String(index + 1).padStart(2, '0')} <span>/ {String(items.length).padStart(2, '0')}</span>
        </span>
        <IconButton label="Close photos" variant="glass" onClick={onClose}>
          <X />
        </IconButton>
      </div>
      <motion.div className={s.viewerStage} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} onDragEnd={(_, i) => (i.offset.x < -60 ? go(1) : i.offset.x > 60 ? go(-1) : undefined)}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div key={index} className={s.viewerImg} initial={{ clipPath: 'inset(0 0 0 100%)' }} animate={{ clipPath: 'inset(0 0 0 0%)' }} exit={{ opacity: 0 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
            <Photo id={slotFor(items[index])} src={items[index].src} ratio="4/5" label alt={`Event photo ${index + 1}`} />
          </motion.div>
        </AnimatePresence>
      </motion.div>
      <div className={s.viewerNav}>
        <Button variant="glass" icon={<ChevronLeft aria-hidden />} onClick={() => go(-1)}>
          Previous
        </Button>
        <Button variant="glass" iconRight={<ChevronRight aria-hidden />} onClick={() => go(1)}>
          Next
        </Button>
      </div>
    </motion.div>,
    overlayRoot(),
  );
}

export default function EventDetail() {
  const { id = '' } = useParams();
  const toast = useToast();
  const { openContact } = useUI();
  const q = useQuery(`event:${id}`, () => api.getEvent(id));
  const interest = useStore((st) => st.eventInterest[id]);
  const [viewer, setViewer] = useState<number | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const ev = q.data;
  const status = ev ? eventStatus(ev) : 'upcoming';
  const url = shareUrl(`/events/${id}`);

  const choose = (v: 'interested' | 'not_interested') => {
    const prev = interest;
    actions.setInterest(id, v);
    toast({ message: v === 'interested' ? 'Marked as interested. See you there!' : 'Marked as not interested', tone: v === 'interested' ? 'success' : 'info', action: prev ? { label: 'Undo', onClick: () => actions.setInterest(id, prev) } : undefined });
  };
  const maps = ev ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.location.mapsQuery)}` : '#';
  const d = ev ? new Date(ev.start) : new Date();

  return (
    <Screen
      title={ev?.title ?? 'Event'}
      variant={ev ? 'overlay' : 'detail'}
      heroHeight={HERO}
      backTo="/events"
      actions={(onImage) => (
        <IconButton label="Share event" variant={onImage ? 'glass' : 'plain'} disabled={!ev} onClick={() => ev && shareOrOpen({ title: ev.title, text: ev.summary, url }, () => setShareOpen(true))}>
          <Share2 />
        </IconButton>
      )}
    >
      {q.status === 'loading' && (
        <div className="fj-stack">
          <Skel h={HERO - 80} r="0" />
          <div className="fj-gutter">
            <Skel h={200} r="var(--r-xl)" />
          </div>
        </div>
      )}
      {q.status === 'error' && (
        <div className="fj-gutter">
          <ErrorState error={q.error} onRetry={q.refetch} />
        </div>
      )}
      {ev && (
        <>
          <ParallaxHero ev={ev} d={d} status={status} />
          <div className={s.sheet}>
            <PhotoCredit id={photoOf(ev)} />
            <div className={s.ticket}>
              <div className={s.ticketRow}>
                <span className={s.tLabel}>When</span>
                <span className={s.tValue}>
                  {formatDate(ev.start, 'long')}
                  <small>
                    {formatTimeRange(ev.start, ev.end)} · {status === 'completed' ? 'ended' : status === 'live' ? `on until ${formatTime(ev.end)}` : formatDayDistance(ev.start).toLowerCase()}
                  </small>
                </span>
              </div>
              <div className={s.perf} aria-hidden />
              <div className={s.ticketRow}>
                <span className={s.tLabel}>Where</span>
                <span className={s.tValue}>
                  {ev.location.name}
                  <small>
                    {ev.location.village}, {ev.location.district}
                  </small>
                </span>
                <Button size="sm" variant="accent" iconRight={<ExternalLink aria-hidden />} href={maps} aria-label={`Open ${ev.location.name} in Maps`}>
                  Map
                </Button>
              </div>
              <div className={s.perf} aria-hidden />
              <div className={s.ticketRow}>
                <span className={s.tLabel}>Host</span>
                <span className={s.tValue}>
                  {ev.organizer.name}
                  <small>{ev.organizer.role}</small>
                </span>
                <Button size="sm" variant="secondary" icon={<Phone aria-hidden />} onClick={() => openContact({ name: ev.organizer.name, role: 'Event organiser', phone: ev.organizer.phone, message: `Namaste, I have a question about "${ev.title}".` })}>
                  Contact
                </Button>
              </div>
            </div>

            {status !== 'completed' ? (
              <section className={s.rsvp} aria-labelledby="fj-rsvp">
                <h2 id="fj-rsvp" className={s.h2}>
                  Will you come?
                </h2>
                <div className={s.choices}>
                  <motion.button type="button" whileTap={{ scale: 0.96 }} className={`${s.choice} ${interest === 'interested' ? s.yes : ''}`} aria-pressed={interest === 'interested'} onClick={() => choose('interested')}>
                    {interest === 'interested' ? <Check aria-hidden strokeWidth={3} /> : <ThumbsUp aria-hidden />}
                    <span>Interested</span>
                  </motion.button>
                  <motion.button type="button" whileTap={{ scale: 0.96 }} className={`${s.choice} ${interest === 'not_interested' ? s.no : ''}`} aria-pressed={interest === 'not_interested'} onClick={() => choose('not_interested')}>
                    {interest === 'not_interested' ? <X aria-hidden strokeWidth={3} /> : <ThumbsDown aria-hidden />}
                    <span>Not this time</span>
                  </motion.button>
                </div>
                <p className={s.small}>Your answer helps your Kisani Didi plan seats and materials. You can change it until the event starts.</p>
              </section>
            ) : (
              <Note tone="neutral" icon={<CheckCircle2 aria-hidden />} title="This event has ended">
                {interest ? `You said you were ${interest === 'interested' ? 'interested' : 'not interested'}. ` : ''}Replies are closed.
              </Note>
            )}

            <section>
              <SectionHead title="About" inset={false} />
              {ev.description.map((p, i) => (
                <p key={i} className={i === 0 ? s.leadPara : s.para}>
                  {p}
                </p>
              ))}
            </section>

            {ev.agenda && (
              <section>
                <SectionHead title="Agenda" inset={false} />
                <Timeline items={ev.agenda.map((a) => ({ title: a.title, meta: a.time, state: status === 'completed' ? 'done' : 'upcoming' }))} />
              </section>
            )}

            {ev.bring && status !== 'completed' && (
              <section>
                <SectionHead title="Bring along" inset={false} />
                <ul className={s.bring}>
                  {ev.bring.map((b, i) => (
                    <li key={b}>
                      <span>{String(i + 1).padStart(2, '0')}</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {ev.media && ev.media.length > 0 && (
              <section>
                <SectionHead title="From the day" inset={false} />
                <div className={s.collage}>
                  {ev.media.map((m, i) => (
                    <motion.button key={i} type="button" className={`${s.tile} ${s[`t${i % 5}`]}`} whileTap={{ scale: 0.97 }} onClick={() => setViewer(i)} aria-label={`Open photo ${i + 1} of ${ev.media!.length}`}>
                      <Photo id={slotFor(m)} src={m.src} ratio="fill" decorative />
                    </motion.button>
                  ))}
                </div>
              </section>
            )}
          </div>
          <AnimatePresence>{viewer !== null && ev.media && <Viewer items={ev.media} index={viewer} onIndex={setViewer} onClose={() => setViewer(null)} />}</AnimatePresence>
          <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} title={ev.title} url={url} />
        </>
      )}
    </Screen>
  );
}

function ParallaxHero({ ev, d, status }: { ev: FarmEvent; d: Date; status: EventStatus }) {
  const scrollY = useScreenScroll();
  const y = useTransform(scrollY, [0, HERO], [0, 150]);
  const meta = eventMeta(status);
  return (
    <header className={s.hero}>
      <motion.div className={s.heroMedia} style={{ y }}>
        <Photo id={photoOf(ev)} src={ev.scene.src} ratio="fill" shade="full" drift priority label="hero" muted={status === 'completed'} />
      </motion.div>
      <div className={s.heroDate} aria-hidden>
        <motion.span className={s.bigDay} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
          {String(d.getDate()).padStart(2, '0')}
        </motion.span>
        <span className={s.bigMonth}>
          {monthShort(d)}
          <br />
          {weekdayShort(d)}
        </span>
      </div>
      <div className={s.heroText}>
        <div className={s.heroTags}>
          <StatusTag tone={meta.tone} night>
            {meta.label}
          </StatusTag>
          <span className={s.topic}>{ev.topic}</span>
        </div>
        <RevealText text={ev.title} className={s.title} delay={0.2} stagger={0.04} />
        <p className={s.summary}>{ev.summary}</p>
      </div>
    </header>
  );
}
