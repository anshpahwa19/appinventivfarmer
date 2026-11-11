import { lazy, Suspense, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { HashRouter, MemoryRouter, useLocation, useNavigationType } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion, type Variants } from 'framer-motion';
import { AppFrame, frameStyles } from './AppFrame';
import { AppRoutes, prefetchScreens } from './routes';
import { UIProvider } from './providers';
import { ToastProvider } from '@/components/ui/Toast';
import { TabBar, isTabRoot } from '@/components/layout/TabBar';
import { Splash } from '@/components/brand/Splash';
import { useStore } from '@/services/store';
import { useReducedMotion } from '@/lib/theme';
import { readSession, writeSession } from '@/lib/storage';
import { isD2Path } from '@/d2/paths';
import { DirectionSwitcher } from './DirectionSwitcher';

/** Direction 02 (/d2/*) is a separate, lazily loaded app with its own visual layer. */
const D2App = lazy(() => import('@/d2/D2App'));

const IS_DEMO = import.meta.env.MODE.startsWith('demo');
/** Phone preview build (npm run build:mobile): opened straight in a phone's browser. */
const IS_MOBILE = import.meta.env.VITE_MOBILE === '1';
/** The Direction 02 demo build opens on Direction 02. */
const START = import.meta.env.MODE === 'demo2' ? '/d2' : '/';
const ROUTE_KEY = 'kisani-urjaa:route';

/** Applies display preferences to <html> so CSS tokens respond. */
function usePreferenceAttributes() {
  const prefs = useStore((st) => st.prefs);
  useEffect(() => {
    const el = document.documentElement;
    // Inside the artifact viewer there is no notch to clear; on a real phone there is.
    if (IS_DEMO && !IS_MOBILE) el.setAttribute('data-host', 'artifact');
    // Light only: clear any theme attribute an older version or host left behind.
    el.removeAttribute('data-theme');
    el.removeAttribute('data-theme-owner');
    if (prefs.text === 'large') el.setAttribute('data-text', 'large');
    else el.removeAttribute('data-text');
    if (prefs.motion === 'reduce') el.setAttribute('data-motion', 'reduce');
    else el.removeAttribute('data-motion');
  }, [prefs]);
}

type Direction = 'forward' | 'back' | 'fade';

// iOS-style push: the new screen slides over, the old one drifts back.
const IOS = [0.32, 0.72, 0, 1] as const;
const variants: Variants = {
  enter: (d: Direction) => (d === 'forward' ? { x: '100%', zIndex: 2, opacity: 1 } : d === 'back' ? { x: '-28%', zIndex: 1, opacity: 1 } : { opacity: 0, y: 14, zIndex: 2 }),
  center: (d: Direction) => ({ x: 0, y: 0, opacity: 1, transition: { duration: d === 'fade' ? 0.32 : 0.48, ease: IOS } }),
  exit: (d: Direction) =>
    d === 'forward'
      ? { x: '-28%', zIndex: 1, transition: { duration: 0.48, ease: IOS } }
      : d === 'back'
        ? { x: '100%', zIndex: 2, transition: { duration: 0.42, ease: IOS } }
        : { opacity: 0, zIndex: 1, transition: { duration: 0.18 } },
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

/*
 * The phone preview uses hash routing so the phone's own back button and
 * back swipe move between screens, and a reload keeps the screen. The first
 * open lands on this build's starting direction.
 */
if (IS_MOBILE && typeof window !== 'undefined' && (!window.location.hash || window.location.hash === '#')) {
  window.history.replaceState(null, '', `#${START}`);
}

function Router({ children }: { children: ReactNode }) {
  const future = { v7_startTransition: true, v7_relativeSplatPath: true };
  if (IS_DEMO && !IS_MOBILE)
    return (
      <MemoryRouter initialEntries={[readSession(ROUTE_KEY) ?? START]} future={future}>
        {children}
      </MemoryRouter>
    );
  return <HashRouter future={future}>{children}</HashRouter>;
}

/** Direction 01: the original illustrated redesign, unchanged. */
function D1App() {
  useEffect(() => {
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500));
    idle(() => prefetchScreens());
  }, []);
  return (
    <AppFrame>
      <ToastProvider>
        <UIProvider>
          <AnimatedRoutes />
          <Splash />
          <TabBar />
        </UIProvider>
      </ToastProvider>
    </AppFrame>
  );
}

function DirectionRoot() {
  const { pathname } = useLocation();
  if (isD2Path(pathname))
    return (
      <Suspense fallback={<div style={{ position: 'fixed', inset: 0, background: '#0a1128' }} />}>
        <D2App />
      </Suspense>
    );
  return <D1App />;
}

/** Remembers the current route in demo builds (in-memory routing), for both directions. */
function RouteMemory() {
  const location = useLocation();
  useLayoutEffect(() => {
    if (IS_DEMO) writeSession(ROUTE_KEY, location.pathname + location.search);
  }, [location]);
  return null;
}

export function App() {
  usePreferenceAttributes();
  const reduced = useReducedMotion();
  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'user'}>
      <Router>
        <RouteMemory />
        <DirectionRoot />
        <DirectionSwitcher />
      </Router>
    </MotionConfig>
  );
}
