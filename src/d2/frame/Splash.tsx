import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import logoUrl from '@/assets/brand/kisani-urjaa-logo.webp';
import { useReducedMotion } from '@/lib/theme';
import { getStatusTone, setStatusTone } from '@/lib/statusTone';
import s from './Splash.module.css';

const EXPO = [0.16, 1, 0.3, 1] as const;

/**
 * Direction 02 launch: midnight field, a lime horizon line draws across,
 * then the client logo is unmasked on a white plate. Tap to skip.
 */
export function Splash() {
  const reduced = useReducedMotion();
  const duration = reduced ? 700 : 2100;
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(t);
  }, [duration]);
  useEffect(() => {
    if (!show) return;
    const prev = getStatusTone();
    setStatusTone('light');
    return () => setStatusTone(prev);
  }, [show]);
  return (
    <AnimatePresence>
      {show && (
        <motion.div className={s.splash} onClick={() => setShow(false)} initial={false} exit={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.6, ease: [0.65, 0, 0.35, 1] } }} data-testid="fj-splash">
          <motion.span className={s.horizon} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, ease: EXPO }} aria-hidden />
          <motion.div className={s.plate} initial={{ clipPath: 'inset(50% 50% 50% 50% round 34px)' }} animate={{ clipPath: 'inset(0% 0% 0% 0% round 34px)' }} transition={{ duration: 0.9, ease: EXPO, delay: 0.35 }}>
            <motion.img src={logoUrl} alt="Kisani Urjaa: From Waste to Wealth, for Farmers’ Health" className={s.logo} initial={{ scale: 1.18 }} animate={{ scale: 1 }} transition={{ duration: 1.2, ease: EXPO, delay: 0.35 }} draggable={false} />
          </motion.div>
          <motion.p className={s.line} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6, ease: EXPO }}>
            <span>Field Journal</span> · for the farmers of Maharashtra
          </motion.p>
          <div className={s.meter} role="progressbar" aria-label="Loading">
            <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: duration / 1000 - 0.2, ease: 'linear' }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
