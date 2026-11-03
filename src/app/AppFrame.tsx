import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useStore } from '@/services/store';
import s from './AppFrame.module.css';

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

/** Phone-width app column. On large screens it sits in a device-like frame beside a short brief for demos. */
export function AppFrame({ children }: { children: ReactNode }) {
  const online = useOnline();
  const demoOffline = useStore((st) => st.demo.network === 'offline');
  const offline = !online || demoOffline;
  return (
    <div className={s.desk}>
      <aside className={s.aside} aria-hidden>
        <div className={s.asideBrand}>
          <svg className={s.asideMark} viewBox="0 0 64 64">
            <rect width="64" height="64" rx="16" fill="#173a29" />
            <circle cx="40" cy="22" r="8" fill="#f4c24d" />
            <path d="M14 46c8-2 14-8 18-18 1 10 6 16 18 18" fill="none" stroke="#f6f3ea" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 50h40" stroke="#5faf7a" strokeWidth="4" strokeLinecap="round" />
          </svg>
          Kisani Urjaa
        </div>
        <p className={s.asideTitle}>Farmer app, redesigned</p>
        <p className={s.asideText}>A working prototype with sample data. Everything you change is saved on this device only.</p>
        <ul className={s.asideList}>
          <li>Account → Prototype controls switches verified status, offline mode, slow network and empty states.</li>
          <li>Account → Design system shows the tokens and components.</li>
        </ul>
      </aside>
      <div className={s.frame} id="app-frame">
        {children}
        <AnimatePresence>
          {offline && (
            <motion.div className={s.offline} role="status" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <WifiOff aria-hidden /> Offline
            </motion.div>
          )}
        </AnimatePresence>
        <div id="overlay-root" className={s.overlay} />
      </div>
    </div>
  );
}

export { s as frameStyles };
