import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useStore } from '@/services/store';
import { isTabRoot, to } from '../paths';
import { useUI } from '../providers';
import s from './Dock.module.css';

/* Custom two-weight glyphs: an outline at rest, a filled lime form when active. */
function Glyph({ name, active }: { name: 'today' | 'journal' | 'orders' | 'me'; active: boolean }) {
  const stroke = 'currentColor';
  const fill = active ? 'var(--fj-lime-400)' : 'none';
  const common = { fill: 'none', stroke, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'today':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
          <circle cx="12" cy="10" r="4.2" fill={fill} stroke={active ? 'none' : stroke} strokeWidth={2} />
          <path d="M3 19h18M6 15.5h12" {...common} />
        </svg>
      );
    case 'journal':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
          <rect x="4" y="3.5" width="16" height="17" rx="3" fill={fill} stroke={active ? 'none' : stroke} strokeWidth={2} />
          <path d="M8 8.5h8M8 12h8M8 15.5h5" {...common} stroke={active ? 'var(--fj-midnight)' : stroke} />
        </svg>
      );
    case 'orders':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
          <path d="M3.5 8 12 3.5 20.5 8v8L12 20.5 3.5 16Z" fill={fill} stroke={active ? 'none' : stroke} strokeWidth={2} strokeLinejoin="round" />
          <path d="M3.8 8.2 12 12.5l8.2-4.3M12 12.5v8" {...common} stroke={active ? 'var(--fj-midnight)' : stroke} />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
          <circle cx="12" cy="8.5" r="4" fill={fill} stroke={active ? 'none' : stroke} strokeWidth={2} />
          <path d="M4.5 20c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" {...common} />
        </svg>
      );
  }
}

const TABS = [
  { path: '/home', label: 'Today', glyph: 'today' as const },
  { path: '/learn', label: 'Journal', glyph: 'journal' as const },
  { path: '/orders', label: 'Orders', glyph: 'orders' as const },
  { path: '/account', label: 'Me', glyph: 'me' as const },
];

/**
 * Direction 02 navigation: a dock fixed to the bottom edge. Four labelled
 * destinations sit left; the create action is anchored right, where a
 * right thumb rests, as its own lime key.
 */
export function Dock() {
  const { pathname } = useLocation();
  const { openCreate, createOpen } = useUI();
  const unread = useStore((st) => st.unreadNotifications.length);
  const visible = isTabRoot(pathname);
  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.nav className={s.dock} aria-label="Main" initial={{ y: '110%' }} animate={{ y: 0 }} exit={{ y: '110%', transition: { duration: 0.22, ease: [0.65, 0, 0.35, 1] } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <div className={s.tabs}>
            {TABS.map((t) => {
              const href = to(t.path);
              const active = pathname === href;
              return (
                <Link key={t.path} to={href} replace className={`${s.tab} ${active ? s.active : ''}`} aria-current={active ? 'page' : undefined}>
                  {active && <motion.span layoutId="fj-dock-bar" className={s.bar} transition={{ type: 'spring', stiffness: 480, damping: 38 }} />}
                  <motion.span className={s.glyph} animate={active ? { y: [0, -3, 0] } : { y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                    <Glyph name={t.glyph} active={active} />
                    {t.path === '/account' && unread > 0 && <span className={s.dot} aria-hidden />}
                  </motion.span>
                  <span className={s.label}>{t.label}</span>
                </Link>
              );
            })}
          </div>
          <span className={s.divider} aria-hidden />
          <motion.button type="button" className={`${s.create} ${createOpen ? s.createOpen : ''}`} whileTap={{ scale: 0.9 }} onClick={openCreate} aria-haspopup="dialog" aria-expanded={createOpen} aria-label="New: order FOM, book a service or add a field">
            <motion.span animate={{ rotate: createOpen ? 45 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }} style={{ display: 'grid' }}>
              <Plus aria-hidden strokeWidth={2.6} />
            </motion.span>
            <span className={s.createLabel}>New</span>
          </motion.button>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
