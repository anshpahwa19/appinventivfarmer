/* Dev tool: writes one HTML file per sample-clip scene (rendered to PNG, then encoded with ffmpeg). */
import { writeFileSync } from 'node:fs';
import { buildScene } from '../src/scenes/buildScene';
import type { SceneSpec } from '../src/types';

const out = process.argv[2] ?? '.';
export const CLIPS: { name: string; scene: SceneSpec; seconds: number }[] = [
  { name: 'harvest', scene: { kind: 'harvest', seed: 91, time: 'golden' }, seconds: 24 },
  { name: 'soil', scene: { kind: 'soil', seed: 15, time: 'morning' }, seconds: 18 },
  { name: 'cotton', scene: { kind: 'cotton', seed: 48, time: 'day' }, seconds: 20 },
  { name: 'paddy', scene: { kind: 'paddy', seed: 63, time: 'morning' }, seconds: 22 },
  { name: 'wheat', scene: { kind: 'wheat', seed: 29, time: 'golden' }, seconds: 16 },
];
for (const c of CLIPS) {
  const s = buildScene(c.scene, 'wide', 'high', 'v');
  writeFileSync(`${out}/clip-${c.name}.html`, `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;width:1280px;height:720px;overflow:hidden}svg{width:1280px;height:720px;display:block}</style><svg viewBox="${s.viewBox}" preserveAspectRatio="xMidYMid slice">${s.markup}</svg>`);
}
console.log(CLIPS.map((c) => `${c.name}:${c.seconds}`).join(' '));
