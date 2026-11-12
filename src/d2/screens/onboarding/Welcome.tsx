import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useStatusTone } from '@/lib/statusTone';
import markUrl from '@/assets/brand/kisani-urjaa-mark.webp';
import { Photo } from '../../photo/Photo';
import { RevealText } from '../../motion/Reveal';
import { FjLottie } from '../../lottie/Lottie';
import type { AnimationName } from '../../lottie/animations';
import { useNav } from '../../nav';
import s from './Onboarding.module.css';

const SLIDES: { photo: string; section: string; title: string; text: string; anim: AnimationName }[] = [
  { photo: 'dawn-field', section: 'Your farm', title: 'Your whole farm, in one journal', text: 'Fields, crops and season records, kept up to date by your Kisani Didi.', anim: 'sprout' },
  { photo: 'village-delivery', section: 'Orders & bookings', title: 'Order and book in a few taps', text: 'Order FOM manure and book straw clearing. Follow every request until it’s done.', anim: 'crate' },
  { photo: 'mustard-field', section: 'Weather & advice', title: 'Advice for your village, every day', text: 'Spray advice from the local forecast, plus stories, videos and workshops near you.', anim: 'weather' },
];

const R = 30;
const CIRC = 2 * Math.PI * R;

export default function Welcome() {
  const nav = useNav();
  const [i, setI] = useState(0);
  useStatusTone('light');
  const last = i === SLIDES.length - 1;
  const finish = useCallback(() => {
    // Next: a dedicated page to choose the app language (it completes onboarding).
    nav('/welcome/language');
  }, [nav]);
  const go = useCallback((n: number) => setI(Math.max(0, Math.min(SLIDES.length - 1, n))), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(i + 1);
      if (e.key === 'ArrowLeft') go(i - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [i, go]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) go(i + 1);
    else if (info.offset.x > 60 || info.velocity.x > 400) go(i - 1);
  };
  const slide = SLIDES[i];

  return (
    <div className={`${s.cover}`}>
      <AnimatePresence initial={false}>
        <motion.div key={i} className={s.coverPhoto} initial={{ clipPath: 'inset(0 0 0 100%)' }} animate={{ clipPath: 'inset(0 0 0 0%)' }} exit={{ opacity: 1 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          <Photo id={slide.photo} ratio="fill" shade="full" drift priority label="hero" />
        </motion.div>
      </AnimatePresence>
      <motion.div className={s.drag} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.1} onDragEnd={onDragEnd} aria-hidden />

      <div className={s.coverTop}>
        <span className={s.plate}>
          <img src={markUrl} alt="Kisani Urjaa" />
        </span>
        <span className={s.issue}>
          No. {String(i + 1).padStart(2, '0')} <span>/ 0{SLIDES.length}</span>
        </span>
        {!last ? (
          <button type="button" className={s.skip} onClick={finish}>
            Skip
          </button>
        ) : (
          <span className={s.skipSpacer} />
        )}
      </div>

      <div className={s.coverBottom}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={i} exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }} aria-live="polite">
            <div className={s.emblem}>
              <FjLottie name={slide.anim} size={64} night loop={false} />
            </div>
            <motion.p className={s.section} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
              {slide.section}
            </motion.p>
            <RevealText text={slide.title} className={s.coverTitle} delay={0.2} />
            <motion.p className={s.coverLede} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.6 }}>
              {slide.text}
            </motion.p>
          </motion.div>
        </AnimatePresence>
        <div className={s.coverNav}>
          <div className={s.dots} role="tablist" aria-label="Introduction pages">
            {SLIDES.map((_, n) => (
              <button key={n} type="button" role="tab" aria-selected={n === i} aria-label={`Page ${n + 1} of ${SLIDES.length}`} className={`${s.dot} ${n === i ? s.dotOn : ''}`} onClick={() => go(n)} />
            ))}
          </div>
          <motion.button type="button" whileTap={{ scale: 0.92 }} className={`${s.next} ${last ? s.nextWide : ''}`} onClick={() => (last ? finish() : go(i + 1))} aria-label={last ? 'Get started' : 'Next page'}>
            <svg className={s.ring} viewBox="0 0 72 72" aria-hidden>
              <circle cx="36" cy="36" r={R} className={s.ringTrack} />
              <motion.circle cx="36" cy="36" r={R} className={s.ringFill} strokeDasharray={CIRC} animate={{ strokeDashoffset: CIRC * (1 - (i + 1) / SLIDES.length) }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} />
            </svg>
            {last && <span className={s.nextLabel}>Get started</span>}
            <ArrowRight aria-hidden />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
