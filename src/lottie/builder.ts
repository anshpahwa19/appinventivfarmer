/**
 * A very small Lottie (bodymovin) authoring helper.
 *
 * Animations are written in code rather than downloaded, so they are tiny,
 * always available offline and coloured from the live theme tokens.
 */

type Vec = number[];
export type Ease = 'linear' | 'out' | 'in' | 'inout' | 'back';

const EASE: Record<Ease, { o: [number, number]; i: [number, number] }> = {
  linear: { o: [0, 0], i: [1, 1] },
  out: { o: [0.22, 1], i: [0.36, 1] },
  in: { o: [0.55, 0], i: [1, 0.45] },
  inout: { o: [0.65, 0], i: [0.35, 1] },
  back: { o: [0.34, 1.56], i: [0.64, 1] },
};

export interface Key {
  t: number;
  v: number | Vec;
  e?: Ease;
}

const arr = (v: number | Vec): Vec => (Array.isArray(v) ? v : [v]);

/** Static value or keyframed animation. */
export function prop(value: number | Vec | Key[]) {
  if (Array.isArray(value) && value.length && typeof value[0] === 'object') {
    const keys = value as Key[];
    return {
      a: 1,
      k: keys.map((key, idx) => {
        const s = arr(key.v);
        if (idx === keys.length - 1) return { t: key.t, s };
        const e = EASE[key.e ?? 'inout'];
        const dims = s.length;
        return {
          t: key.t,
          s,
          o: { x: Array(dims).fill(e.o[0]), y: Array(dims).fill(e.o[1]) },
          i: { x: Array(dims).fill(e.i[0]), y: Array(dims).fill(e.i[1]) },
        };
      }),
    };
  }
  return { a: 0, k: value as number | Vec };
}

export function hexToRgba(hex: string, alpha = 1): Vec {
  const h = hex.trim().replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6);
  return [parseInt(full.slice(0, 2), 16) / 255, parseInt(full.slice(2, 4), 16) / 255, parseInt(full.slice(4, 6), 16) / 255, alpha];
}

/* ---------- Shapes ---------- */

export const ellipse = (w: number, h: number, x = 0, y = 0) => ({ ty: 'el', d: 1, p: prop([x, y]), s: prop([w, h]) });
export const ellipseAnim = (size: Key[] | Vec, pos: Key[] | Vec = [0, 0]) => ({ ty: 'el', d: 1, p: prop(pos), s: prop(size) });
export const rect = (w: number, h: number, r = 0, x = 0, y = 0) => ({ ty: 'rc', d: 1, p: prop([x, y]), s: prop([w, h]), r: prop(r) });

/** Polyline or bezier path. Points are [x, y]; tangents default to straight lines. */
export function path(points: Vec[], closed = false, inT?: Vec[], outT?: Vec[]) {
  return {
    ty: 'sh',
    d: 1,
    ks: prop({
      c: closed,
      v: points,
      i: inT ?? points.map(() => [0, 0]),
      o: outT ?? points.map(() => [0, 0]),
    } as unknown as Vec),
  };
}

export const fill = (color: string, opacity: number | Key[] = 100) => ({ ty: 'fl', c: prop(hexToRgba(color)), o: prop(opacity), r: 1 });
export const stroke = (color: string, width: number, opacity: number | Key[] = 100) => ({ ty: 'st', c: prop(hexToRgba(color)), o: prop(opacity), w: prop(width), lc: 2, lj: 2, ml: 4 });
export const trim = (start: number | Key[], end: number | Key[], offset = 0) => ({ ty: 'tm', s: prop(start), e: prop(end), o: prop(offset), m: 1 });

interface Transform {
  p?: Vec | Key[];
  a?: Vec;
  s?: Vec | Key[];
  r?: number | Key[];
  o?: number | Key[];
}

function tr(t: Transform = {}) {
  return { ty: 'tr', p: prop(t.p ?? [0, 0]), a: prop(t.a ?? [0, 0]), s: prop(t.s ?? [100, 100]), r: prop(t.r ?? 0), o: prop(t.o ?? 100), sk: prop(0), sa: prop(0) };
}

export function group(items: unknown[], t?: Transform) {
  return { ty: 'gr', it: [...items, tr(t)] };
}

/* ---------- Layers & document ---------- */

let layerIndex = 0;

export function layer(name: string, shapes: unknown[], t: Transform = {}, op = 600) {
  layerIndex += 1;
  return {
    ddd: 0,
    ind: layerIndex,
    ty: 4,
    nm: name,
    sr: 1,
    ks: {
      o: prop(t.o ?? 100),
      r: prop(t.r ?? 0),
      p: prop(t.p ?? [0, 0, 0]),
      a: prop(t.a ?? [0, 0, 0]),
      s: prop(t.s ?? [100, 100, 100]),
    },
    ao: 0,
    shapes,
    ip: 0,
    op,
    st: 0,
    bm: 0,
  };
}

export interface LottieDoc {
  v: string;
  fr: number;
  ip: number;
  op: number;
  w: number;
  h: number;
  nm: string;
  ddd: number;
  assets: unknown[];
  layers: unknown[];
}

/** Layers are given back-to-front (painter's order); Lottie wants front-to-back. */
export function doc(name: string, size: number, op: number, layersBackToFront: ReturnType<typeof layer>[]): LottieDoc {
  layersBackToFront.forEach((l) => (l.op = op));
  return { v: '5.7.4', fr: 60, ip: 0, op, w: size, h: size, nm: name, ddd: 0, assets: [], layers: [...layersBackToFront].reverse() };
}
