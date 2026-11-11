import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, House, Package, Plus, UserRound } from 'lucide-react';
import { useUI } from '@/app/providers';
import s from './TabBar.module.css';

export const TAB_ROOTS = ['/home', '/learn', '/orders', '/account'];

const TABS = [
  { to: '/home', label: 'Home', Icon: House },
  { to: '/learn', label: 'Learn', Icon: BookOpen },
  { to: '/orders', label: 'Requests', Icon: Package },
  { to: '/account', label: 'Account', Icon: UserRound },
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
          <t.Icon aria-hidden strokeWidth={active ? 2.4 : 2} />
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
