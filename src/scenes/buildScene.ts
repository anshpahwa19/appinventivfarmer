/**
 * Procedural editorial landscapes of Indian farmland.
 *
 * Each scene is layered like a photograph: sky, sun and haze, Deccan-style
 * low hills, a tree line, patchwork fields, a main field in perspective and
 * a foreground crop band. Scenes are deterministic per (kind, seed, time) and
 * crisp at any pixel density. A real photo can replace any scene via `src`.
 */
import type { SceneKind, SceneSpec, SceneTime } from '@/types';
import { rng, type Rng } from '@/lib/random';
import { LAND, SKIES, mix, type SkyPalette } from './palettes';

export type SceneAspect = 'wide' | 'square' | 'portrait' | 'tall';
export type SceneDetail = 'low' | 'high';

const SIZES: Record<SceneAspect, [number, number]> = {
  wide: [800, 500],
  square: [600, 600],
  portrait: [600, 750],
  tall: [450, 975],
};

const DEFAULT_TIME: Record<SceneKind, SceneTime> = {
  paddy: 'morning',
  wheat: 'golden',
  mustard: 'day',
  cotton: 'day',
  soil: 'morning',
  harvest: 'golden',
  village: 'morning',
  workshop: 'day',
  canal: 'golden',
  monsoon: 'overcast',
};

const n = (v: number) => (Math.round(v * 10) / 10).toString();

function smooth(points: [number, number][]): string {
  let d = `M${n(points[0][0])},${n(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    d += ` C${n(p1[0] + (p2[0] - p0[0]) / 6)},${n(p1[1] + (p2[1] - p0[1]) / 6)} ${n(p2[0] - (p3[0] - p1[0]) / 6)},${n(p2[1] - (p3[1] - p1[1]) / 6)} ${n(p2[0])},${n(p2[1])}`;
  }
  return d;
}

interface Ctx {
  r: Rng;
  W: number;
  H: number;
  hz: number; // horizon y
  vx: number; // vanishing point x
  k: number; // scale factor relative to 800 wide
  ok: number; // scale for objects (people, machines); larger in tall formats
  sky: SkyPalette;
  id: (name: string) => string;
  hi: boolean;
  out: string[];
  defs: string[];
  sunX: number;
  sunY: number;
  /** Draws the horizon mist (set by drawHills, called after the tree line). */
  mist?: () => void;
}

/* ------------------------------------------------------------------ */
/* Sky                                                                  */
/* ------------------------------------------------------------------ */

function drawSky(c: Ctx) {
  const { W, hz, sky, id } = c;
  c.defs.push(
    `<linearGradient id="${id('sky')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky.top}"/><stop offset="0.62" stop-color="${sky.mid}"/><stop offset="1" stop-color="${sky.horizon}"/></linearGradient>`,
    `<radialGradient id="${id('glow')}"><stop offset="0" stop-color="${sky.glow}" stop-opacity="0.95"/><stop offset="0.35" stop-color="${sky.glow}" stop-opacity="0.45"/><stop offset="1" stop-color="${sky.glow}" stop-opacity="0"/></radialGradient>`,
  );
  c.out.push(`<rect width="${W}" height="${n(hz + 4)}" fill="url(#${id('sky')})"/>`);
  if (sky.sunVisible) {
    const gr = c.k * (sky.sunY > 0.7 ? 330 : 260);
    c.out.push(`<circle cx="${n(c.sunX)}" cy="${n(c.sunY)}" r="${n(gr)}" fill="url(#${id('glow')})"/>`);
    c.out.push(`<circle cx="${n(c.sunX)}" cy="${n(c.sunY)}" r="${n(c.k * 26)}" fill="${sky.sun}"/>`);
  }
}

function cloud(c: Ctx, x: number, y: number, s: number, fill: string, shade: string, opacity: number) {
  const r = c.r;
  const parts: string[] = [];
  const puffs = 5 + r.int(0, 3);
  for (let i = 0; i < puffs; i++) {
    const px = x + (i - puffs / 2) * 22 * s + r.range(-6, 6) * s;
    const rr = (18 + r.range(0, 16)) * s * (1 - Math.abs(i - puffs / 2) / puffs);
    parts.push(`<ellipse cx="${n(px)}" cy="${n(y - rr * 0.35)}" rx="${n(rr * 1.35)}" ry="${n(rr)}"/>`);
  }
  c.out.push(`<g opacity="${opacity}"><g fill="${shade}" opacity="0.55" transform="translate(0 ${n(3.5 * s)})">${parts.join('')}</g><g fill="${fill}">${parts.join('')}</g></g>`);
}

function drawClouds(c: Ctx, heavy = false) {
  const { r, W, hz, k, sky } = c;
  const count = heavy ? 7 : c.hi ? r.int(2, 4) : r.int(1, 3);
  for (let i = 0; i < count; i++) {
    const x = r.range(-0.05, 1.05) * W;
    const y = r.range(0.12, heavy ? 0.7 : 0.6) * hz;
    const s = k * r.range(heavy ? 1.6 : 0.8, heavy ? 2.6 : 1.5);
    cloud(c, x, y, s, sky.cloud, sky.cloudShade, heavy ? 0.92 : r.range(0.45, 0.75));
  }
}

function drawBirds(c: Ctx) {
  const { r, W, hz, k } = c;
  if (!c.hi || r.chance(0.35)) return;
  const bx = r.range(0.15, 0.8) * W;
  const by = r.range(0.2, 0.5) * hz;
  const count = r.int(3, 6);
  const d: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = bx + i * 16 * k + r.range(-6, 6) * k;
    const y = by + Math.sin(i) * 8 * k + r.range(-4, 4) * k;
    const s = k * r.range(0.7, 1.2);
    d.push(`M${n(x - 5 * s)},${n(y)} q${n(2.5 * s)},${n(-3 * s)} ${n(5 * s)},0 q${n(2.5 * s)},${n(-3 * s)} ${n(5 * s)},0`);
  }
  c.out.push(`<path d="${d.join(' ')}" fill="none" stroke="#2b2f2c" stroke-opacity="0.55" stroke-width="${n(1.3 * k)}" stroke-linecap="round"/>`);
}

/* ------------------------------------------------------------------ */
/* Distance: hills and tree line                                        */
/* ------------------------------------------------------------------ */

function ridge(c: Ctx, baseY: number, amp: number, flatTop: boolean): [number, number][] {
  const { r, W } = c;
  const ph = [r.range(0, 6.28), r.range(0, 6.28), r.range(0, 6.28)];
  const fr = [r.range(0.7, 1.4), r.range(2, 3.4), r.range(5, 8)];
  const segs = 18;
  const pts: [number, number][] = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    let h = 0.5 + 0.32 * Math.sin(t * fr[0] * Math.PI * 2 + ph[0]) + 0.14 * Math.sin(t * fr[1] * Math.PI * 2 + ph[1]) + 0.05 * Math.sin(t * fr[2] * Math.PI * 2 + ph[2]);
    if (flatTop) h = Math.min(h, 0.72) + (h > 0.72 ? 0.02 : 0); // Deccan mesas
    pts.push([-30 + ((W + 60) * i) / segs, baseY - amp * h]);
  }
  return pts;
}

function drawHills(c: Ctx) {
  const { W, H, hz, k, sky, id } = c;
  const far = mix(sky.haze, '#6c84a0', 0.42);
  const mid = mix(sky.haze, '#5f7a7c', 0.55);
  const near = mix(sky.haze, '#4f6d50', 0.62);
  const p0 = ridge(c, hz + 2, 92 * k, true);
  c.out.push(`<path d="${smooth(p0)} L${W + 30},${H} L-30,${H} Z" fill="${far}" opacity="0.7"/>`);
  const p1 = ridge(c, hz + 3, 58 * k, true);
  c.out.push(`<path d="${smooth(p1)} L${W + 30},${H} L-30,${H} Z" fill="${mid}" opacity="0.85"/>`);
  const p2 = ridge(c, hz + 4, 26 * k, false);
  c.out.push(`<path d="${smooth(p2)} L${W + 30},${H} L-30,${H} Z" fill="${near}" opacity="0.92"/>`);
  // Mist that sits on the horizon and softens the distance.
  c.defs.push(`<linearGradient id="${id('mist')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky.horizon}" stop-opacity="0"/><stop offset="0.55" stop-color="${sky.horizon}" stop-opacity="0.55"/><stop offset="1" stop-color="${sky.horizon}" stop-opacity="0"/></linearGradient>`);
  c.mist = () => c.out.push(`<rect x="0" y="${n(hz - 40 * k)}" width="${W}" height="${n(64 * k)}" fill="url(#${id('mist')})"/>`);
}

function treeShape(c: Ctx, x: number, y: number, s: number, dark: string, light: string): string {
  const r = c.r;
  const parts: string[] = [];
  parts.push(`<rect x="${n(x - 1.2 * s)}" y="${n(y - 9 * s)}" width="${n(2.4 * s)}" height="${n(9 * s)}" fill="${dark}"/>`);
  const blobs = 3 + r.int(0, 2);
  for (let i = 0; i < blobs; i++) {
    const bx = x + r.range(-7, 7) * s;
    const by = y - (12 + r.range(0, 7)) * s;
    const br = (6 + r.range(0, 5)) * s;
    parts.push(`<circle cx="${n(bx)}" cy="${n(by)}" r="${n(br)}" fill="${i % 2 ? light : dark}"/>`);
  }
  return parts.join('');
}

function palmShape(x: number, y: number, s: number, color: string, lean: number): string {
  const topX = x + lean * 10 * s;
  const topY = y - 46 * s;
  const fronds: string[] = [];
  const angles = [-160, -130, -100, -70, -40, -15, 15];
  for (const a of angles) {
    const rad = (a * Math.PI) / 180;
    const ex = topX + Math.cos(rad) * 18 * s;
    const ey = topY + Math.sin(rad) * 10 * s + 9 * s;
    const cx = topX + Math.cos(rad) * 11 * s;
    const cy = topY + Math.sin(rad) * 12 * s - 2 * s;
    fronds.push(`M${n(topX)},${n(topY)} Q${n(cx)},${n(cy)} ${n(ex)},${n(ey)}`);
  }
  return `<path d="M${n(x)},${n(y)} Q${n(x + lean * 2 * s)},${n(y - 25 * s)} ${n(topX)},${n(topY)}" stroke="${color}" stroke-width="${n(2.4 * s)}" fill="none" stroke-linecap="round"/><path d="${fronds.join(' ')}" stroke="${color}" stroke-width="${n(3 * s)}" fill="none" stroke-linecap="round"/>`;
}

function drawTreeLine(c: Ctx, opts: { palms?: boolean; density?: number } = {}) {
  const { r, W, hz, k, sky } = c;
  const dark = mix(LAND.tree[2], sky.haze, 0.42);
  const light = mix(LAND.tree[1], sky.haze, 0.48);
  const out: string[] = [];
  let x = -10;
  const density = opts.density ?? 1;
  while (x < W + 10) {
    const gap = r.range(10, 34) * k / density;
    if (r.chance(0.82)) {
      const s = k * r.range(0.75, 1.35);
      if (opts.palms && r.chance(0.3)) out.push(palmShape(x, hz + 3, s * 0.9, dark, r.range(-0.6, 0.6)));
      else out.push(treeShape(c, x, hz + 3, r.chance(0.12) ? s * 1.7 : s, dark, light));
    }
    x += gap;
  }
  // Low scrub band to sit trees on the ground.
  out.push(`<rect x="0" y="${n(hz - 1)}" width="${W}" height="${n(5 * k)}" fill="${dark}" opacity="0.9"/>`);
  c.out.push(`<g>${out.join('')}</g>`);
  c.mist?.();
}

/* ------------------------------------------------------------------ */
/* Fields                                                               */
/* ------------------------------------------------------------------ */

/** Patchwork strips between the horizon and the main field. */
function drawPatchwork(c: Ctx, palette: string[][], bottom: number) {
  const { r, W, hz, sky } = c;
  let y = hz + 2;
  let h = 3 * c.k;
  const strips: string[] = [];
  while (y < bottom) {
    const fam = r.pick(palette);
    const col = mix(r.pick([fam[0], fam[1], fam[2]]), sky.haze, Math.max(0, 0.55 - ((y - hz) / (bottom - hz)) * 0.45));
    const tiltL = r.range(-2, 2) * c.k;
    const tiltR = r.range(-2, 2) * c.k;
    // Split some strips into two plots with a diagonal boundary.
    if (r.chance(0.45)) {
      const sx = r.range(0.2, 0.8) * W;
      const fam2 = r.pick(palette);
      const col2 = mix(fam2[0], sky.haze, Math.max(0, 0.5 - ((y - hz) / (bottom - hz)) * 0.45));
      strips.push(`<path d="M0,${n(y + tiltL)} L${n(sx)},${n(y)} L${n(sx + h * 2)},${n(y + h + 1)} L0,${n(y + h + tiltL + 1)} Z" fill="${col}"/>`);
      strips.push(`<path d="M${n(sx)},${n(y)} L${W},${n(y + tiltR)} L${W},${n(y + h + tiltR + 1)} L${n(sx + h * 2)},${n(y + h + 1)} Z" fill="${col2}"/>`);
    } else {
      strips.push(`<path d="M0,${n(y + tiltL)} L${W},${n(y + tiltR)} L${W},${n(y + h + tiltR + 1)} L0,${n(y + h + tiltL + 1)} Z" fill="${col}"/>`);
    }
    // Bund line
    strips.push(`<path d="M0,${n(y + h + tiltL)} L${W},${n(y + h + tiltR)}" stroke="${mix(LAND.dryGrass[1], sky.haze, 0.4)}" stroke-width="${n(0.8 * c.k)}" opacity="0.7"/>`);
    y += h;
    h *= 1.45;
  }
  c.out.push(`<g>${strips.join('')}</g>`);
}

interface RowStyle {
  base: [string, string]; // gradient top → bottom of the field
  row: [string, string];
  rowRatio: number; // row width vs spacing
  spacing: number; // at the bottom edge, in 800-scale units
}

/** Main field: rows converging on the vanishing point. */
function drawRows(c: Ctx, top: number, style: RowStyle) {
  const { W, H, hz, vx, k, id, sky } = c;
  c.defs.push(
    `<linearGradient id="${id('fieldBase')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(style.base[0], sky.haze, 0.25)}"/><stop offset="1" stop-color="${style.base[1]}"/></linearGradient>`,
    `<linearGradient id="${id('rowFill')}" gradientUnits="userSpaceOnUse" x1="0" y1="${n(top)}" x2="0" y2="${H}"><stop offset="0" stop-color="${mix(mix(style.row[0], style.base[0], 0.55), sky.haze, 0.3)}"/><stop offset="0.5" stop-color="${mix(style.row[1], style.base[1], 0.35)}"/><stop offset="1" stop-color="${style.row[1]}"/></linearGradient>`,
  );
  c.out.push(`<rect x="0" y="${n(top)}" width="${W}" height="${n(H - top)}" fill="url(#${id('fieldBase')})"/>`);
  const sb = style.spacing * k * (c.hi ? 1 : 1.35);
  const ratioTop = (top - hz) / (H - hz);
  const rows: string[] = [];
  const maxI = Math.ceil((W * 1.6) / (sb * ratioTop));
  for (let i = -maxI; i <= maxI; i++) {
    const bx = vx + i * sb;
    const xt = vx + (bx - vx) * ratioTop;
    if (xt < -40 || xt > W + 40) continue;
    const wb = sb * style.rowRatio;
    const wt = wb * ratioTop;
    rows.push(`M${n(bx - wb / 2)},${H} L${n(bx + wb / 2)},${H} L${n(xt + wt / 2)},${n(top)} L${n(xt - wt / 2)},${n(top)} Z`);
  }
  c.out.push(`<path d="${rows.join(' ')}" fill="url(#${id('rowFill')})"/>`);
}

/* ------------------------------------------------------------------ */
/* Foreground plants                                                    */
/* ------------------------------------------------------------------ */

function grassBlades(c: Ctx, colorA: string, colorB: string, height: number, count: number) {
  const { r, W, H, k } = c;
  const d1: string[] = [];
  const d2: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = r.range(-10, W + 10);
    const h = height * k * r.range(0.55, 1.15);
    const lean = r.range(-0.6, 0.6) * h;
    const blade = `M${n(x)},${H + 2} Q${n(x + lean * 0.2)},${n(H - h * 0.6)} ${n(x + lean)},${n(H - h)}`;
    (i % 2 ? d1 : d2).push(blade);
  }
  c.out.push(`<path d="${d1.join(' ')}" stroke="${colorA}" stroke-width="${n(2.4 * k)}" fill="none" stroke-linecap="round"/>`);
  c.out.push(`<path d="${d2.join(' ')}" stroke="${colorB}" stroke-width="${n(2 * k)}" fill="none" stroke-linecap="round"/>`);
}

function wheatEars(c: Ctx, count: number) {
  const { r, W, H, k } = c;
  const stems: string[] = [];
  const ears: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = r.range(-10, W + 10);
    const h = k * r.range(40, 95);
    const lean = r.range(-14, 14) * k;
    const tx = x + lean;
    const ty = H - h;
    stems.push(`M${n(x)},${H + 2} Q${n(x + lean * 0.3)},${n(H - h * 0.5)} ${n(tx)},${n(ty)}`);
    const a = Math.atan2(-h, lean) * (180 / Math.PI) + 90;
    ears.push(`<ellipse cx="${n(tx)}" cy="${n(ty - 7 * k)}" rx="${n(3.2 * k)}" ry="${n(10 * k)}" transform="rotate(${n(a)} ${n(tx)} ${n(ty)})"/>`);
  }
  c.out.push(`<path d="${stems.join(' ')}" stroke="#a7792c" stroke-width="${n(1.6 * k)}" fill="none"/>`);
  c.out.push(`<g fill="#c8963d">${ears.join('')}</g>`);
}

function mustardFlowers(c: Ctx, count: number) {
  const { r, W, H, k } = c;
  const stems: string[] = [];
  const blooms: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = r.range(-10, W + 10);
    const h = k * r.range(30, 85);
    const tx = x + r.range(-8, 8) * k;
    stems.push(`M${n(x)},${H + 2} L${n(tx)},${n(H - h)}`);
    for (let j = 0; j < 5; j++) blooms.push(`<circle cx="${n(tx + r.range(-6, 6) * k)}" cy="${n(H - h + r.range(-6, 4) * k)}" r="${n(r.range(2.2, 3.6) * k)}"/>`);
  }
  c.out.push(`<path d="${stems.join(' ')}" stroke="#5f8a2e" stroke-width="${n(1.6 * k)}" fill="none"/>`);
  c.out.push(`<g fill="#f7d83a">${blooms.join('')}</g>`);
}

function cottonBushes(c: Ctx, count: number) {
  const { r, W, H, k } = c;
  const leaves: string[] = [];
  const bolls: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = r.range(-20, W + 20);
    const s = k * r.range(0.8, 1.5);
    for (let j = 0; j < 4; j++) leaves.push(`<circle cx="${n(x + r.range(-14, 14) * s)}" cy="${n(H - r.range(4, 26) * s)}" r="${n(r.range(7, 12) * s)}"/>`);
    for (let j = 0; j < 4; j++) bolls.push(`<circle cx="${n(x + r.range(-14, 14) * s)}" cy="${n(H - r.range(8, 30) * s)}" r="${n(r.range(2.6, 4) * s)}"/>`);
  }
  c.out.push(`<g fill="#3e6b33">${leaves.join('')}</g><g fill="#fbfaf4">${bolls.join('')}</g>`);
}

function paddyTufts(c: Ctx, top: number, count: number) {
  const { r, W, H, vx, hz, k } = c;
  const d: string[] = [];
  for (let i = 0; i < count; i++) {
    const y = r.range(top + (H - top) * 0.45, H);
    const depth = (y - hz) / (H - hz);
    const x = vx + (r.range(-1.6, 1.6) * W) * depth;
    if (x < -10 || x > W + 10) continue;
    const s = depth * k * 1.6;
    d.push(`M${n(x)},${n(y)} l${n(-4 * s)},${n(-9 * s)} M${n(x)},${n(y)} l0,${n(-11 * s)} M${n(x)},${n(y)} l${n(4 * s)},${n(-9 * s)}`);
  }
  c.out.push(`<path d="${d.join(' ')}" stroke="#4f8f3a" stroke-width="${n(1.6 * k)}" stroke-linecap="round" fill="none"/>`);
}

function cottonBolls(c: Ctx, top: number, count: number) {
  const { r, W, H, vx, hz, k } = c;
  const d: string[] = [];
  for (let i = 0; i < count; i++) {
    const y = r.range(top + (H - top) * 0.1, H - 20 * k);
    const depth = (y - hz) / (H - hz);
    const x = vx + r.range(-1.6, 1.6) * W * depth;
    if (x < -5 || x > W + 5) continue;
    d.push(`<circle cx="${n(x)}" cy="${n(y)}" r="${n(Math.max(0.6, 2.6 * depth * k * 1.4))}"/>`);
  }
  c.out.push(`<g fill="#fbfaf4" opacity="0.92">${d.join('')}</g>`);
}

/* ------------------------------------------------------------------ */
/* Objects                                                              */
/* ------------------------------------------------------------------ */

function person(x: number, y: number, s: number, cloth: string, pose: 'stand' | 'bend' | 'walk', headCloth?: string): string {
  const skin = '#6a4530';
  if (pose === 'bend') {
    return `<g><path d="M${n(x - 2 * s)},${n(y)} L${n(x - 1 * s)},${n(y - 7 * s)} L${n(x + 1.5 * s)},${n(y - 7 * s)} L${n(x + 2 * s)},${n(y)} Z" fill="${skin}"/><path d="M${n(x - 4 * s)},${n(y - 3 * s)} Q${n(x)},${n(y - 12 * s)} ${n(x + 8 * s)},${n(y - 12.5 * s)} L${n(x + 9 * s)},${n(y - 9.5 * s)} Q${n(x + 2 * s)},${n(y - 8 * s)} ${n(x + 3 * s)},${n(y - 2 * s)} Z" fill="${cloth}"/><circle cx="${n(x + 10.5 * s)}" cy="${n(y - 11 * s)}" r="${n(2.3 * s)}" fill="${headCloth ?? skin}"/><path d="M${n(x + 8 * s)},${n(y - 10 * s)} L${n(x + 9 * s)},${n(y - 3 * s)}" stroke="${skin}" stroke-width="${n(1.2 * s)}" stroke-linecap="round"/></g>`;
  }
  const stride = pose === 'walk' ? 2.2 * s : 1 * s;
  return `<g><path d="M${n(x - stride)},${n(y)} L${n(x - 0.6 * s)},${n(y - 7 * s)} M${n(x + stride)},${n(y)} L${n(x + 0.6 * s)},${n(y - 7 * s)}" stroke="${skin}" stroke-width="${n(1.5 * s)}" stroke-linecap="round"/><path d="M${n(x - 3.2 * s)},${n(y - 3 * s)} L${n(x - 2.2 * s)},${n(y - 14.5 * s)} Q${n(x)},${n(y - 16 * s)} ${n(x + 2.2 * s)},${n(y - 14.5 * s)} L${n(x + 3.2 * s)},${n(y - 3 * s)} Z" fill="${cloth}"/><circle cx="${n(x)}" cy="${n(y - 17.6 * s)}" r="${n(2.3 * s)}" fill="${headCloth ?? skin}"/></g>`;
}

function tractor(x: number, y: number, s: number, body: string, flip = false): string {
  const t = flip ? ` transform="translate(${n(2 * x)} 0) scale(-1 1)"` : '';
  return `<g${t}><rect x="${n(x - 3 * s)}" y="${n(y - 25 * s)}" width="${n(11 * s)}" height="${n(2 * s)}" rx="${n(1 * s)}" fill="#2a2a28"/><path d="M${n(x - 2 * s)},${n(y - 23 * s)} L${n(x - 1 * s)},${n(y - 15 * s)} M${n(x + 7 * s)},${n(y - 23 * s)} L${n(x + 7 * s)},${n(y - 15 * s)}" stroke="#2a2a28" stroke-width="${n(1.2 * s)}"/><path d="M${n(x - 4 * s)},${n(y - 15 * s)} L${n(x + 26 * s)},${n(y - 15 * s)} L${n(x + 28 * s)},${n(y - 8 * s)} L${n(x - 4 * s)},${n(y - 8 * s)} Z" fill="${body}"/><rect x="${n(x + 10 * s)}" y="${n(y - 19 * s)}" width="${n(14 * s)}" height="${n(5 * s)}" rx="${n(1.5 * s)}" fill="${body}"/><rect x="${n(x + 19 * s)}" y="${n(y - 26 * s)}" width="${n(1.4 * s)}" height="${n(8 * s)}" fill="#2a2a28"/><circle cx="${n(x)}" cy="${n(y - 9.5 * s)}" r="${n(9.5 * s)}" fill="#22211f"/><circle cx="${n(x)}" cy="${n(y - 9.5 * s)}" r="${n(4.2 * s)}" fill="#d9a12c"/><circle cx="${n(x + 23 * s)}" cy="${n(y - 5 * s)}" r="${n(5 * s)}" fill="#22211f"/><circle cx="${n(x + 23 * s)}" cy="${n(y - 5 * s)}" r="${n(2.2 * s)}" fill="#d9a12c"/></g>`;
}

function bale(x: number, y: number, s: number, tone: string): string {
  const w = 16 * s;
  const h = 9 * s;
  const d = 5 * s;
  const light = mix(tone, '#fff6d8', 0.35);
  const dark = mix(tone, '#5a3d17', 0.35);
  return `<g><path d="M${n(x)},${n(y - h)} L${n(x + d)},${n(y - h - d * 0.6)} L${n(x + w + d)},${n(y - h - d * 0.6)} L${n(x + w)},${n(y - h)} Z" fill="${light}"/><path d="M${n(x + w)},${n(y - h)} L${n(x + w + d)},${n(y - h - d * 0.6)} L${n(x + w + d)},${n(y - d * 0.6)} L${n(x + w)},${n(y)} Z" fill="${dark}"/><rect x="${n(x)}" y="${n(y - h)}" width="${n(w)}" height="${n(h)}" fill="${tone}"/><path d="M${n(x + w * 0.33)},${n(y - h)} v${n(h)} M${n(x + w * 0.66)},${n(y - h)} v${n(h)}" stroke="${dark}" stroke-width="${n(0.7 * s)}" opacity="0.6"/></g>`;
}

function hut(x: number, y: number, s: number, wall: string): string {
  return `<g><rect x="${n(x - 11 * s)}" y="${n(y - 12 * s)}" width="${n(22 * s)}" height="${n(12 * s)}" fill="${wall}"/><rect x="${n(x - 2.5 * s)}" y="${n(y - 7.5 * s)}" width="${n(5 * s)}" height="${n(7.5 * s)}" fill="#4a3324"/><path d="M${n(x - 14 * s)},${n(y - 11 * s)} L${n(x)},${n(y - 22 * s)} L${n(x + 14 * s)},${n(y - 11 * s)} Z" fill="#7a5532"/><path d="M${n(x - 14 * s)},${n(y - 11 * s)} L${n(x + 14 * s)},${n(y - 11 * s)}" stroke="#5b3d22" stroke-width="${n(1.2 * s)}"/></g>`;
}

function banyan(c: Ctx, x: number, y: number, s: number): string {
  const r = c.r;
  const dark = LAND.tree[2];
  const mid = LAND.tree[0];
  const light = LAND.tree[1];
  const parts: string[] = [];
  parts.push(`<path d="M${n(x - 5 * s)},${n(y)} Q${n(x - 3 * s)},${n(y - 22 * s)} ${n(x - 6 * s)},${n(y - 40 * s)} L${n(x + 6 * s)},${n(y - 40 * s)} Q${n(x + 3 * s)},${n(y - 22 * s)} ${n(x + 6 * s)},${n(y)} Z" fill="#4a3526"/>`);
  for (let i = 0; i < 6; i++) parts.push(`<path d="M${n(x + r.range(-34, 34) * s)},${n(y - 40 * s)} v${n(r.range(18, 36) * s)}" stroke="#5a4130" stroke-width="${n(0.9 * s)}" opacity="0.7"/>`);
  for (let i = 0; i < 9; i++) {
    const bx = x + r.range(-42, 42) * s;
    const by = y - (44 + r.range(0, 26)) * s;
    parts.push(`<circle cx="${n(bx)}" cy="${n(by)}" r="${n(r.range(14, 22) * s)}" fill="${i < 3 ? dark : i < 7 ? mid : light}"/>`);
  }
  return `<g>${parts.join('')}</g>`;
}

function shamiana(c: Ctx, x: number, y: number, s: number): string {
  const r = c.r;
  const w = 120 * s;
  const left = x - w / 2;
  const top = y - 46 * s;
  const stripes: string[] = [];
  const n6 = 8;
  for (let i = 0; i < n6; i++) {
    const x0 = left + (w * i) / n6;
    const x1 = left + (w * (i + 1)) / n6;
    stripes.push(`<path d="M${n(x0)},${n(top + 12 * s)} L${n(x)},${n(top)} L${n(x1)},${n(top + 12 * s)} Z" fill="${i % 2 ? '#f6ead0' : '#d9532c'}"/>`);
  }
  const valance: string[] = [];
  for (let i = 0; i < 12; i++) {
    const vx = left + (w * i) / 12;
    valance.push(`<path d="M${n(vx)},${n(top + 12 * s)} q${n((w / 24))},${n(7 * s)} ${n(w / 12)},0 Z" fill="${i % 2 ? '#d9532c' : '#f6ead0'}"/>`);
  }
  const poles = [0, 0.33, 0.66, 1].map((t) => `<rect x="${n(left + w * t - 1 * s)}" y="${n(top + 12 * s)}" width="${n(2 * s)}" height="${n(34 * s)}" fill="#6b4a2e"/>`);
  const people: string[] = [];
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 9; i++) {
      const px = left + 10 * s + i * (w - 20 * s) / 8 + r.range(-2, 2) * s;
      const py = y - (row * 6 + 2) * s;
      const col = r.pick(['#c2412d', '#e0a43a', '#2f6b8a', '#7a3d6b', '#f2efe6', '#3c7a4a']);
      people.push(`<ellipse cx="${n(px)}" cy="${n(py - 4 * s)}" rx="${n(4 * s)}" ry="${n(4.4 * s)}" fill="${col}"/><circle cx="${n(px)}" cy="${n(py - 10 * s)}" r="${n(2.4 * s)}" fill="#4a3324"/>`);
    }
  }
  const shade = `<path d="M${n(left)},${n(top + 12 * s)} L${n(left + w)},${n(top + 12 * s)} L${n(left + w)},${n(y)} L${n(left)},${n(y)} Z" fill="#000" opacity="0.12"/>`;
  return `<g>${shade}${poles.join('')}${people.join('')}${stripes.join('')}${valance.join('')}</g>`;
}

/* ------------------------------------------------------------------ */
/* Finishing                                                            */
/* ------------------------------------------------------------------ */

function finish(c: Ctx) {
  const { W, H, id, sky } = c;
  c.defs.push(
    `<radialGradient id="${id('light')}" cx="${n(c.sunX / W)}" cy="${n(c.sunY / H)}" r="0.9"><stop offset="0" stop-color="${sky.light}" stop-opacity="${sky.lightOpacity * 2.2}"/><stop offset="1" stop-color="${sky.light}" stop-opacity="0"/></radialGradient>`,
    `<linearGradient id="${id('shade')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0.55" stop-color="#0c1a10" stop-opacity="0"/><stop offset="1" stop-color="#0c1a10" stop-opacity="0.22"/></linearGradient>`,
  );
  c.out.push(`<rect width="${W}" height="${H}" fill="url(#${id('light')})"/>`);
  c.out.push(`<rect width="${W}" height="${H}" fill="url(#${id('shade')})"/>`);
}

/* ------------------------------------------------------------------ */
/* Scene recipes                                                        */
/* ------------------------------------------------------------------ */

function fieldTop(c: Ctx) {
  return c.hz + (c.H - c.hz) * 0.26;
}

const RECIPES: Record<SceneKind, (c: Ctx) => void> = {
  paddy(c) {
    drawClouds(c);
    drawHills(c);
    drawTreeLine(c, { palms: true });
    const top = fieldTop(c);
    drawPatchwork(c, [LAND.paddyGreen, LAND.youngGreen], top);
    drawRows(c, top, { base: [c.sky.horizon, mix(c.sky.mid, '#6d8f8a', 0.45)], row: [LAND.youngGreen[1], LAND.paddyGreen[2]], rowRatio: 0.42, spacing: 46 });
    if (c.hi) paddyTufts(c, top, 160);
    const s = c.ok * 1.7;
    const by = c.hz + (c.H - c.hz) * 0.5;
    c.out.push(person(c.W * 0.62, by, s, '#c8322b', 'bend', '#e0a43a'));
    c.out.push(person(c.W * 0.7, by + 6 * c.ok, s * 1.05, '#d9862b', 'bend'));
    if (c.hi) c.out.push(person(c.W * 0.31, by - 8 * c.ok, s * 0.85, '#7a3d6b', 'bend'));
    grassBlades(c, '#4b8a35', '#6aa648', 34, c.hi ? 70 : 30);
  },
  wheat(c) {
    drawClouds(c);
    drawHills(c);
    drawTreeLine(c);
    const top = fieldTop(c);
    drawPatchwork(c, [LAND.wheatGold, LAND.dryGrass, LAND.youngGreen], top);
    drawRows(c, top, { base: [LAND.wheatGold[1], LAND.wheatGold[0]], row: [LAND.wheatGold[3], LAND.wheatGold[2]], rowRatio: 0.3, spacing: 34 });
    if (c.hi) c.out.push(person(c.W * 0.7, c.hz + (c.H - c.hz) * 0.42, c.ok * 1.5, '#f2efe6', 'walk', '#f2efe6'));
    wheatEars(c, c.hi ? 70 : 28);
  },
  mustard(c) {
    drawClouds(c);
    drawHills(c);
    drawTreeLine(c);
    const top = fieldTop(c);
    drawPatchwork(c, [LAND.mustard, LAND.youngGreen, LAND.mustard], top);
    drawRows(c, top, { base: [LAND.mustard[1], LAND.mustard[0]], row: [LAND.mustard[3], LAND.mustard[2]], rowRatio: 0.35, spacing: 40 });
    mustardFlowers(c, c.hi ? 60 : 24);
  },
  cotton(c) {
    drawClouds(c);
    drawHills(c);
    drawTreeLine(c);
    const top = fieldTop(c);
    drawPatchwork(c, [LAND.cottonGreen, LAND.youngGreen, LAND.dryGrass], top);
    drawRows(c, top, { base: [mix(LAND.soil[1], LAND.dryGrass[1], 0.45), mix(LAND.soil[0], LAND.cottonGreen[2], 0.35)], row: [LAND.cottonGreen[1], mix(LAND.cottonGreen[2], LAND.cottonGreen[0], 0.4)], rowRatio: 0.72, spacing: 58 });
    if (c.hi) cottonBolls(c, top, 220);
    if (c.hi) c.out.push(person(c.W * 0.34, c.hz + (c.H - c.hz) * 0.48, c.ok * 1.6, '#2f6b8a', 'stand', '#f2efe6'));
    cottonBushes(c, c.hi ? 16 : 7);
  },
  soil(c) {
    drawClouds(c);
    drawHills(c);
    drawTreeLine(c);
    const top = fieldTop(c);
    drawPatchwork(c, [LAND.soil, LAND.youngGreen, LAND.dryGrass], top);
    drawRows(c, top, { base: [LAND.soil[1], LAND.soil[0]], row: [LAND.soil[3], mix(LAND.soil[2], LAND.soil[0], 0.35)], rowRatio: 0.42, spacing: 30 });
    c.out.push(tractor(c.W * 0.55, c.hz + (c.H - c.hz) * 0.46, c.ok * 2.1, '#b8432f'));
    grassBlades(c, '#6b7a3a', '#8a8f4a', 22, c.hi ? 40 : 16);
  },
  harvest(c) {
    drawClouds(c);
    drawHills(c);
    drawTreeLine(c, { palms: c.r.chance(0.5) });
    const top = fieldTop(c);
    drawPatchwork(c, [LAND.stubble, LAND.dryGrass, LAND.youngGreen], top);
    drawRows(c, top, { base: [LAND.stubble[1], LAND.stubble[0]], row: [LAND.stubble[3], LAND.stubble[2]], rowRatio: 0.22, spacing: 26 });
    // Bales scattered in perspective, back to front.
    const bales: [number, number][] = [];
    const count = c.hi ? 9 : 5;
    for (let i = 0; i < count; i++) bales.push([c.r.range(0.05, 0.95), c.r.range(0.18, 0.92)]);
    bales.sort((a, b) => a[1] - b[1]);
    const tone = '#d8ad5c';
    const trY = c.hz + (c.H - c.hz) * 0.36;
    c.out.push(tractor(c.W * 0.22, trY, c.ok * 1.5, '#b8432f'));
    for (const [fx, fy] of bales) {
      const y = top + (c.H - top) * fy;
      const depth = (y - c.hz) / (c.H - c.hz);
      c.out.push(bale(fx * c.W, y, c.ok * 3.2 * depth + 0.4 * c.ok, tone));
    }
    grassBlades(c, '#b08a46', '#caa25a', 20, c.hi ? 60 : 24);
  },
  village(c) {
    drawClouds(c);
    drawHills(c);
    drawTreeLine(c, { density: 0.7 });
    const top = fieldTop(c);
    drawPatchwork(c, [LAND.youngGreen, LAND.wheatGold, LAND.dryGrass], top);
    drawRows(c, top, { base: [LAND.youngGreen[1], LAND.youngGreen[0]], row: [LAND.youngGreen[3], LAND.youngGreen[2]], rowRatio: 0.3, spacing: 40 });
    // Dirt path from the viewer into the village.
    const pathTop = c.vx + c.W * 0.06;
    c.out.push(`<path d="M${n(c.W * 0.38)},${c.H} C${n(c.W * 0.5)},${n(c.H * 0.85)} ${n(pathTop - 20 * c.k)},${n(top + 30 * c.k)} ${n(pathTop)},${n(c.hz + 6 * c.k)} L${n(pathTop + 8 * c.k)},${n(c.hz + 6 * c.k)} C${n(pathTop + 10 * c.k)},${n(top + 40 * c.k)} ${n(c.W * 0.7)},${n(c.H * 0.86)} ${n(c.W * 0.66)},${c.H} Z" fill="#c9a77a"/>`);
    const hy = c.hz + 10 * c.k;
    const walls = ['#e9dcc3', '#d9b98a', '#f1e8d6', '#c98f5a'];
    for (let i = 0; i < 5; i++) c.out.push(hut(c.vx + c.W * (0.1 + i * 0.07), hy + (i % 2) * 3 * c.ok, c.ok * (1 + (i % 3) * 0.12), walls[i % walls.length]));
    c.out.push(banyan(c, c.W * 0.16, c.hz + (c.H - c.hz) * 0.42, c.ok * 1.2));
    const py = c.hz + (c.H - c.hz) * 0.55;
    c.out.push(person(c.W * 0.53, py, c.ok * 2, '#c8322b', 'walk', '#e0a43a'));
    c.out.push(person(c.W * 0.585, py + 8 * c.ok, c.ok * 2.1, '#2f6b8a', 'walk', '#f2efe6'));
    grassBlades(c, '#5c8a3a', '#7aa44e', 28, c.hi ? 50 : 20);
  },
  workshop(c) {
    drawClouds(c);
    drawHills(c);
    drawTreeLine(c, { density: 0.9 });
    const top = fieldTop(c);
    drawPatchwork(c, [LAND.youngGreen, LAND.dryGrass], top);
    drawRows(c, top, { base: [LAND.dryGrass[1], LAND.dryGrass[0]], row: [LAND.dryGrass[3], LAND.dryGrass[2]], rowRatio: 0.12, spacing: 36 });
    c.out.push(banyan(c, c.W * 0.86, c.hz + (c.H - c.hz) * 0.36, c.ok * 1.1));
    c.out.push(shamiana(c, c.W * 0.48, c.hz + (c.H - c.hz) * 0.66, c.ok * 2.2));
    grassBlades(c, '#7b8a45', '#98a35a', 22, c.hi ? 40 : 16);
  },
  canal(c) {
    drawClouds(c);
    drawHills(c);
    drawTreeLine(c, { palms: true });
    const top = fieldTop(c);
    drawPatchwork(c, [LAND.paddyGreen, LAND.youngGreen, LAND.wheatGold], top);
    drawRows(c, top, { base: [LAND.youngGreen[1], LAND.paddyGreen[0]], row: [LAND.youngGreen[3], LAND.paddyGreen[2]], rowRatio: 0.34, spacing: 38 });
    // Canal: a reflective channel to the vanishing point.
    c.defs.push(`<linearGradient id="${c.id('water')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.sky.horizon}"/><stop offset="1" stop-color="${mix(c.sky.top, '#2f5c6a', 0.35)}"/></linearGradient>`);
    const bw = c.W * 0.2;
    c.out.push(`<path d="M${n(c.vx - bw)},${c.H} L${n(c.vx - 2 * c.k)},${n(c.hz + 4)} L${n(c.vx + 2 * c.k)},${n(c.hz + 4)} L${n(c.vx + bw)},${c.H} Z" fill="#7c8f5a"/>`);
    c.out.push(`<path d="M${n(c.vx - bw * 0.8)},${c.H} L${n(c.vx - 1 * c.k)},${n(c.hz + 5)} L${n(c.vx + 1 * c.k)},${n(c.hz + 5)} L${n(c.vx + bw * 0.8)},${c.H} Z" fill="url(#${c.id('water')})"/>`);
    for (let i = 0; i < (c.hi ? 6 : 3); i++) {
      const y = c.hz + (c.H - c.hz) * (0.15 + i * 0.13);
      const depth = (y - c.hz) / (c.H - c.hz);
      c.out.push(palmShape(c.vx + bw * 1.05 * depth + 10 * c.k, y, c.k * 1.4 * depth + 0.3 * c.k, '#2f5530', -0.3));
    }
    grassBlades(c, '#4b7a35', '#6aa648', 30, c.hi ? 50 : 20);
  },
  monsoon(c) {
    drawClouds(c, true);
    drawHills(c);
    drawTreeLine(c, { palms: true });
    const top = fieldTop(c);
    drawPatchwork(c, [LAND.paddyGreen, LAND.youngGreen], top);
    drawRows(c, top, { base: [LAND.youngGreen[1], LAND.paddyGreen[0]], row: [LAND.youngGreen[3], LAND.paddyGreen[2]], rowRatio: 0.4, spacing: 42 });
    const d: string[] = [];
    for (let i = 0; i < (c.hi ? 120 : 50); i++) {
      const x = c.r.range(-20, c.W + 20);
      const y = c.r.range(0, c.H);
      d.push(`M${n(x)},${n(y)} l${n(-5 * c.k)},${n(16 * c.k)}`);
    }
    c.out.push(`<path d="${d.join(' ')}" stroke="#ffffff" stroke-opacity="0.38" stroke-width="${n(1.1 * c.k)}" stroke-linecap="round"/>`);
    if (c.hi) c.out.push(person(c.W * 0.64, c.hz + (c.H - c.hz) * 0.5, c.ok * 1.8, '#1f4d6b', 'walk', '#2a2a28'));
    grassBlades(c, '#3f7a33', '#5f9c45', 34, c.hi ? 70 : 30);
  },
};

export interface BuiltScene {
  viewBox: string;
  markup: string;
}

export function buildScene(spec: SceneSpec, aspect: SceneAspect, detail: SceneDetail, idPrefix: string): BuiltScene {
  const [W, H] = SIZES[aspect];
  const time = spec.time ?? DEFAULT_TIME[spec.kind];
  const sky = SKIES[time];
  const r = rng(spec.seed * 7919 + spec.kind.length * 131);
  const hzFrac = aspect === 'tall' ? 0.44 : aspect === 'portrait' ? 0.42 : 0.46;
  const hz = H * hzFrac;
  const k = Math.min(W, H * 1.4) / 800;
  const sunX = W * r.range(0.25, 0.78);
  const sunY = hz * (0.2 + sky.sunY * 0.72);
  const c: Ctx = {
    r,
    W,
    H,
    hz,
    vx: W * r.range(0.38, 0.62),
    k: aspect === 'tall' ? k * 1.25 : k,
    ok: aspect === 'tall' ? k * 1.9 : aspect === 'portrait' ? k * 1.25 : k,
    sky,
    id: (name) => `${idPrefix}-${name}`,
    hi: detail === 'high',
    out: [],
    defs: [],
    sunX,
    sunY,
  };
  drawSky(c);
  RECIPES[spec.kind](c);
  drawBirds(c);
  finish(c);
  return { viewBox: `0 0 ${W} ${H}`, markup: `<defs>${c.defs.join('')}</defs>${c.out.join('')}` };
}

/** Average tone at the top and bottom of a scene, for picking overlay text colour. */
export function sceneTone(spec: SceneSpec): 'light' | 'dark' {
  const time = spec.time ?? DEFAULT_TIME[spec.kind];
  return time === 'dusk' ? 'dark' : 'light';
}
