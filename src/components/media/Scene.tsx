import { memo, useId, useMemo, type CSSProperties, type ReactNode } from 'react';
import type { SceneSpec } from '@/types';
import { buildScene, type SceneAspect, type SceneDetail } from '@/scenes/buildScene';
import s from './Scene.module.css';

const cache = new Map<string, { viewBox: string; markup: string }>();

function sceneMarkup(spec: SceneSpec, aspect: SceneAspect, detail: SceneDetail) {
  const key = `${spec.kind}|${spec.seed}|${spec.time ?? ''}|${aspect}|${detail}`;
  let hit = cache.get(key);
  if (!hit) {
    hit = buildScene(spec, aspect, detail, '__ID__');
    cache.set(key, hit);
  }
  return hit;
}

interface Props {
  scene: SceneSpec;
  aspect?: SceneAspect;
  detail?: SceneDetail;
  className?: string;
  style?: CSSProperties;
  /** Describe the image when it carries meaning; omit for decorative use. */
  alt?: string;
  /** Slow Ken Burns drift (disabled for reduced motion). */
  drift?: boolean;
  children?: ReactNode;
}

/** Illustrated landscape, or a real photo when `scene.src` is set. */
export const Scene = memo(function Scene({ scene, aspect = 'wide', detail = 'low', className, style, alt, drift, children }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const built = useMemo(() => (scene.src ? null : sceneMarkup(scene, aspect, detail)), [scene, aspect, detail]);
  const html = useMemo(() => (built ? built.markup.split('__ID__').join(`s${uid}`) : ''), [built, uid]);
  const label = alt ?? scene.alt;
  return (
    <div className={`${s.scene} ${drift ? s.drift : ''} ${className ?? ''}`} style={style}>
      {scene.src ? (
        <img src={scene.src} alt={label ?? ''} loading="lazy" decoding="async" />
      ) : (
        <svg viewBox={built!.viewBox} preserveAspectRatio="xMidYMid slice" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false" dangerouslySetInnerHTML={{ __html: html }} />
      )}
      {children}
    </div>
  );
});
