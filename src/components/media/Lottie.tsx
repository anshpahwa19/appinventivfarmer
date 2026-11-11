import { useEffect, useRef, useState } from 'react';
import { ANIMATIONS, LIGHT_PALETTE, type AnimationName } from '@/lottie/animations';
import { useReducedMotion } from '@/lib/theme';

interface Props {
  name: AnimationName;
  size?: number;
  loop?: boolean;
  /** Accessible description; omit when the animation is decorative. */
  label?: string;
  className?: string;
  onComplete?: () => void;
}

type LottiePlayer = {
  loadAnimation: (o: Record<string, unknown>) => {
    destroy: () => void;
    play: () => void;
    pause: () => void;
    goToAndStop: (v: number, isFrame?: boolean) => void;
    addEventListener: (n: string, cb: () => void) => void;
    totalFrames: number;
  };
};

let playerPromise: Promise<LottiePlayer> | null = null;
function loadPlayer(): Promise<LottiePlayer> {
  // SVG-only "light" build: no expressions, no eval, small.
  playerPromise ??= import('lottie-web/build/player/lottie_light').then((m) => (m.default ?? m) as unknown as LottiePlayer);
  return playerPromise;
}

export function Lottie({ name, size = 160, loop = true, label, className, onComplete }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  useEffect(() => {
    let anim: ReturnType<LottiePlayer['loadAnimation']> | undefined;
    let observer: IntersectionObserver | undefined;
    let cancelled = false;
    const el = ref.current;
    if (!el) return;
    loadPlayer()
      .then((lottie) => {
        if (cancelled || !el) return;
        const data = ANIMATIONS[name](LIGHT_PALETTE);
        anim = lottie.loadAnimation({
          container: el,
          renderer: 'svg',
          loop: reduced ? false : loop,
          autoplay: !reduced,
          animationData: data,
          rendererSettings: { preserveAspectRatio: 'xMidYMid meet', progressiveLoad: true },
        });
        if (reduced) {
          anim.goToAndStop(data.op - 1, true);
          completeRef.current?.();
        } else {
          anim.addEventListener('complete', () => completeRef.current?.());
          // Pause looping animations while off screen.
          if (loop && 'IntersectionObserver' in window) {
            observer = new IntersectionObserver(([e]) => (e.isIntersecting ? anim?.play() : anim?.pause()));
            observer.observe(el);
          }
        }
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      observer?.disconnect();
      anim?.destroy();
    };
  }, [name, loop, reduced]);

  return (
    <div
      ref={ref}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ width: size, height: size, flex: 'none' }}
    >
      {failed && (
        <svg viewBox="0 0 160 160" width={size} height={size} aria-hidden>
          <circle cx="80" cy="80" r="56" fill="var(--surface-2)" />
          <circle cx="80" cy="80" r="20" fill="var(--success-solid)" />
        </svg>
      )}
    </div>
  );
}
