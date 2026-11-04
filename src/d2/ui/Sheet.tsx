import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls, type PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import s from './Sheet.module.css';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  kicker?: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** Short confirmation: a floating card instead of a full sheet. */
  variant?: 'sheet' | 'dialog';
  icon?: ReactNode;
  tone?: 'neutral' | 'warning' | 'danger' | 'success';
  hideTitle?: boolean;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function overlayRoot(): HTMLElement {
  return document.getElementById('fj-overlay') ?? document.body;
}

export function Sheet(props: SheetProps) {
  return createPortal(<AnimatePresence>{props.open && <Inner {...props} />}</AnimatePresence>, overlayRoot());
}

function Inner({ onClose, title, kicker, description, children, footer, variant = 'sheet', icon, tone = 'neutral', hideTitle }: SheetProps) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const drag = useDragControls();
  const dialog = variant === 'dialog';

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const node = ref.current;
    (node?.querySelector<HTMLElement>('[data-autofocus]') ?? node)?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
      if (e.key === 'Tab' && node) {
        const items = [...node.querySelectorAll<HTMLElement>(FOCUSABLE)];
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 650) onClose();
  };

  return (
    <div className={s.layer}>
      <motion.div className={s.backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.24 }} onClick={onClose} aria-hidden />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-t`}
        aria-describedby={description ? `${id}-d` : undefined}
        tabIndex={-1}
        className={`${s.panel} ${dialog ? s.dialog : ''}`}
        initial={{ y: '100%' }}
        animate={{ y: 0, transition: { duration: 0.46, ease: [0.16, 1, 0.3, 1] } }}
        exit={{ y: '110%', transition: { duration: 0.28, ease: [0.65, 0, 0.35, 1] } }}
        drag={dialog ? false : 'y'}
        dragControls={drag}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={onDragEnd}
      >
        {!dialog && <div className={s.grab} onPointerDown={(e) => drag.start(e)} aria-hidden />}
        <header className={`${s.head} ${hideTitle ? 'sr-only' : ''}`}>
          {icon && <span className={`${s.icon} ${s[`t_${tone}`]}`}>{icon}</span>}
          <div className={s.headText}>
            {kicker && <p className={s.kicker}>{kicker}</p>}
            <h2 id={`${id}-t`} className={s.title}>
              {title}
            </h2>
            {description && (
              <p id={`${id}-d`} className={s.desc}>
                {description}
              </p>
            )}
          </div>
          {!dialog && (
            <button type="button" className={s.close} onClick={onClose} aria-label="Close">
              <X aria-hidden />
            </button>
          )}
        </header>
        {hideTitle && !dialog && (
          <button type="button" className={`${s.close} ${s.closeFloat}`} onClick={onClose} aria-label="Close">
            <X aria-hidden />
          </button>
        )}
        {children && <div className={s.body}>{children}</div>}
        {footer && <div className={s.footer}>{footer}</div>}
      </motion.div>
    </div>
  );
}
