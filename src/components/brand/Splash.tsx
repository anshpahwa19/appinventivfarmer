import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '@/lib/theme';
import { getStatusTone, setStatusTone } from '@/lib/statusTone';
import { logoUrl } from './Logo';
import s from './Splash.module.css';

function Content({ duration }: { duration: number }) {
  useEffect(() => {
    const prev = getStatusTone();
    setStatusTone('dark');
    return () => setStatusTone(prev);
  }, []);
  return (
    <>
      <motion.img
        src={logoUrl}
        alt="Kisani Urjaa: From Waste to Wealth, for Farmers’ Health"
        className={s.logo}
        initial={{ opacity: 0, scale: 0.86, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 160, damping: 18, delay: 0.1 }}
        draggable={false}
      />
      <div className={s.bar} role="progressbar" aria-label="Loading">
        <motion.div className={s.fill} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: duration / 1000 - 0.2, ease: [0.4, 0, 0.2, 1] }} />
      </div>
      <motion.p className={s.foot} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        Made for farmers of India
      </motion.p>
    </>
  );
}

/** Launch screen with the client logo; fades into the app. Tap to skip. */
export function Splash() {
  const reduced = useReducedMotion();
  const duration = reduced ? 700 : 1900;
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(t);
  }, [duration]);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={s.splash}
          onClick={() => setShow(false)}
          initial={false}
          exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } }}
          data-testid="splash"
        >
          <Content duration={duration} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
