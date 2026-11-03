import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import s from './Toast.module.css';

export interface ToastOptions {
  message: string;
  tone?: 'success' | 'error' | 'info';
  action?: { label: string; onClick: () => void };
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
}

const ToastContext = createContext<(t: ToastOptions) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

const ICONS = { success: CheckCircle2, error: AlertTriangle, info: Info };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const show = useCallback(
    (t: ToastOptions) => {
      const id = nextId.current++;
      setItems((list) => [...list.slice(-1), { ...t, id }]);
      timers.current.set(id, setTimeout(() => dismiss(id), t.duration ?? (t.action ? 6000 : 3800)));
    },
    [dismiss],
  );

  const value = useMemo(() => show, [show]);
  // The overlay root is rendered by the app frame; find it after mount.
  const [root, setRoot] = useState<HTMLElement | null>(null);
  useEffect(() => setRoot(document.getElementById('overlay-root')), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {root &&
        createPortal(
          <div className={s.region} role="status" aria-live="polite">
            <AnimatePresence initial={false}>
              {items.map((t) => {
                const Icon = ICONS[t.tone ?? 'success'];
                return (
                  <motion.div
                    key={t.id}
                    layout
                    className={`${s.toast} ${s[t.tone ?? 'success']}`}
                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.97, transition: { duration: 0.18 } }}
                    transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                  >
                    <Icon className={s.icon} aria-hidden />
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
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>,
          root,
        )}
    </ToastContext.Provider>
  );
}
