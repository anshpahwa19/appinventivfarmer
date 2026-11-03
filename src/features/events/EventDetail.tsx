import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock3, ExternalLink, MapPin, Phone, ThumbsDown, ThumbsUp, X, Share2, Images } from 'lucide-react';
import type { SceneSpec } from '@/types';
import { Screen } from '@/components/layout/Screen';
import { Scene } from '@/components/media/Scene';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { Callout, Timeline } from '@/components/ui/Blocks';
import { StatusBadge } from '@/components/ui/Misc';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { DateTile } from '@/components/content/Cards';
import { eventStatusMeta } from '@/components/content/status';
import { ShareSheet, shareOrOpen, shareUrl } from '@/components/content/ShareSheet';
import { useUI } from '@/app/providers';
import { eventStatus } from '@/data/events';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import { actions, useStore } from '@/services/store';
import { formatDate, formatDayDistance, formatTime, formatTimeRange } from '@/lib/format';
import { ParallaxHero } from '@/components/motion/ParallaxHero';
import s from './Events.module.css';

function MediaViewer({ items, index, onClose, onIndex }: { items: SceneSpec[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  const go = useCallback((d: number) => onIndex((index + d + items.length) % items.length), [index, items.length, onIndex]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [go, onClose]);
  return createPortal(
    <motion.div className={s.viewer} role="dialog" aria-modal="true" aria-label="Event photos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className={s.viewerTop}>
        <span aria-live="polite">
          {index + 1} / {items.length}
        </span>
        <IconButton label="Close photos" variant="onImage" onClick={onClose}>
          <X />
        </IconButton>
      </div>
      <motion.div className={s.viewerStage} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} onDragEnd={(_, info) => (info.offset.x < -60 ? go(1) : info.offset.x > 60 ? go(-1) : undefined)}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div key={index} className={s.viewerImg} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <div className={s.viewerFrame}>
              <Scene scene={items[index]} aspect="portrait" detail="high" style={{ position: 'absolute', inset: 0 }} alt={`Event photo ${index + 1}`} />
            </div>
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
    document.getElementById('overlay-root') ?? document.body,
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
  const meta = eventStatusMeta(status);
  const url = shareUrl(`/events/${id}`);

  const choose = (value: 'interested' | 'not_interested') => {
    const prev = interest;
    actions.setInterest(id, value);
    toast({
      message: value === 'interested' ? 'Marked as interested. See you there!' : 'Marked as not interested',
      tone: value === 'interested' ? 'success' : 'info',
      action: prev ? { label: 'Undo', onClick: () => actions.setInterest(id, prev) } : undefined,
    });
  };

  const mapsUrl = ev ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.location.mapsQuery)}` : '#';

  return (
    <Screen
      title={ev?.title ?? 'Event'}
      back
      backTo="/events"
      overlay={!!ev}
      actions={(onImage) => (
        <IconButton label="Share event" variant={onImage ? 'onImage' : 'plain'} disabled={!ev} onClick={() => ev && shareOrOpen({ title: ev.title, text: ev.summary, url }, () => setShareOpen(true))}>
          <Share2 />
        </IconButton>
      )}
    >
      {q.status === 'loading' && (
        <div>
          <Skeleton h={320} r={0} />
          <div className="gutter stack" style={{ marginTop: 24, ['--gap' as string]: '12px' }}>
            <Skeleton h={30} />
            <Skeleton h={180} r={24} />
          </div>
        </div>
      )}
      {q.status === 'error' && (
        <div className="gutter" style={{ paddingTop: 8 }}>
          <ErrorState error={q.error} onRetry={q.refetch} />
        </div>
      )}
      {ev && (
        <>
          <div className={s.hero}>
            <ParallaxHero>
              <Scene scene={ev.scene} aspect="wide" detail="high" style={{ position: 'absolute', inset: 0 }} />
            </ParallaxHero>
            <div className={s.heroScrim} />
          </div>
          <motion.div className={s.sheet} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}>
            <div className={s.head}>
              <DateTile iso={ev.start} />
              <div style={{ minWidth: 0 }}>
                <h1 className={s.title}>{ev.title}</h1>
                <div className={s.topic}>
                  <StatusBadge tone={meta.tone} icon={meta.icon}>
                    {meta.label}
                  </StatusBadge>
                </div>
              </div>
            </div>

            <div className={s.info}>
              <div className={s.infoRow}>
                <span className={s.infoIcon}>
                  <CalendarDays aria-hidden />
                </span>
                <div className={s.infoText}>
                  <div className={s.infoTitle}>{formatDate(ev.start, 'long')}</div>
                  <div className={s.infoSub}>{status === 'completed' ? 'This event has ended' : status === 'live' ? 'Happening now' : formatDayDistance(ev.start)}</div>
                </div>
              </div>
              <div className={s.infoRow}>
                <span className={s.infoIcon}>
                  <Clock3 aria-hidden />
                </span>
                <div className={s.infoText}>
                  <div className={s.infoTitle}>{formatTimeRange(ev.start, ev.end)}</div>
                  {status === 'live' && <div className={s.infoSub}>Ends at {formatTime(ev.end)}</div>}
                </div>
              </div>
              <div className={s.infoRow}>
                <span className={s.infoIcon}>
                  <MapPin aria-hidden />
                </span>
                <div className={s.infoText}>
                  <div className={s.infoTitle}>{ev.location.name}</div>
                  <div className={s.infoSub}>
                    {ev.location.village}, {ev.location.district}
                  </div>
                </div>
                <Button size="sm" variant="tonal" iconRight={<ExternalLink aria-hidden />} href={mapsUrl} aria-label={`Open ${ev.location.name} in Maps`}>
                  Map
                </Button>
              </div>
              <div className={s.infoRow}>
                <span className={s.infoIcon}>
                  <Phone aria-hidden />
                </span>
                <div className={s.infoText}>
                  <div className={s.infoTitle}>{ev.organizer.name}</div>
                  <div className={s.infoSub}>Organiser · {ev.organizer.role}</div>
                </div>
                <Button size="sm" variant="tonal" onClick={() => openContact({ name: ev.organizer.name, role: 'Event organiser', phone: ev.organizer.phone, message: `Namaste, I have a question about "${ev.title}".` })}>
                  Contact
                </Button>
              </div>
            </div>

            {status !== 'completed' ? (
              <section className={s.interest} aria-labelledby="interest-h">
                <h2 id="interest-h" className={s.h2} style={{ marginBottom: 0 }}>
                  Will you attend?
                </h2>
                <div className={s.choices}>
                  <button type="button" className={`${s.choice} ${interest === 'interested' ? s.choiceYes : ''}`} aria-pressed={interest === 'interested'} onClick={() => choose('interested')}>
                    {interest === 'interested' ? <Check aria-hidden strokeWidth={3} /> : <ThumbsUp aria-hidden />} Interested
                  </button>
                  <button type="button" className={`${s.choice} ${interest === 'not_interested' ? s.choiceNo : ''}`} aria-pressed={interest === 'not_interested'} onClick={() => choose('not_interested')}>
                    {interest === 'not_interested' ? <X aria-hidden strokeWidth={3} /> : <ThumbsDown aria-hidden />} Not interested
                  </button>
                </div>
                <p className={s.interestNote}>Your answer helps your Kisani Didi plan seating and materials. You can change it until the event starts.</p>
              </section>
            ) : (
              <Callout tone="neutral" icon={<CheckCircle2 aria-hidden />} title="This event has ended">
                {interest ? `You marked yourself as ${interest === 'interested' ? 'interested' : 'not interested'}. ` : ''}Interest selection is closed.
              </Callout>
            )}

            <section>
              <h2 className={s.h2}>About this event</h2>
              {ev.description.map((p, i) => (
                <p key={i} className={s.para}>
                  {p}
                </p>
              ))}
            </section>

            {ev.agenda && (
              <section>
                <h2 className={s.h2}>Agenda</h2>
                <Timeline items={ev.agenda.map((a) => ({ title: a.title, meta: a.time, state: status === 'completed' ? 'done' : 'upcoming' }))} />
              </section>
            )}

            {ev.bring && status !== 'completed' && (
              <section>
                <h2 className={s.h2}>What to bring</h2>
                <ul className={s.bring}>
                  {ev.bring.map((b) => (
                    <li key={b}>
                      <CheckCircle2 aria-hidden /> {b}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {ev.media && ev.media.length > 0 && (
              <section>
                <h2 className={s.h2}>
                  <Images aria-hidden style={{ width: 20, height: 20 }} />
                  Event photos
                </h2>
                <div className={s.media}>
                  {ev.media.map((m, i) => (
                    <motion.button key={i} type="button" className={s.mediaItem} onClick={() => setViewer(i)} whileTap={{ scale: 0.97 }} aria-label={`Open photo ${i + 1} of ${ev.media!.length}`}>
                      <Scene scene={m} aspect="square" style={{ position: 'absolute', inset: 0 }} />
                    </motion.button>
                  ))}
                </div>
              </section>
            )}
          </motion.div>
          <AnimatePresence>{viewer !== null && ev.media && <MediaViewer items={ev.media} index={viewer} onIndex={setViewer} onClose={() => setViewer(null)} />}</AnimatePresence>
          <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} title={ev.title} url={url} />
        </>
      )}
    </Screen>
  );
}
