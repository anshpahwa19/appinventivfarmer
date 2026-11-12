import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useUI } from '@/app/providers';
import s from './TabBar.module.css';

export const TAB_ROOTS = ['/home', '/learn', '/orders', '/account'];

type GlyphName = 'home' | 'learn' | 'requests' | 'account';

/**
 * Nav glyphs: an outline at rest, a solid shape when selected. Inner details
 * (the door, the book's spine, the box seams) show as cut-outs in the
 * selected pill's colour.
 */
function Glyph({ name, active }: { name: GlyphName; active: boolean }) {
  const shape = { fill: active ? 'currentColor' : 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  const detail = { fill: 'none', stroke: active ? 'var(--tonal)' : 'currentColor', strokeWidth: 2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  switch (name) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M3.5 10.4 12 3.8l8.5 6.6v8.6a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5Z" {...shape} />
          <path d="M9.5 20.4v-5.2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5.2" {...detail} />
        </svg>
      );
    case 'learn':
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M12 6.6C10 5 7.2 4.4 3.5 4.8v13.4c3.7-.4 6.5.2 8.5 1.8 2-1.6 4.8-2.2 8.5-1.8V4.8C16.8 4.4 14 5 12 6.6Z" {...shape} />
          <path d="M12 6.6V20" {...detail} />
        </svg>
      );
    case 'requests':
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M3.5 8 12 3.5 20.5 8v8L12 20.5 3.5 16Z" {...shape} />
          <path d="M3.9 8.2 12 12.5l8.1-4.3M12 12.5v7.6" {...detail} />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="8" r="4" {...shape} />
          <path d="M4.5 20.5c.9-3.9 3.8-6 7.5-6s6.6 2.1 7.5 6Z" {...shape} />
        </svg>
      );
  }
}

const TABS: { to: string; label: string; glyph: GlyphName }[] = [
  { to: '/home', label: 'Home', glyph: 'home' },
  { to: '/learn', label: 'Learn', glyph: 'learn' },
  { to: '/orders', label: 'Requests', glyph: 'requests' },
  { to: '/account', label: 'Account', glyph: 'account' },
];

export function isTabRoot(pathname: string) {
  return TAB_ROOTS.includes(pathname);
}

export function TabBar() {
  const { pathname } = useLocation();
  const { openCreate, createOpen } = useUI();
  const visible = isTabRoot(pathname);
  const renderTab = (t: (typeof TABS)[number]) => {
    const active = pathname === t.to;
    return (
      <Link key={t.to} to={t.to} replace className={`${s.tab} ${active ? s.active : ''}`} aria-current={active ? 'page' : undefined}>
        {active && <motion.span layoutId="tab-pill" className={s.pill} transition={{ type: 'spring', stiffness: 520, damping: 40 }} />}
        <motion.span style={{ display: 'grid', position: 'relative', zIndex: 1 }} animate={active ? { scale: [1, 1.22, 1], y: [0, -3, 0] } : { scale: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
          <Glyph name={t.glyph} active={active} />
        </motion.span>
        <span>{t.label}</span>
      </Link>
    );
  };
  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.nav
          className={s.wrap}
          aria-label="Main"
          initial={{ y: 110, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 110, opacity: 0, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }}
          transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        >
          <div className={s.bar}>
            {TABS.slice(0, 2).map(renderTab)}
            <div className={s.createWrap}>
              <motion.button type="button" whileTap={{ scale: 0.88 }} whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 500, damping: 22 }} className={`${s.create} ${createOpen ? s.createOpen : ''}`} onClick={openCreate} aria-label="Create: new order, booking or field" aria-haspopup="dialog" aria-expanded={createOpen}>
                <Plus aria-hidden strokeWidth={2.6} />
              </motion.button>
            </div>
            {TABS.slice(2).map(renderTab)}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
