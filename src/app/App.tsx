import { Suspense, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { HashRouter, MemoryRouter, useLocation, useNavigationType } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion, type Variants } from 'framer-motion';
import { AppFrame, frameStyles } from './AppFrame';
import { AppRoutes, prefetchScreens } from './routes';
import { UIProvider } from './providers';
import { ToastProvider } from '@/components/ui/Toast';
import { TabBar, isTabRoot } from '@/components/layout/TabBar';
import { useStore } from '@/services/store';
import { useReducedMotion } from '@/lib/theme';
import { readSession, writeSession } from '@/lib/storage';

const IS_DEMO = import.meta.env.MODE === 'demo';
const ROUTE_KEY = 'kisani-urjaa:route';

/** Applies display preferences to <html> so CSS tokens respond. */
function usePreferenceAttributes() {
  const prefs = useStore((st) => st.prefs);
  useEffect(() => {
    const el = document.documentElement;
    if (IS_DEMO) el.setAttribute('data-host', 'artifact');
    if (prefs.theme === 'system') {
      if (el.getAttribute('data-theme-owner') === 'app') {
        el.removeAttribute('data-theme');
        el.removeAttribute('data-theme-owner');
      }
    } else {
      el.setAttribute('data-theme', prefs.theme);
      el.setAttribute('data-theme-owner', 'app');
    }
    if (prefs.text === 'large') el.setAttribute('data-text', 'large');
    else el.removeAttribute('data-text');
    if (prefs.motion === 'reduce') el.setAttribute('data-motion', 'reduce');
    else el.removeAttribute('data-motion');
  }, [prefs]);
}

type Direction = 'forward' | 'back' | 'fade';

const variants: Variants = {
  enter: (d: Direction) => (d === 'forward' ? { x: 56, opacity: 0, zIndex: 2 } : d === 'back' ? { x: -32, opacity: 0, zIndex: 1 } : { opacity: 0, scale: 0.995, zIndex: 2 }),
  center: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] } },
  exit: (d: Direction) =>
    d === 'forward'
      ? { x: -32, opacity: 0, zIndex: 1, transition: { duration: 0.24, ease: [0.4, 0, 1, 1] } }
      : d === 'back'
        ? { x: 56, opacity: 0, zIndex: 2, transition: { duration: 0.26, ease: [0.4, 0, 1, 1] } }
        : { opacity: 0, zIndex: 1, transition: { duration: 0.16 } },
};

function AnimatedRoutes() {
  const location = useLocation();
  const navType = useNavigationType();
  const prev = useRef(location.pathname);
  const from = prev.current;
  const to = location.pathname;
  const direction: Direction = from === to ? 'fade' : isTabRoot(from) && isTabRoot(to) ? 'fade' : navType === 'POP' ? 'back' : navType === 'REPLACE' ? 'fade' : 'forward';
  useLayoutEffect(() => {
    prev.current = location.pathname;
    if (IS_DEMO) writeSession(ROUTE_KEY, location.pathname + location.search);
  }, [location]);

  // Toasts sit above the tab bar on tab screens.
  useEffect(() => {
    document.getElementById('app-frame')?.style.setProperty('--toast-offset', isTabRoot(to) ? 'calc(var(--nav-clearance) + 4px)' : 'calc(20px + var(--safe-bottom))');
  }, [to]);

  return (
    <div className={frameStyles.pages}>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div key={location.pathname} className={frameStyles.page} custom={direction} variants={variants} initial="enter" animate="center" exit="exit">
          <Suspense fallback={null}>
            <AppRoutes location={location} />
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Router({ children }: { children: ReactNode }) {
  const future = { v7_startTransition: true, v7_relativeSplatPath: true };
  if (IS_DEMO)
    return (
      <MemoryRouter initialEntries={[readSession(ROUTE_KEY) ?? '/']} future={future}>
        {children}
      </MemoryRouter>
    );
  return <HashRouter future={future}>{children}</HashRouter>;
}

export function App() {
  usePreferenceAttributes();
  const reduced = useReducedMotion();
  useEffect(() => {
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500));
    idle(() => prefetchScreens());
  }, []);
  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'user'}>
      <Router>
        <AppFrame>
          <ToastProvider>
            <UIProvider>
              <AnimatedRoutes />
              <TabBar />
            </UIProvider>
          </ToastProvider>
        </AppFrame>
      </Router>
    </MotionConfig>
  );
}
