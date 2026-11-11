import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useStore } from '@/services/store';
import { useStatusToneValue } from '@/lib/statusTone';
import { DeskBrand } from '@/app/DeskBrand';
import s from './D2Frame.module.css';

const DEVICE_W = 425;
const DEVICE_H = 884;

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

function useDevice() {
  const calc = () => {
    if (typeof window === 'undefined') return { on: false, scale: 1 };
    const w = window.innerWidth;
    const h = window.innerHeight;
    const on = w >= 500 && h >= 520;
    const aside = w >= 1040 ? 400 : 0;
    return { on, scale: Math.min(1, (h - 48) / DEVICE_H, (w - 48 - aside) / DEVICE_W) };
  };
  const [state, setState] = useState(calc);
  useEffect(() => {
    const on = () => setState(calc());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return state;
}

function clock() {
  const d = new Date();
  return `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Simulated status bar for the device mock-up. */
function StatusBar() {
  const tone = useStatusToneValue();
  const [time, setTime] = useState(clock);
  useEffect(() => {
    const t = setInterval(() => setTime(clock()), 15_000);
    return () => clearInterval(t);
  }, []);
  const light = tone === 'light';
  const c = light ? '#ffffff' : '#0a1128';
  return (
    <>
      <div className={s.status} style={{ color: c }} aria-hidden>
        <span className={s.time}>{time}</span>
        <span className={s.icons}>
          <svg width="18" height="12" viewBox="0 0 18 12" fill={c}>
            <rect x="0" y="8" width="3" height="4" rx="1" />
            <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
            <rect x="10" y="3" width="3" height="9" rx="1" />
            <rect x="15" y="0" width="3" height="12" rx="1" />
          </svg>
          <svg width="27" height="13" viewBox="0 0 27 13">
            <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" fill="none" stroke={c} strokeOpacity="0.4" />
            <rect x="2" y="2" width="17" height="9" rx="2.4" fill={c} />
          </svg>
        </span>
      </div>
      <div className={s.island} aria-hidden />
      <div className={s.home} style={{ background: light ? 'rgba(255,255,255,0.85)' : 'rgba(10,17,40,0.85)' }} aria-hidden />
    </>
  );
}


export function D2Frame({ children }: { children: ReactNode }) {
  const online = useOnline();
  const demoOffline = useStore((st) => st.demo.network === 'offline');
  const offline = !online || demoOffline;
  const device = useDevice();

  const inner = (
    <>
      {children}
      <AnimatePresence>
        {offline && (
          <motion.div className={s.offline} role="status" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <WifiOff aria-hidden /> Offline · saved data
          </motion.div>
        )}
      </AnimatePresence>
      <div id="fj-overlay" className={s.overlay} />
    </>
  );

  if (!device.on) {
    return (
      <div className={`fj ${s.desk}`}>
        <div className={s.frame} id="fj-frame">
          {inner}
        </div>
      </div>
    );
  }

  return (
    <div className={`fj ${s.desk} ${s.deviceDesk}`}>
      <DeskBrand />
      <div className={s.stage} style={{ width: DEVICE_W * device.scale, height: DEVICE_H * device.scale }}>
        <motion.div className={s.device} style={{ scale: device.scale, originX: 0, originY: 0 }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div className={s.screen} id="fj-frame">
            {inner}
            <StatusBar />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export { s as frameStyles };
