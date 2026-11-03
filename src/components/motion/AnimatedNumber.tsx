import { useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';

/** Counts up to a number (respects reduced motion via MotionConfig). */
export function AnimatedNumber({ value, format = (n) => String(Math.round(n)), from = 0, duration = 0.9 }: { value: number; format?: (n: number) => string; from?: number; duration?: number }) {
  const mv = useMotionValue(from);
  const text = useTransform(mv, format);
  useEffect(() => {
    const c = animate(mv, value, { duration, ease: [0.22, 1, 0.36, 1] });
    return c.stop;
  }, [value, mv, duration]);
  return <motion.span>{text}</motion.span>;
}
