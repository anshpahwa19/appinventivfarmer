import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls, type PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import s from './Sheet.module.css';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** Centered dialog for short confirmations. */
  variant?: 'sheet' | 'dialog';
  icon?: ReactNode;
  iconTone?: { bg: string; fg: string };
  /** Hide the visible title (still announced). */
  hideTitle?: boolean;
}

function overlayRoot(): HTMLElement {
  return document.getElementById('overlay-root') ?? document.body;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Sheet(props: SheetProps) {
  return createPortal(<AnimatePresence>{props.open && <SheetInner {...props} />}</AnimatePresence>, overlayRoot());
}

function SheetInner({ onClose, title, description, children, footer, variant = 'sheet', icon, iconTone, hideTitle }: SheetProps) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const drag = useDragControls();
  const isDialog = variant === 'dialog';

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const first = node?.querySelector<HTMLElement>('[data-autofocus]') ?? node;
    first?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
      if (e.key === 'Tab' && node) {
        const items = [...node.querySelectorAll<HTMLElement>(FOCUSABLE)];
        if (!items.length) return;
        const firstEl = items[0];
        const lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
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
    <div className={`${s.layer} ${isDialog ? s.center : ''}`}>
      <motion.div className={s.backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} onClick={onClose} aria-hidden />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-t`}
        tabIndex={-1}
        className={isDialog ? s.dialog : s.sheet}
        initial={isDialog ? { opacity: 0, scale: 0.94, y: 8 } : { y: '100%' }}
        animate={isDialog ? { opacity: 1, scale: 1, y: 0 } : { y: 0 }}
        exit={isDialog ? { opacity: 0, scale: 0.96, y: 4, transition: { duration: 0.16 } } : { y: '100%', transition: { duration: 0.24, ease: [0.4, 0, 1, 1] } }}
        transition={isDialog ? { type: 'spring', stiffness: 520, damping: 36 } : { type: 'spring', stiffness: 420, damping: 40 }}
        drag={isDialog ? false : 'y'}
        dragControls={drag}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={onDragEnd}
      >
        {!isDialog && (
          <div className={s.handleZone} onPointerDown={(e) => drag.start(e)} aria-hidden>
            <span className={s.handle} />
          </div>
        )}
        {icon && (
          <span className={s.icon} style={iconTone ? { background: iconTone.bg, color: iconTone.fg } : undefined} aria-hidden>
            {icon}
          </span>
        )}
        <div className={s.header}>
          <div className={s.titles}>
            <h2 id={`${id}-t`} className={hideTitle ? 'sr-only' : s.title}>
              {title}
            </h2>
            {description && <div className={s.desc}>{description}</div>}
          </div>
          {!isDialog && (
            <button type="button" className={s.close} onClick={onClose} aria-label="Close">
              <X aria-hidden strokeWidth={2.4} />
            </button>
          )}
        </div>
        {children && <div className={s.body}>{children}</div>}
        {footer && <div className={s.footer}>{footer}</div>}
      </motion.div>
    </div>
  );
}
