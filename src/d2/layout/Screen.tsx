import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import { motion, motionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { setStatusTone } from '@/lib/statusTone';
import { to } from '../paths';
import s from './Screen.module.css';

const ScrollCtx = createContext<MotionValue<number>>(motionValue(0));
export const useScreenScroll = () => useContext(ScrollCtx);

const memory = new Map<string, number>();

export interface ScreenProps {
  title: string;
  /** Small label above a masthead title, e.g. "Journal · 3 sections". */
  kicker?: ReactNode;
  /** Line under a masthead title. */
  deck?: ReactNode;
  /**
   * masthead: big editorial title that hands over to a compact header on scroll (tab roots).
   * detail: compact header with a labelled Back button.
   * overlay: header floats over a full-bleed photo until the photo scrolls away.
   * bare: no header at all.
   */
  variant?: 'masthead' | 'detail' | 'overlay' | 'bare';
  back?: boolean;
  backTo?: string;
  actions?: ReactNode | ((onImage: boolean) => ReactNode);
  /** Shown right of the masthead title. */
  mastheadAside?: ReactNode;
  footer?: ReactNode;
  tabRoot?: boolean;
  /** Night page: the deep night background. */
  night?: boolean;
  /** Reading progress line under the header. */
  progress?: boolean;
  /** Height of the photo an overlay header floats over. */
  heroHeight?: number;
  scrollKey?: string;
  /** Bare screens that open on a dark photo: light status bar until it scrolls away. */
  lightTop?: boolean;
  children: ReactNode;
}

export function Screen({ title, kicker, deck, variant = 'detail', back = variant !== 'masthead' && variant !== 'bare', backTo = '/home', actions, mastheadAside, footer, tabRoot, night, progress, heroHeight = 360, scrollKey, lightTop, children }: ScreenProps) {
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navType = useNavigationType();
  const navigate = useNavigate();
  const key = scrollKey ?? (tabRoot ? location.pathname : location.key);
  const { scrollY } = useScroll({ container: ref });
  const threshold = variant === 'masthead' ? 92 : variant === 'overlay' || (variant === 'bare' && lightTop) ? heroHeight - 120 : 4;
  const [past, setPast] = useState(false);
  const barBg = useTransform(scrollY, [threshold - 24, threshold], [0, 1]);
  // Detail pages: the bar title appears only once the large page title has faded away (see ScrollFade).
  const titleOpacity = useTransform(scrollY, variant === 'detail' ? [52, 80] : [threshold - 10, threshold + 14], [0, 1]);
  const titleY = useTransform(scrollY, variant === 'detail' ? [52, 80] : [threshold - 10, threshold + 14], [8, 0]);
  const read = useTransform(scrollY, (y) => {
    const el = ref.current;
    const max = el ? el.scrollHeight - el.clientHeight : 0;
    return max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
  });

  useMotionValueEvent(scrollY, 'change', (y) => {
    memory.set(key, y);
    const next = y > threshold - 12;
    if (next !== past) setPast(next);
  });

  useLayoutEffect(() => {
    const y = memory.get(key);
    if (ref.current && y && (navType === 'POP' || tabRoot)) ref.current.scrollTop = y;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onImage = (variant === 'overlay' || (variant === 'bare' && !!lightTop)) && !past;
  useEffect(() => setStatusTone(onImage ? 'light' : 'dark'), [onImage]);

  const goBack = () => {
    if (location.key !== 'default') navigate(-1);
    else navigate(to(backTo), { replace: true });
  };

  const showBar = variant !== 'bare';

  return (
    <div className={`${s.screen} ${night ? s.night : ''} ${tabRoot ? s.tabRoot : ''} ${footer ? s.hasFooter : ''}`}>
      {showBar && (
        <header className={`${s.bar} ${onImage ? s.onImage : ''}`}>
          <motion.div className={s.barBg} style={{ opacity: variant === 'detail' ? 1 : barBg }} aria-hidden />
          <div className={s.barRow}>
            {back && (
              <motion.button type="button" whileTap={{ scale: 0.94 }} className={s.back} onClick={goBack}>
                <ArrowLeft aria-hidden strokeWidth={2.4} />
                <span>Back</span>
              </motion.button>
            )}
            <motion.p className={`${s.barTitle} ${back ? '' : s.barTitleLeft}`} style={{ opacity: titleOpacity, y: titleY }} aria-hidden={variant === 'masthead' || undefined}>
              {title}
            </motion.p>
            <div className={s.actions}>{typeof actions === 'function' ? actions(onImage) : actions}</div>
          </div>
          {progress && <motion.div className={s.progress} style={{ scaleX: read }} aria-hidden />}
        </header>
      )}
      {variant === 'bare' && lightTop && <motion.div className={`${s.statusScrim}`} style={{ opacity: barBg }} aria-hidden />}
      <ScrollCtx.Provider value={scrollY}>
        <div ref={ref} className={`${s.scroll} ${variant === 'detail' ? s.underBar : ''} ${variant === 'masthead' ? s.underMasthead : ''}`} data-scroll-root>
          {variant === 'masthead' && (
            <div className={s.masthead}>
              {/* The kicker spans the full width so a masthead action never squeezes it onto two lines. */}
              {kicker && <p className={s.kicker}>{kicker}</p>}
              <div className={s.mastRow}>
                <div className={s.mastText}>
                  <h1 className={s.mastTitle}>{title}</h1>
                  {deck && <p className={s.deck}>{deck}</p>}
                </div>
                {mastheadAside && <div className={s.mastAside}>{mastheadAside}</div>}
              </div>
            </div>
          )}
          {variant !== 'masthead' && variant !== 'overlay' && variant !== 'bare' ? <h1 className="sr-only">{title}</h1> : null}
          {children}
        </div>
      </ScrollCtx.Provider>
      {footer && <div className={s.footer}>{footer}</div>}
    </div>
  );
}

/**
 * Fades a detail page's large title block out as it scrolls under the bar,
 * so it never shows at the same time as the bar's small title.
 */
export function ScrollFade({ children, className }: { children: ReactNode; className?: string }) {
  const scrollY = useScreenScroll();
  const opacity = useTransform(scrollY, [6, 52], [1, 0]);
  const y = useTransform(scrollY, [0, 52], [0, -10]);
  return (
    <motion.div className={className} style={{ opacity, y }}>
      {children}
    </motion.div>
  );
}

/** Large detail-page heading block (kicker + title), for screens with a compact header. */
export function PageTitle({ kicker, title, deck }: { kicker?: ReactNode; title: string; deck?: ReactNode }) {
  return (
    <ScrollFade className={s.pageTitle}>
      {kicker && <p className={s.kicker}>{kicker}</p>}
      <h2 className={s.pageTitleText}>{title}</h2>
      {deck && <p className={s.deck}>{deck}</p>}
    </ScrollFade>
  );
}
