import type { CSSProperties, ReactNode } from 'react';
import { motion, useTransform } from 'framer-motion';
import { useScreenScroll } from '@/components/layout/Screen';

/** Hero image that moves slower than the page and gently zooms as it scrolls away. */
export function ParallaxHero({ children, className, style, depth = 0.38 }: { children: ReactNode; className?: string; style?: CSSProperties; depth?: number }) {
  const scrollY = useScreenScroll();
  const y = useTransform(scrollY, [0, 400], [0, 400 * depth]);
  const scale = useTransform(scrollY, [0, 400], [1, 1.08]);
  const opacity = useTransform(scrollY, [0, 360], [1, 0.55]);
  return (
    <motion.div className={className} style={{ position: 'absolute', inset: 0, y, scale, opacity, ...style }}>
      <motion.div style={{ position: 'absolute', inset: 0 }} initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}>
        {children}
      </motion.div>
    </motion.div>
  );
}
