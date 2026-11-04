import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useStore } from '@/services/store';
import { StatusBar } from '@/components/layout/StatusBar';
import { DeskBrand } from './DeskBrand';
import s from './AppFrame.module.css';

const DEVICE_W = 433;
const DEVICE_H = 892;

function useOnline() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

/** On anything wider than a phone, show the app inside an iPhone 15 Pro, scaled to fit. */
function useDevice() {
  const calc = () => {
    if (typeof window === 'undefined') return { on: false, scale: 1 };
    const w = window.innerWidth;
    const h = window.innerHeight;
    const on = w >= 500 && h >= 520;
    const asideRoom = w >= 1040 ? 384 : 0;
    const scale = Math.min(1, (h - 40) / DEVICE_H, (w - 40 - asideRoom) / DEVICE_W);
    return { on, scale };
  };
  const [state, setState] = useState(calc);
  useEffect(() => {
    const on = () => setState(calc());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return state;
}


export function AppFrame({ children }: { children: ReactNode }) {
  const online = useOnline();
  const demoOffline = useStore((st) => st.demo.network === 'offline');
  const offline = !online || demoOffline;
  const device = useDevice();

  const inner = (
    <>
      {children}
      <AnimatePresence>
        {offline && (
          <motion.div className={s.offline} role="status" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <WifiOff aria-hidden /> Offline
          </motion.div>
        )}
      </AnimatePresence>
      <div id="overlay-root" className={s.overlay} />
    </>
  );

  if (!device.on) {
    return (
      <div className={s.desk}>
        <div className={s.frame} id="app-frame">
          {inner}
        </div>
      </div>
    );
  }

  return (
    <div className={`${s.desk} ${s.deviceDesk}`}>
      <DeskBrand />
      <div className={s.stage} style={{ width: DEVICE_W * device.scale, height: DEVICE_H * device.scale }}>
        <motion.div
          className={s.device}
          style={{ scale: device.scale, originX: 0, originY: 0 }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className={`${s.btn} ${s.btnLeft}`} style={{ top: 168, height: 34 }} aria-hidden />
          <span className={`${s.btn} ${s.btnLeft}`} style={{ top: 236, height: 64 }} aria-hidden />
          <span className={`${s.btn} ${s.btnLeft}`} style={{ top: 314, height: 64 }} aria-hidden />
          <span className={`${s.btn} ${s.btnRight}`} style={{ top: 262, height: 104 }} aria-hidden />
          <div className={s.bezel}>
            <div className={s.screen} id="app-frame">
              {inner}
              <StatusBar />
              <div className={s.glare} aria-hidden />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export { s as frameStyles };
