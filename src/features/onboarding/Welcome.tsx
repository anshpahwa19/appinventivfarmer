import { useStatusTone } from '@/lib/statusTone';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { SceneSpec } from '@/types';
import { Scene } from '@/components/media/Scene';
import { Button } from '@/components/ui/Button';
import { LogoPlate } from '@/components/brand/Logo';
import { actions } from '@/services/store';
import { Sheet } from '@/components/ui/Sheet';
import { LanguageButton, LanguagePicker } from '@/components/home/LanguageSwitch';
import { useHomeT } from '@/i18n/home';
import homeS from '@/features/home/Home.module.css';
import s from './Onboarding.module.css';

const SLIDES: { kicker: string; title: string; text: string; scene: SceneSpec }[] = [
  {
    kicker: 'Kisani Urjaa',
    title: 'Your farm, in one place',
    text: 'See your fields, crops and season records, kept up to date by your Kisani Didi.',
    scene: { kind: 'paddy', seed: 14, time: 'dawn' },
  },
  {
    kicker: 'Orders & bookings',
    title: 'Order and book in a few taps',
    text: 'Order FOM manure and book field services. Follow every request until it’s done.',
    scene: { kind: 'harvest', seed: 23, time: 'golden' },
  },
  {
    kicker: 'Weather & advice',
    title: 'Advice for your village, every day',
    text: 'Spray advice from the local forecast, farming tips, videos and workshops near you.',
    scene: { kind: 'village', seed: 8, time: 'morning' },
  },
];

export default function Welcome() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  useStatusTone('light');
  const last = index === SLIDES.length - 1;

  const finish = useCallback(() => {
    actions.completeOnboarding();
    navigate('/auth', { replace: true });
  }, [navigate]);

  const go = useCallback((i: number) => setIndex(Math.max(0, Math.min(SLIDES.length - 1, i))), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(index + 1);
      if (e.key === 'ArrowLeft') go(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, go]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) go(index + 1);
    else if (info.offset.x > 60 || info.velocity.x > 400) go(index - 1);
  };

  const t = useHomeT();
  const [langOpen, setLangOpen] = useState(false);
  const slide = SLIDES[index];

  return (
    <div className={s.welcome}>
      <AnimatePresence initial={false}>
        <motion.div key={index} className={s.slide} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <Scene scene={slide.scene} aspect="tall" detail="high" drift style={{ position: 'absolute', inset: 0 }} />
        </motion.div>
      </AnimatePresence>
      <div className={s.scrim} aria-hidden />
      <motion.div className={s.drag} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.12} onDragEnd={onDragEnd} aria-hidden />

      <div className={s.top}>
        <LogoPlate size={44} name light />
        <div className={s.topActions}>
          <span className={homeS.tokens}>
            <LanguageButton t={t} variant="pill" onOpen={() => setLangOpen(true)} />
          </span>
          {!last && (
            <button type="button" className={s.skip} onClick={finish}>
              Skip
            </button>
          )}
        </div>
      </div>

      <div className={s.panel}>
        <div className={s.progress} role="tablist" aria-label="Introduction steps">
          {SLIDES.map((_, i) => (
            <button key={i} type="button" role="tab" aria-selected={i === index} aria-label={`Step ${i + 1} of ${SLIDES.length}`} className={s.progressBar} onClick={() => go(i)}>
              <motion.span className={s.progressFill} initial={false} animate={{ scaleX: i <= index ? 1 : 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} />
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={index} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }} aria-live="polite">
            <p className={s.kicker}>{slide.kicker}</p>
            <h1 className={s.headline}>{slide.title}</h1>
            <p className={s.lede}>{slide.text}</p>
          </motion.div>
        </AnimatePresence>

        <div className={s.ctaRow}>
          <Button size="lg" block className={s.light} iconRight={<ArrowRight aria-hidden />} onClick={() => (last ? finish() : go(index + 1))}>
            {last ? 'Get started' : 'Next'}
          </Button>
        </div>
      </div>
      <Sheet open={langOpen} onClose={() => setLangOpen(false)} title={t.languagePicker.title} description={t.contentLang === 'en' ? undefined : 'Choose your language'}>
        <div className={`${homeS.tokens} ${homeS.home}`} lang={t.contentLang}>
          <LanguagePicker t={t} variant="cards" onDone={() => setLangOpen(false)} />
        </div>
      </Sheet>
    </div>
  );
}
