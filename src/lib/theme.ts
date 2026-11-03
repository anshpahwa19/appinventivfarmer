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

/** Theme actually in effect: app preference, then host/system. */
export function useResolvedTheme(): 'light' | 'dark' {
  const pref = useStore((s) => s.prefs.theme);
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [hostTheme, setHostTheme] = useState<string | null>(() => (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : null));
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => setHostTheme(el.getAttribute('data-theme')));
    obs.observe(el, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  if (pref !== 'system') return pref;
  if (hostTheme === 'dark' || hostTheme === 'light') return hostTheme;
  return systemDark ? 'dark' : 'light';
}

/** True when the user asked for less motion (OS setting or in-app Display setting). */
export function useReducedMotion(): boolean {
  const pref = useStore((s) => s.prefs.motion);
  const system = useMediaQuery('(prefers-reduced-motion: reduce)');
  return pref === 'reduce' || system;
}
