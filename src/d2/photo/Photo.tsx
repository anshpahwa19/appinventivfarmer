import { useState, type CSSProperties, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { useReducedMotion } from '@/lib/theme';
import { resolvePhoto, type ToneField } from './catalog';
import s from './Photo.module.css';

export type Ratio = '21/9' | '16/9' | '3/2' | '4/3' | '1/1' | '4/5' | '3/4' | '2/3' | '9/16' | 'fill';

interface PhotoProps {
  /** Slot id from the catalogue. */
  id: string;
  /** A real photo URL from data (SceneSpec.src) wins over the catalogue file. */
  src?: string;
  ratio?: Ratio;
  alt?: string;
  /** Decorative image: hidden from screen readers. */
  decorative?: boolean;
  /** Show the "photo slot" label while no photo exists (large images only). 'hero' sits below a floating header. */
  label?: boolean | 'hero';
  /** Slow cinematic drift. */
  drift?: boolean;
  /** Mask reveal when the image scrolls into view. */
  reveal?: boolean;
  /** Gradient so text placed over the photo stays readable. */
  shade?: 'bottom' | 'top' | 'full' | 'none';
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  /** Load eagerly (heroes above the fold). */
  priority?: boolean;
  /** Desaturate (inactive fields). */
  muted?: boolean;
}

/** CSS background that imitates the light of the expected photograph. */
export function toneBackground(t: ToneField): string {
  if (t.kind === 'land') {
    const h = t.horizon;
    return [
      `radial-gradient(42% 30% at ${t.sun.x}% ${h - 6}%, ${t.sun.color} 0%, transparent 70%)`,
      `radial-gradient(80% 40% at ${100 - t.sun.x}% ${Math.min(96, h + 34)}%, ${t.land[1]} 0%, transparent 72%)`,
      `radial-gradient(60% 18% at 50% ${h + 3}%, ${t.haze} 0%, transparent 80%)`,
      `linear-gradient(180deg, ${t.sky[0]} 0%, ${t.sky[1]} ${h - 10}%, ${t.haze} ${h}%, ${t.land[0]} ${h + 7}%, ${t.land[1]} 100%)`,
    ].join(', ');
  }
  return [
    `radial-gradient(34% 30% at ${t.x - 6}% ${t.y - 8}%, ${t.glow} 0%, transparent 70%)`,
    `radial-gradient(58% 52% at ${t.x}% ${t.y}%, ${t.subject} 0%, transparent 74%)`,
    `radial-gradient(120% 90% at 50% 50%, transparent 40%, rgba(0,0,0,0.35) 100%)`,
    t.base,
  ].join(', ');
}

/**
 * Every image in Direction 02. Renders the licensed photo when one exists;
 * otherwise the slot's tonal field, which is also the blur-up placeholder
 * shown while a real photo loads.
 */
export function Photo({ id, src, ratio = '4/5', alt, decorative, label, drift, reveal, shade = 'none', className, style, children, priority, muted }: PhotoProps) {
  const reduced = useReducedMotion();
  const photo = resolvePhoto(id, src);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const showImg = !!photo.src && !failed;
  const a11yAlt = decorative ? '' : alt ?? photo.slot.alt;

  const frameStyle: CSSProperties = ratio === 'fill' ? { position: 'absolute', inset: 0, ...style } : { aspectRatio: ratio.replace('/', ' / '), ...style };

  const media = (
    <>
      <div className={`${s.field} ${drift && !reduced ? s.drift : ''}`} style={{ background: toneBackground(photo.slot.tone) }} aria-hidden />
      {!showImg && <div className={s.grain} aria-hidden />}
      {showImg && (
        <img
          className={`${s.img} ${loaded ? s.loaded : ''} ${drift && !reduced ? s.drift : ''}`}
          src={photo.src}
          alt={a11yAlt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          style={{ objectPosition: photo.slot.focal }}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
      {!showImg && !decorative && <span className="sr-only">{a11yAlt}</span>}
    </>
  );

  const cls = `${s.photo} ${muted ? s.muted : ''} ${className ?? ''}`;
  const overlay = (
    <>
      {shade !== 'none' && <div className={`${s.shade} ${s[`shade_${shade}`]}`} aria-hidden />}
      {label && !showImg && (
        <span className={`${s.slug} ${label === 'hero' ? s.slugHero : ''}`} aria-hidden>
          <Camera /> Photo slot · {photo.slot.short}
        </span>
      )}
      {children}
    </>
  );

  if (reveal && !reduced) {
    return (
      <motion.div
        className={cls}
        style={frameStyle}
        role={showImg || decorative ? undefined : 'img'}
        aria-label={showImg || decorative ? undefined : a11yAlt}
        initial={{ clipPath: 'inset(18% 0% 0% 0% round 0px)' }}
        whileInView={{ clipPath: 'inset(0% 0% 0% 0% round 0px)' }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div className={s.inner} initial={{ scale: 1.14 }} whileInView={{ scale: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}>
          {media}
        </motion.div>
        {overlay}
      </motion.div>
    );
  }

  return (
    <div className={cls} style={frameStyle} role={showImg || decorative ? undefined : 'img'} aria-label={showImg || decorative ? undefined : a11yAlt}>
      <div className={s.inner}>{media}</div>
      {overlay}
    </div>
  );
}

/** The editorial credit line under large images. */
export function PhotoCredit({ id, className }: { id: string; className?: string }) {
  const p = resolvePhoto(id);
  return (
    <p className={`${s.credit} ${className ?? ''}`}>
      {p.src && p.credit ? (
        <>
          Photo: {p.credit.author} · {p.credit.source} · {p.credit.licence}
        </>
      ) : p.src ? (
        <>Photo credit missing</>
      ) : (
        <>
          <Camera aria-hidden /> Photo to be commissioned: {p.slot.short.toLowerCase()}
        </>
      )}
    </p>
  );
}
