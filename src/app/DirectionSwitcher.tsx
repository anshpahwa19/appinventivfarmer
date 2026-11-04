import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fromD2, isD2Path, to } from '@/d2/paths';
import s from './DirectionSwitcher.module.css';

/** Routes that only exist in Direction 02, and where Direction 01 shows the same content. */
const D1_EQUIVALENT: Record<string, string> = { '/search': '/learn' };

export function counterpartPath(pathname: string): string {
  if (isD2Path(pathname)) {
    const p = fromD2(pathname);
    return D1_EQUIVALENT[p] ?? p;
  }
  return to(pathname);
}

function useDesk() {
  const calc = () => typeof window !== 'undefined' && window.innerWidth >= 500 && window.innerHeight >= 520;
  const [on, setOn] = useState(calc);
  useEffect(() => {
    const f = () => setOn(calc());
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);
  return on;
}

/**
 * Review control shown beside the device mock-up: opens the same screen in the
 * other design direction. On phones the switch lives in Account / Me.
 */
export function DirectionSwitcher() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const desk = useDesk();
  if (!desk) return null;
  const d2 = isD2Path(pathname);
  const go = (wantD2: boolean) => {
    if (wantD2 === d2) return;
    navigate(counterpartPath(pathname) + search);
  };
  return (
    <nav className={`${s.switcher} ${d2 ? s.onD2 : ''}`} aria-label="Design direction">
      <span className={s.caption}>Design direction</span>
      <div className={s.track}>
        <button type="button" aria-pressed={!d2} className={!d2 ? s.on : ''} onClick={() => go(false)}>
          01 · Illustrated
        </button>
        <button type="button" aria-pressed={d2} className={d2 ? s.on : ''} onClick={() => go(true)}>
          02 · Field Journal
        </button>
      </div>
    </nav>
  );
}
