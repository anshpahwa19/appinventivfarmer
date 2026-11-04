import type { CSSProperties, ElementType, ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useReducedMotion } from '@/lib/theme';

const EXPO = [0.16, 1, 0.3, 1] as const;

/**
 * Editorial headline reveal: each word rises out of its own mask, in sequence.
 * Screen readers get the plain sentence.
 */
export function RevealText({ text, as: Tag = 'h1', className, delay = 0, stagger = 0.06, style }: { text: string; as?: ElementType; className?: string; delay?: number; stagger?: number; style?: CSSProperties }) {
  const reduced = useReducedMotion();
  if (reduced) return <Tag className={className} style={style}>{text}</Tag>;
  const words = text.split(' ');
  return (
    <Tag className={className} style={style} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.08em', marginBottom: '-0.08em' }}>
          <motion.span style={{ display: 'inline-block' }} initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: EXPO, delay: delay + i * stagger }}>
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } };
const item: Variants = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EXPO } } };

/** Children marked with <Rise> appear one after another. */
export function Cascade({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <motion.div className={className} style={style} variants={container} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}

export function Rise({ children, className, style, as = 'div' }: { children: ReactNode; className?: string; style?: CSSProperties; as?: 'div' | 'section' | 'li' }) {
  const M = as === 'section' ? motion.section : as === 'li' ? motion.li : motion.div;
  return (
    <M className={className} style={style} variants={item}>
      {children}
    </M>
  );
}

/** Fades content up the first time it scrolls into view. */
export function InView({ children, className, style, delay = 0 }: { children: ReactNode; className?: string; style?: CSSProperties; delay?: number }) {
  return (
    <motion.div className={className} style={style} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.7, ease: EXPO, delay }}>
      {children}
    </motion.div>
  );
}
