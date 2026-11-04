/**
 * Direction 02 Lottie kit: a tiny bodymovin writer for monoline, "technical
 * drawing" animations (strokes that draw on, orbits, pulses). Written in code
 * because LottieFiles is unreachable from the build environment, and so the
 * files stay tiny, offline and coloured from the theme.
 */

export type RGB = [number, number, number];
type V = number | number[];
export interface K {
  t: number;
  v: V;
  /** Easing: 'o' expo-out, 'io' in-out, 'l' linear, 'b' back. */
  e?: 'o' | 'io' | 'l' | 'b';
}

const EASES = {
  o: { o: [0.16, 1], i: [0.3, 1] },
  io: { o: [0.65, 0], i: [0.35, 1] },
  l: { o: [0, 0], i: [1, 1] },
  b: { o: [0.34, 1.56], i: [0.64, 1] },
} as const;

const arr = (v: V) => (Array.isArray(v) ? v : [v]);

export function p(v: V | K[]) {
  if (Array.isArray(v) && v.length && typeof v[0] === 'object') {
    const keys = v as K[];
    return {
      a: 1,
      k: keys.map((k, i) => {
        const e = EASES[k.e ?? 'io'];
        return i === keys.length - 1 ? { t: k.t, s: arr(k.v) } : { t: k.t, s: arr(k.v), o: { x: [e.o[0]], y: [e.o[1]] }, i: { x: [e.i[0]], y: [e.i[1]] } };
      }),
    };
  }
  return { a: 0, k: v as V };
}

export function hex(h: string): RGB {
  const x = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16) / 255) as RGB;
}

/* ---------- Shapes ---------- */

export const ellipse = (w: number, h = w, x = 0, y = 0) => ({ ty: 'el', d: 1, p: p([x, y]), s: p([w, h]) });
export const rect = (w: number, h: number, r = 0, x = 0, y = 0) => ({ ty: 'rc', d: 1, p: p([x, y]), s: p([w, h]), r: p(r) });

/** Polyline / polygon through points (straight segments). */
export function path(points: [number, number][], closed = false) {
  const zero = points.map(() => [0, 0]);
  return { ty: 'sh', d: 1, ks: p({ i: zero, o: zero, v: points, c: closed } as unknown as number[]) };
}

/** Smooth path from points with explicit in/out tangents. */
export function curve(points: [number, number][], ins: [number, number][], outs: [number, number][], closed = false) {
  return { ty: 'sh', d: 1, ks: p({ i: ins, o: outs, v: points, c: closed } as unknown as number[]) };
}

export const stroke = (c: RGB, w = 4, o: V | K[] = 100) => ({ ty: 'st', c: p([...c, 1]), o: p(o), w: p(w), lc: 2, lj: 2, ml: 4 });
export const fill = (c: RGB, o: V | K[] = 100) => ({ ty: 'fl', c: p([...c, 1]), o: p(o), r: 1 });
/** Draw-on: animates the end of the stroke from 0 to 100. */
export const trim = (end: V | K[], start: V | K[] = 0, offset: V | K[] = 0) => ({ ty: 'tm', s: p(start), e: p(end), o: p(offset), m: 1 });

export interface Tr {
  p?: V | K[];
  a?: V | K[];
  s?: V | K[];
  r?: V | K[];
  o?: V | K[];
}

const tr = (t: Tr = {}) => ({ ty: 'tr', p: p(t.p ?? [0, 0]), a: p(t.a ?? [0, 0]), s: p(t.s ?? [100, 100]), r: p(t.r ?? 0), o: p(t.o ?? 100), sk: p(0), sa: p(0) });

export const group = (items: object[], t?: Tr) => ({ ty: 'gr', it: [...items, tr(t)] });

/* ---------- Layers & document ---------- */

let index = 0;
export function layer(name: string, shapes: object[], t: Tr = {}, op = 240, ip = 0) {
  index += 1;
  return {
    ddd: 0,
    ind: index,
    ty: 4,
    nm: name,
    sr: 1,
    ks: { o: p(t.o ?? 100), r: p(t.r ?? 0), p: p(t.p ?? [80, 80, 0]), a: p(t.a ?? [0, 0, 0]), s: p(t.s ?? [100, 100, 100]) },
    ao: 0,
    shapes,
    ip,
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
  ddd: 0;
  assets: [];
  layers: object[];
}

export function doc(name: string, op: number, layers: object[], size = 160, fr = 60): LottieDoc {
  // Lottie draws the first layer on top; callers list layers back to front.
  return { v: '5.9.0', fr, ip: 0, op, w: size, h: size, nm: name, ddd: 0, assets: [], layers: [...layers].reverse() };
}
