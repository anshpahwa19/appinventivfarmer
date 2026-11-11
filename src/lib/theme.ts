import { useEffect, useState } from 'react';
import { useStore } from '@/services/store';

function mq(query: string): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(query).matches;
}

function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(() => mq(query));
  useEffect(() => {
    if (!window.matchMedia) return;
    const m = window.matchMedia(query);
    const on = () => setMatch(m.matches);
    on();
    m.addEventListener?.('change', on);
    return () => m.removeEventListener?.('change', on);
  }, [query]);
  return match;
}

/** True when the user asked for less motion (the phone's setting, or a saved in-app preference). */
export function useReducedMotion(): boolean {
  const pref = useStore((s) => s.prefs.motion);
  const system = useMediaQuery('(prefers-reduced-motion: reduce)');
  return pref === 'reduce' || system;
}
