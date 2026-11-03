import type { SceneTime } from '@/types';

export interface SkyPalette {
  top: string;
  mid: string;
  horizon: string;
  sun: string;
  glow: string;
  /** Atmospheric haze mixed into distant layers. */
  haze: string;
  cloud: string;
  cloudShade: string;
  /** Overall light tint over the land (warm at golden hour, cool at dusk). */
  light: string;
  lightOpacity: number;
  sunVisible: boolean;
  sunY: number; // fraction of horizon height
}

export const SKIES: Record<SceneTime, SkyPalette> = {
  dawn: {
    top: '#6f86a6',
    mid: '#d9b8a6',
    horizon: '#f6cf9d',
    sun: '#fff0cf',
    glow: '#ffc98a',
    haze: '#e9c6a8',
    cloud: '#f7dccb',
    cloudShade: '#c99c93',
    light: '#ffb878',
    lightOpacity: 0.16,
    sunVisible: true,
    sunY: 0.9,
  },
  morning: {
    top: '#8fb7d6',
    mid: '#d9e2dc',
    horizon: '#f5e2bf',
    sun: '#fff8e2',
    glow: '#ffe2a2',
    haze: '#dfe3d6',
    cloud: '#ffffff',
    cloudShade: '#d6dde0',
    light: '#ffe0a0',
    lightOpacity: 0.1,
    sunVisible: true,
    sunY: 0.55,
  },
  day: {
    top: '#6fa6d3',
    mid: '#b9d5e6',
    horizon: '#e8eee4',
    sun: '#fffdf2',
    glow: '#fff5cf',
    haze: '#d6e2e2',
    cloud: '#ffffff',
    cloudShade: '#dbe4ea',
    light: '#fff7d6',
    lightOpacity: 0.06,
    sunVisible: true,
    sunY: 0.22,
  },
  golden: {
    top: '#7f9fc4',
    mid: '#e6c39c',
    horizon: '#f6b46a',
    sun: '#fff1c4',
    glow: '#ffbe6b',
    haze: '#eec49a',
    cloud: '#fbe2c4',
    cloudShade: '#d9a383',
    light: '#ffad5c',
    lightOpacity: 0.18,
    sunVisible: true,
    sunY: 0.78,
  },
  dusk: {
    top: '#3c4a6e',
    mid: '#a87c86',
    horizon: '#f0995f',
    sun: '#ffd79a',
    glow: '#ff9a5a',
    haze: '#b88a8a',
    cloud: '#e9a58e',
    cloudShade: '#8c6478',
    light: '#ff8a4a',
    lightOpacity: 0.22,
    sunVisible: true,
    sunY: 0.95,
  },
  overcast: {
    top: '#8b98a2',
    mid: '#b3bdbf',
    horizon: '#d3d8d0',
    sun: '#eef0ea',
    glow: '#e1e5dc',
    haze: '#c6ccc6',
    cloud: '#dfe3df',
    cloudShade: '#9aa4a8',
    light: '#c9d3d6',
    lightOpacity: 0.12,
    sunVisible: false,
    sunY: 0.4,
  },
};

/* Land colour families (base, light, dark, accent). */
export const LAND = {
  paddyGreen: ['#6fa64a', '#9bc46a', '#3f7a35', '#c9df8f'],
  youngGreen: ['#86b45a', '#b5d27c', '#5a8c3e', '#dbe8a4'],
  wheatGold: ['#d9a94a', '#ecc977', '#b07f2e', '#f6e2a6'],
  mustard: ['#e2bf2c', '#f3d955', '#b8961c', '#fff08a'],
  cottonGreen: ['#5f9248', '#86b066', '#3e6b33', '#f4f1e8'],
  soil: ['#8a5f3d', '#a87a52', '#5f3f27', '#c49a6c'],
  stubble: ['#c79a55', '#ddb978', '#9a7038', '#efd9a4'],
  dryGrass: ['#b8a167', '#d3be84', '#8c7a48', '#e6d7a6'],
  tree: ['#3d6a3b', '#55834c', '#284a2a', '#77a066'],
};

/** Linear blend of two hex colours. */
export function mix(a: string, b: string, t: number): string {
  const pa = parse(a);
  const pb = parse(b);
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function parse(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
