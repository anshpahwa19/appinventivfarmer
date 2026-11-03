import { useEffect, useState } from 'react';
import { useStatusToneValue } from '@/lib/statusTone';
import { useResolvedTheme } from '@/lib/theme';
import s from './StatusBar.module.css';

function clock() {
  const d = new Date();
  const h = d.getHours() % 12 || 12;
  return `${h}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Simulated iPhone status bar, Dynamic Island and home indicator (device mock-up only). */
export function StatusBar() {
  const tone = useStatusToneValue();
  const theme = useResolvedTheme();
  const [time, setTime] = useState(clock);
  useEffect(() => {
    const t = setInterval(() => setTime(clock()), 15_000);
    return () => clearInterval(t);
  }, []);
  const color = tone === 'light' || theme === 'dark' ? '#ffffff' : '#0b0b0c';
  return (
    <>
      <div className={s.bar} style={{ color }} aria-hidden>
        <span className={s.time}>{time}</span>
        <span className={s.icons}>
          <svg width="18" height="12" viewBox="0 0 18 12" fill={color}>
            <rect x="0" y="8" width="3" height="4" rx="1" />
            <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
            <rect x="10" y="3" width="3" height="9" rx="1" />
            <rect x="15" y="0" width="3" height="12" rx="1" />
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill={color}>
            <path d="M8 2.2c2.4 0 4.6.9 6.3 2.5l1.3-1.3C13.5 1.3 10.9.3 8 .3S2.5 1.3.4 3.4l1.3 1.3C3.4 3.1 5.6 2.2 8 2.2z" />
            <path d="M8 5.8c1.4 0 2.7.5 3.7 1.4l1.3-1.3C11.6 4.6 9.9 3.9 8 3.9s-3.6.7-5 2l1.3 1.3c1-.9 2.3-1.4 3.7-1.4z" />
            <path d="M8 9.3c.5 0 1 .2 1.3.5L8 11.7 6.7 9.8c.3-.3.8-.5 1.3-.5z" />
          </svg>
          <svg width="27" height="13" viewBox="0 0 27 13">
            <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" fill="none" stroke={color} strokeOpacity="0.4" />
            <rect x="2" y="2" width="17" height="9" rx="2.4" fill={color} />
            <path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2z" fill={color} fillOpacity="0.45" />
          </svg>
        </span>
      </div>
      <div className={s.island} aria-hidden>
        <span className={s.lens} />
      </div>
      <div className={s.home} style={{ background: color === '#ffffff' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.82)' }} aria-hidden />
    </>
  );
}
