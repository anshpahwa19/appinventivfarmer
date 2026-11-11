import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/theme';
import { ANIMATIONS, LIGHT, NIGHT, type AnimationName } from './animations';

type Anim = {
  destroy: () => void;
  play: () => void;
  pause: () => void;
  goToAndStop: (v: number, isFrame?: boolean) => void;
  addEventListener: (n: string, cb: () => void) => void;
};
type Player = { loadAnimation: (o: Record<string, unknown>) => Anim };

let player: Promise<Player> | null = null;
const load = () => (player ??= import('lottie-web/build/player/lottie_light').then((m) => (m.default ?? m) as unknown as Player));

interface Props {
  name: AnimationName;
  size?: number;
  loop?: boolean;
  /** Draw for a night (always dark) surface. */
  night?: boolean;
  label?: string;
  className?: string;
}

/** Plays a Direction 02 animation. Reduced motion shows the final frame. */
export function FjLottie({ name, size = 140, loop = true, night, label, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let anim: Anim | undefined;
    let io: IntersectionObserver | undefined;
    let cancelled = false;
    load()
      .then((lottie) => {
        if (cancelled) return;
        const data = ANIMATIONS[name](night ? NIGHT : LIGHT);
        anim = lottie.loadAnimation({ container: el, renderer: 'svg', loop: reduced ? false : loop, autoplay: !reduced, animationData: data, rendererSettings: { preserveAspectRatio: 'xMidYMid meet' } });
        if (reduced) anim.goToAndStop(data.op - 1, true);
        else if (loop && 'IntersectionObserver' in window) {
          io = new IntersectionObserver(([e]) => (e.isIntersecting ? anim?.play() : anim?.pause()));
          io.observe(el);
        }
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      io?.disconnect();
      anim?.destroy();
    };
  }, [name, loop, reduced, night]);

  return (
    <div ref={ref} className={className} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} style={{ width: size, height: size, flex: 'none' }}>
      {failed && (
        <svg viewBox="0 0 160 160" width={size} height={size} aria-hidden>
          <circle cx="80" cy="80" r="50" fill="none" stroke="currentColor" strokeWidth="5" opacity="0.3" />
        </svg>
      )}
    </div>
  );
}
