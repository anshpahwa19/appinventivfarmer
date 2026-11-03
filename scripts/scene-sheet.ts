/* Renders every scene kind into one HTML page for visual review (dev tool). */
import { writeFileSync } from 'node:fs';
import { buildScene, type SceneAspect } from '../src/scenes/buildScene';
import type { SceneKind, SceneTime } from '../src/types';

const kinds: SceneKind[] = ['paddy', 'wheat', 'mustard', 'cotton', 'soil', 'harvest', 'village', 'workshop', 'canal', 'monsoon'];
const out = process.argv[2] ?? 'scene-sheet.html';
const aspect = (process.argv[3] ?? 'wide') as SceneAspect;
const time = process.argv[4] as SceneTime | undefined;
const cells = kinds
  .map((kind, i) => {
    const s = buildScene({ kind, seed: 7 + i * 3, time }, aspect, 'high', `k${i}`);
    return `<figure><svg viewBox="${s.viewBox}" preserveAspectRatio="xMidYMid slice">${s.markup}</svg><figcaption>${kind}</figcaption></figure>`;
  })
  .join('');
writeFileSync(
  out,
  `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#222;display:grid;grid-template-columns:repeat(${aspect === 'tall' ? 5 : 2},1fr);gap:8px;padding:8px;font:14px sans-serif;color:#eee}figure{margin:0}svg{width:100%;aspect-ratio:${aspect === 'tall' ? '450/975' : aspect === 'square' ? '1' : '800/500'};display:block;border-radius:8px}</style>${cells}`,
);
console.log('wrote', out);
