/**
 * Direction 02 animations. One visual rule: monoline strokes in espresso ink
 * and clay that draw themselves on, with soft apricot as the single highlight.
 */
import { doc, ellipse, fill, group, hex, layer, path, rect, stroke, trim, curve, type LottieDoc, type RGB } from './kit';

export interface Palette {
  ink: RGB;
  primary: RGB;
  lime: RGB;
  soft: RGB;
  paper: RGB;
}

export const LIGHT: Palette = { ink: hex('#3a2e28'), primary: hex('#a8573a'), lime: hex('#f2c79b'), soft: hex('#eadfd1'), paper: hex('#ffffff') };
/** For sand panels and photo overlays (formerly always-dark surfaces). */
export const NIGHT: Palette = { ink: hex('#3a2e28'), primary: hex('#a8573a'), lime: hex('#f2c79b'), soft: hex('#dfd1c0'), paper: hex('#fbf7f1') };

const C: [number, number, number] = [80, 80, 0];

function loader(c: Palette): LottieDoc {
  const op = 90;
  return doc('fj-loader', op, [
    layer('track', [group([ellipse(100), stroke(c.soft, 6)])], { p: C }, op),
    layer('arc-a', [group([ellipse(100), trim(30, 0, [{ t: 0, v: 0, e: 'l' }, { t: op, v: 360 }]), stroke(c.primary, 6)])], { p: C }, op),
    layer('arc-b', [group([ellipse(64), trim(22, 0, [{ t: 0, v: 360, e: 'l' }, { t: op, v: 0 }]), stroke(c.lime, 6)])], { p: C }, op),
    layer('core', [group([ellipse(12), fill(c.ink)])], { p: C, s: [{ t: 0, v: [100, 100, 100] }, { t: 45, v: [160, 160, 100] }, { t: op, v: [100, 100, 100] }] }, op),
  ]);
}

function success(c: Palette): LottieDoc {
  const op = 100;
  const rays = Array.from({ length: 8 }, (_, i) => group([path([[0, -68], [0, -80]]), stroke(c.primary, 4)], { r: i * 45 }));
  return doc('fj-success', op, [
    layer('burst', rays, { p: C, s: [{ t: 40, v: [70, 70, 100], e: 'o' }, { t: 76, v: [118, 118, 100] }], o: [{ t: 40, v: 0 }, { t: 46, v: 100 }, { t: 78, v: 0 }] }, op),
    layer('disc', [group([ellipse(104), fill(c.lime)])], { p: C, s: [{ t: 0, v: [0, 0, 100], e: 'b' }, { t: 26, v: [100, 100, 100] }] }, op),
    layer('ring', [group([ellipse(128), trim([{ t: 8, v: 0, e: 'o' }, { t: 46, v: 100 }]), stroke(c.primary, 4)])], { p: C, r: -90 }, op),
    layer('check', [group([path([[-22, 2], [-6, 18], [24, -16]]), trim([{ t: 26, v: 0, e: 'o' }, { t: 54, v: 100 }]), stroke(hex('#3a2e28'), 8)])], { p: C }, op),
  ]);
}

function sprout(c: Palette): LottieDoc {
  const op = 180;
  const sway = (from: number) => [{ t: 90, v: from }, { t: 135, v: from + 7 }, { t: op, v: from }];
  return doc('fj-sprout', op, [
    layer('sun', [group([ellipse(34), fill(c.lime)])], { p: [112, 46, 0], s: [{ t: 16, v: [0, 0, 100], e: 'b' }, { t: 46, v: [100, 100, 100] }] }, op),
    layer('rows', [group([path([[-60, 0], [60, 0]]), trim([{ t: 0, v: 0, e: 'o' }, { t: 30, v: 100 }]), stroke(c.ink, 4)]), group([path([[-40, 12], [40, 12]]), trim([{ t: 8, v: 0, e: 'o' }, { t: 36, v: 100 }]), stroke(c.soft, 4)])], { p: [80, 120, 0] }, op),
    layer('stem', [group([curve([[0, 0], [0, -50]], [[0, 0], [6, 14]], [[-6, -14], [0, 0]]), trim([{ t: 26, v: 0, e: 'o' }, { t: 66, v: 100 }]), stroke(c.primary, 5)])], { p: [80, 120, 0] }, op),
    layer('leaf-l', [group([ellipse(34, 15, -17, 0), fill(c.lime), stroke(c.primary, 3)], { r: 24 })], { p: [80, 96, 0], s: [{ t: 58, v: [0, 0, 100], e: 'b' }, { t: 84, v: [100, 100, 100] }], r: sway(0) }, op),
    layer('leaf-r', [group([ellipse(30, 13, 15, 0), fill(c.lime), stroke(c.primary, 3)], { r: -28 })], { p: [80, 80, 0], s: [{ t: 70, v: [0, 0, 100], e: 'b' }, { t: 96, v: [100, 100, 100] }], r: sway(0).map((k) => ({ ...k, v: -(k.v as number) })) }, op),
  ]);
}

function search(c: Palette): LottieDoc {
  const op = 160;
  const lines = [-18, 0, 18].map((y, i) => group([rect(i === 1 ? 60 : 84, 8, 4, 0, y), fill(c.soft)]));
  return doc('fj-search', op, [
    layer('page', lines, { p: C }, op),
    layer(
      'lens',
      [group([ellipse(52), fill(c.paper, 70), stroke(c.primary, 6)]), group([path([[19, 19], [36, 36]]), stroke(c.ink, 8)])],
      { p: [{ t: 0, v: [62, 74, 0] }, { t: 70, v: [96, 82, 0] }, { t: op, v: [62, 74, 0] }], s: [{ t: 0, v: [0, 0, 100], e: 'b' }, { t: 22, v: [100, 100, 100] }] },
      op,
    ),
    layer('spark', [group([ellipse(10), fill(c.lime)])], { p: [116, 44, 0], s: [{ t: 60, v: [0, 0, 100], e: 'b' }, { t: 80, v: [100, 100, 100] }, { t: 120, v: [100, 100, 100] }, { t: 140, v: [0, 0, 100] }] }, op),
  ]);
}

function crate(c: Palette): LottieDoc {
  const op = 150;
  return doc('fj-crate', op, [
    layer('seed', [group([ellipse(16), fill(c.lime), stroke(c.ink, 3)])], { p: [{ t: 30, v: [80, 20, 0], e: 'io' }, { t: 62, v: [80, 92, 0], e: 'b' }, { t: 76, v: [80, 86, 0] }, { t: 90, v: [80, 92, 0] }], o: [{ t: 28, v: 0 }, { t: 32, v: 100 }] }, op),
    layer('box', [group([rect(88, 58, 8, 0, 0), fill(c.paper), stroke(c.ink, 4)]), group([path([[-44, -6], [44, -6]]), stroke(c.soft, 3)])], { p: [80, 108, 0], s: [{ t: 0, v: [86, 86, 100], e: 'b' }, { t: 24, v: [100, 100, 100] }] }, op),
    layer('flap-l', [group([path([[0, 0], [-26, -18]]), stroke(c.primary, 5)])], { p: [36, 80, 0], r: [{ t: 10, v: 30, e: 'b' }, { t: 40, v: 0 }] }, op),
    layer('flap-r', [group([path([[0, 0], [26, -18]]), stroke(c.primary, 5)])], { p: [124, 80, 0], r: [{ t: 10, v: -30, e: 'b' }, { t: 40, v: 0 }] }, op),
  ]);
}

function calendar(c: Palette): LottieDoc {
  const op = 160;
  const dots = [];
  for (let r = 0; r < 3; r++)
    for (let col = 0; col < 4; col++) {
      const i = r * 4 + col;
      const lime = i === 6;
      dots.push(layer(`d${i}`, [group([ellipse(lime ? 14 : 9), fill(lime ? c.lime : c.soft)])], { p: [53 + col * 18, 88 + r * 17, 0], s: lime ? [{ t: 40 + i * 3, v: [0, 0, 100], e: 'b' }, { t: 60 + i * 3, v: [100, 100, 100] }, { t: 110, v: [130, 130, 100] }, { t: op, v: [100, 100, 100] }] : [{ t: 30 + i * 3, v: [0, 0, 100], e: 'b' }, { t: 48 + i * 3, v: [100, 100, 100] }] }, op));
    }
  return doc('fj-calendar', op, [
    layer('sheet', [group([rect(96, 88, 12, 0, 0), fill(c.paper), trim([{ t: 0, v: 0, e: 'o' }, { t: 34, v: 100 }]), stroke(c.ink, 4)]), group([rect(96, 20, 0, 0, -34), fill(c.primary)])], { p: [80, 86, 0] }, op),
    layer('rings', [group([path([[-22, 0], [-22, 14]]), stroke(c.ink, 5)]), group([path([[22, 0], [22, 14]]), stroke(c.ink, 5)])], { p: [80, 34, 0] }, op),
    ...dots,
  ]);
}

function bell(c: Palette): LottieDoc {
  const op = 150;
  const swing = [{ t: 0, v: 0 }, { t: 14, v: 14 }, { t: 28, v: -12 }, { t: 42, v: 8 }, { t: 56, v: -4 }, { t: 70, v: 0 }, { t: op, v: 0 }];
  return doc('fj-bell', op, [
    layer('bell', [group([curve([[-30, 18], [0, -36], [30, 18]], [[0, 0], [-24, 0], [2, -30]], [[-2, -30], [24, 0], [0, 0]], false), stroke(c.ink, 5)]), group([path([[-38, 18], [38, 18]]), stroke(c.ink, 5)]), group([ellipse(12, 12, 0, 28), fill(c.primary)])], { p: [80, 76, 0], a: [0, -36, 0], r: swing }, op),
    layer('dot', [group([ellipse(20), fill(c.lime), stroke(c.ink, 3)])], { p: [108, 50, 0], s: [{ t: 60, v: [0, 0, 100], e: 'b' }, { t: 80, v: [100, 100, 100] }] }, op),
  ]);
}

function offline(c: Palette): LottieDoc {
  const op = 150;
  const arc = (d: number, t0: number) => layer(`arc${d}`, [group([ellipse(d), trim(25, 0, -45), stroke(c.primary, 6)])], { p: [80, 104, 0], o: [{ t: t0, v: 100 }, { t: t0 + 20, v: 20 }] }, op);
  return doc('fj-offline', op, [
    arc(112, 10),
    arc(76, 22),
    arc(40, 34),
    layer('dot', [group([ellipse(12), fill(c.ink)])], { p: [80, 104, 0] }, op),
    layer('slash', [group([path([[-40, -40], [40, 40]]), trim([{ t: 60, v: 0, e: 'o' }, { t: 88, v: 100 }]), stroke(c.ink, 6)])], { p: [80, 80, 0] }, op),
  ]);
}

function pin(c: Palette): LottieDoc {
  const op = 140;
  const ring = (delay: number) => layer(`ring${delay}`, [group([ellipse(44, 14), stroke(c.primary, 3)])], { p: [80, 124, 0], s: [{ t: delay, v: [30, 30, 100], e: 'o' }, { t: delay + 70, v: [220, 220, 100] }], o: [{ t: delay, v: 100 }, { t: delay + 70, v: 0 }] }, op);
  return doc('fj-pin', op, [
    ring(0),
    ring(50),
    layer(
      'pin',
      [group([ellipse(16, 16, 0, -20), fill(c.lime), stroke(c.ink, 3)]), group([curve([[0, 30], [-24, -18], [24, -18]], [[0, 0], [-10, 20], [0, -34]], [[0, 0], [0, -34], [10, 20]], true), stroke(c.primary, 6)])],
      { p: [{ t: 0, v: [80, 70, 0] }, { t: 70, v: [80, 62, 0] }, { t: op, v: [80, 70, 0] }] },
      op,
    ),
  ]);
}

function bookmark(c: Palette): LottieDoc {
  const op = 120;
  return doc('fj-bookmark', op, [
    layer('mark', [group([path([[-24, -36], [24, -36], [24, 36], [0, 18], [-24, 36]], true), fill(c.lime, [{ t: 40, v: 0 }, { t: 60, v: 100 }]), trim([{ t: 0, v: 0, e: 'o' }, { t: 44, v: 100 }]), stroke(c.ink, 5)])], { p: C, s: [{ t: 56, v: [100, 100, 100] }, { t: 66, v: [110, 110, 100] }, { t: 80, v: [100, 100, 100] }] }, op),
  ]);
}

function records(c: Palette): LottieDoc {
  const op = 160;
  const line = (y: number, t0: number) =>
    layer(`l${y}`, [group([path([[-10, 0], [26, 0]]), trim([{ t: t0, v: 0, e: 'o' }, { t: t0 + 22, v: 100 }]), stroke(c.soft, 6)]), group([ellipse(12, 12, -24, 0), fill(c.lime, [{ t: t0 + 10, v: 0 }, { t: t0 + 18, v: 100 }])])], { p: [80, 80 + y, 0] }, op);
  return doc('fj-records', op, [
    layer('board', [group([rect(84, 104, 12, 0, 0), fill(c.paper), trim([{ t: 0, v: 0, e: 'o' }, { t: 36, v: 100 }]), stroke(c.ink, 4)]), group([rect(36, 14, 6, 0, -52), fill(c.primary)])], { p: [80, 84, 0] }, op),
    line(-12, 30),
    line(10, 46),
    line(32, 62),
  ]);
}

function weather(c: Palette): LottieDoc {
  const op = 180;
  const rays = Array.from({ length: 8 }, (_, i) => group([path([[0, -30], [0, -38]]), stroke(c.primary, 4)], { r: i * 45 }));
  return doc('fj-weather', op, [
    layer('rays', rays, { p: [64, 64, 0], r: [{ t: 0, v: 0, e: 'l' }, { t: op, v: 90 }], s: [{ t: 0, v: [0, 0, 100], e: 'b' }, { t: 30, v: [100, 100, 100] }] }, op),
    layer('sun', [group([ellipse(40), fill(c.lime)])], { p: [64, 64, 0], s: [{ t: 0, v: [0, 0, 100], e: 'b' }, { t: 24, v: [100, 100, 100] }] }, op),
    layer('cloud', [group([ellipse(40, 40, -12, -10), fill(c.paper), stroke(c.ink, 4)]), group([rect(84, 34, 17, 6, 8), fill(c.paper), stroke(c.ink, 4)]), group([rect(76, 26, 13, 6, 8), fill(c.paper)])], { p: [{ t: 10, v: [126, 104, 0], e: 'o' }, { t: 50, v: [96, 104, 0] }, { t: 120, v: [92, 104, 0] }, { t: op, v: [96, 104, 0] }] }, op),
  ]);
}

export const ANIMATIONS = { loader, success, sprout, search, crate, calendar, bell, offline, pin, bookmark, records, weather };
export type AnimationName = keyof typeof ANIMATIONS;
