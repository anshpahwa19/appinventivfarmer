import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, Info } from 'lucide-react';
import s from './Toast.module.css';

export interface ToastOptions {
  message: string;
  tone?: 'success' | 'error' | 'info';
  action?: { label: string; onClick: () => void };
  duration?: number;
}

interface Item extends ToastOptions {
  id: number;
}

const Ctx = createContext<(t: ToastOptions) => void>(() => {});
export const useToast = () => useContext(Ctx);

const ICON = { success: Check, error: AlertTriangle, info: Info };

/** Direction 02 toasts: a night-ink strip with a timer line. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const next = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const [root, setRoot] = useState<HTMLElement | null>(null);
  useEffect(() => setRoot(document.getElementById('fj-overlay')), []);

  const dismiss = useCallback((id: number) => {
    setItems((l) => l.filter((t) => t.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const show = useCallback(
    (t: ToastOptions) => {
      const id = next.current++;
      const duration = t.duration ?? (t.action ? 6000 : 3800);
      setItems((l) => [...l.slice(-1), { ...t, id, duration }]);
      timers.current.set(id, setTimeout(() => dismiss(id), duration));
    },
    [dismiss],
  );
  const value = useMemo(() => show, [show]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {root &&
        createPortal(
          <div className={s.region} role="status" aria-live="polite">
            <AnimatePresence initial={false}>
              {items.map((t) => {
                const tone = t.tone ?? 'success';
                const Icon = ICON[tone];
                return (
                  <motion.div key={t.id} layout className={`${s.toast} ${s[tone]}`} initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, transition: { duration: 0.18 } }} transition={{ type: 'spring', stiffness: 420, damping: 34 }}>
                    <span className={s.icon} aria-hidden>
                      <Icon />
                    </span>
                    <span className={s.msg}>{t.message}</span>
                    {t.action && (
                      <button
                        type="button"
                        className={s.action}
                        onClick={() => {
                          t.action!.onClick();
                          dismiss(t.id);
                        }}
                      >
                        {t.action.label}
                      </button>
                    )}
                    <motion.span className={s.timer} initial={{ scaleX: 1 }} animate={{ scaleX: 0 }} transition={{ duration: (t.duration ?? 3800) / 1000, ease: 'linear' }} aria-hidden />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>,
          root,
        )}
    </Ctx.Provider>
  );
}
