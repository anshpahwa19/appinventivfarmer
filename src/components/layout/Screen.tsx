import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import { motion, motionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { setStatusTone, type StatusTone } from '@/lib/statusTone';
import s from './Screen.module.css';

const ScrollContext = createContext<MotionValue<number>>(motionValue(0));
/** Scroll position of the current screen, for scroll-linked effects (parallax, fades). */
export function useScreenScroll() {
  return useContext(ScrollContext);
}

const scrollMemory = new Map<string, number>();

interface ScreenProps {
  /** Title in the compact header (and the large title when `largeTitle`). */
  title?: string;
  subtitle?: ReactNode;
  largeTitle?: boolean;
  /** Back button; `backTo` is the fallback when there is no history. */
  back?: boolean;
  backTo?: string;
  /** Header actions. A function receives `onImage` (true while over a hero image). */
  actions?: ReactNode | ((onImage: boolean) => ReactNode);
  /** Actions shown next to the large title instead of in the header. */
  largeActions?: ReactNode;
  /** Header floats over a hero image until the user scrolls. */
  overlay?: boolean;
  /** No header at all (onboarding, custom heroes). */
  noHeader?: boolean;
  tabRoot?: boolean;
  footer?: ReactNode;
  surface?: boolean;
  children: ReactNode;
  /** Remember scroll per path (tab roots) instead of per history entry. */
  scrollKey?: string;
  /** Thin reading-progress bar under the header. */
  progress?: boolean;
  /** Status bar tone over the top of a header-less screen (e.g. a dark hero image). */
  heroTone?: StatusTone;
  /** Height of a header-less hero; after it scrolls away a glass strip sits behind the status bar. */
  heroHeight?: number;
  /** Soft colour wash behind the large title. */
  band?: boolean;
}

export function Screen({ title, subtitle, largeTitle, back, backTo = '/home', actions, largeActions, overlay, noHeader, tabRoot, footer, surface, children, scrollKey, progress, heroTone, heroHeight = 220, band }: ScreenProps) {
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navType = useNavigationType();
  const navigate = useNavigate();
  const memoryKey = scrollKey ?? (tabRoot ? location.pathname : location.key);
  const { scrollY } = useScroll({ container: ref });
  // Progress from the live scroll height (content may load after mount).
  const readProgress = useTransform(scrollY, (y) => {
    const el = ref.current;
    const max = el ? el.scrollHeight - el.clientHeight : 0;
    return max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
  });
  const threshold = noHeader ? heroHeight - 60 : largeTitle ? 56 : overlay ? 160 : 8;
  const bgOpacity = useTransform(scrollY, [threshold - 40, threshold], [0, 1]);
  const titleOpacity = useTransform(scrollY, largeTitle ? [threshold - 16, threshold + 8] : overlay ? [threshold - 30, threshold] : [0, 1], [largeTitle || overlay ? 0 : 1, 1]);
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, 'change', (y) => {
    const next = y > threshold - 20;
    if (next !== scrolled) setScrolled(next);
    scrollMemory.set(memoryKey, y);
  });

  useLayoutEffect(() => {
    const y = scrollMemory.get(memoryKey);
    if (ref.current && y && (navType === 'POP' || tabRoot)) ref.current.scrollTop = y;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goBack = () => {
    if (location.key !== 'default') navigate(-1);
    else navigate(backTo, { replace: true });
  };

  const onImage = overlay && !scrolled;
  const showHeader = !noHeader;
  const tone: StatusTone = onImage || (noHeader && heroTone === 'light' && !scrolled) ? 'light' : 'dark';
  useEffect(() => setStatusTone(tone), [tone]);

  return (
    <div className={`${s.screen} ${surface ? s.surface : ''} ${tabRoot ? s.tabRoot : ''} ${footer ? s.hasFooter : ''}`}>
      {showHeader && (
        <header className={s.header}>
          <motion.div className={s.headerBg} style={{ opacity: bgOpacity }} aria-hidden />
          <div className={s.bar}>
            <div className={s.left}>
              {back && (
                <IconButton label="Back" variant={onImage ? 'onImage' : 'plain'} onClick={goBack}>
                  <ArrowLeft strokeWidth={2.2} />
                </IconButton>
              )}
            </div>
            <motion.h1 className={s.barTitle} style={{ opacity: titleOpacity }} aria-hidden={largeTitle || undefined}>
              {title}
            </motion.h1>
            <div className={s.right}>{typeof actions === 'function' ? actions(!!onImage) : actions}</div>
          </div>
          {progress && <motion.div className={s.progress} style={{ scaleX: readProgress }} aria-hidden />}
        </header>
      )}
      {noHeader && <motion.div className={s.statusScrim} style={{ opacity: bgOpacity }} aria-hidden />}
      <ScrollContext.Provider value={scrollY}>
      <div ref={ref} className={`${s.scroll} ${showHeader && !overlay ? s.withHeader : ''} ${largeTitle && !back && !actions ? s.compactTop : ''}`} data-scroll-root>
        <div className={s.content}>
          {band && <div className={s.band} aria-hidden />}
          {largeTitle && (
            <div className={`${s.large} ${!showHeader ? s.largeNoHeader : ''}`}>
              <div>
                <h1 className={s.largeTitle}>{title}</h1>
                {subtitle && <p className={s.largeSub}>{subtitle}</p>}
              </div>
              {largeActions && <div className={s.largeActions}>{largeActions}</div>}
            </div>
          )}
          {children}
        </div>
      </div>
      </ScrollContext.Provider>
      {footer && <div className={s.footer}>{footer}</div>}
    </div>
  );
}
