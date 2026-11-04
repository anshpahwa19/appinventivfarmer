import { useEffect, useSyncExternalStore } from 'react';

/** Which colour the simulated iPhone status bar should use over the current screen. */
export type StatusTone = 'light' | 'dark';

let tone: StatusTone = 'dark';
const subs = new Set<() => void>();

export function setStatusTone(next: StatusTone) {
  if (next === tone) return;
  tone = next;
  subs.forEach((s) => s());
}

export function getStatusTone(): StatusTone {
  return tone;
}

export function useStatusToneValue(): StatusTone {
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => tone,
    () => tone,
  );
}

/** Screens that are not built on <Screen> declare their status bar tone with this. */
export function useStatusTone(next: StatusTone) {
  useEffect(() => setStatusTone(next), [next]);
}
