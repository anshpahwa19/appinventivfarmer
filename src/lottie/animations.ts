import { doc, ellipse, ellipseAnim, fill, group, layer, path, rect, stroke, trim, type Key, type LottieDoc } from './builder';

export interface LottiePalette {
  primary: string;
  success: string;
  accent: string;
  sun: string;
  earth: string;
  earthDark: string;
  surface: string;
  soft: string;
  line: string;
  ink: string;
}

export const LIGHT_PALETTE: LottiePalette = {
  primary: '#1f4d36',
  success: '#2f8a52',
  accent: '#dd6a24',
  sun: '#f4c24d',
  earth: '#c9a77a',
  earthDark: '#8a6a49',
  surface: '#ffffff',
  soft: '#e6eee3',
  line: '#c9cfc6',
  ink: '#2c3a30',
};

export const DARK_PALETTE: LottiePalette = {
  primary: '#8fd3a5',
  success: '#4fae6f',
  accent: '#f08a45',
  sun: '#f4c24d',
  earth: '#a88a62',
  earthDark: '#6d5438',
  surface: '#1f2b24',
  soft: '#24342b',
  line: '#3d4d43',
  ink: '#d6e2d8',
};

export type AnimationName = 'success' | 'emptyBox' | 'bell' | 'forms' | 'offline' | 'sprout' | 'pin' | 'search' | 'calendar' | 'bookmark';

const C = 80; // canvas centre (160 × 160)

function arc(r: number, a0Deg: number, a1Deg: number) {
  const a0 = (a0Deg * Math.PI) / 180;
  const a1 = (a1Deg * Math.PI) / 180;
  const k = (4 / 3) * Math.tan((a1 - a0) / 4);
  const p0 = [r * Math.cos(a0), r * Math.sin(a0)];
  const p3 = [r * Math.cos(a1), r * Math.sin(a1)];
  const t0 = [-Math.sin(a0) * k * r, Math.cos(a0) * k * r];
  const t1 = [Math.sin(a1) * k * r, -Math.cos(a1) * k * r];
  return path([p0, p3], false, [[0, 0], t1], [t0, [0, 0]]);
}

const fadeLoop = (op: number): Key[] => [
  { t: 0, v: 0, e: 'out' },
  { t: 8, v: 100, e: 'linear' },
  { t: op - 16, v: 100, e: 'in' },
  { t: op - 2, v: 0 },
];

export const ANIMATIONS: Record<AnimationName, (c: LottiePalette) => LottieDoc> = {
  success(c) {
    const dots = Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2 + 0.3;
      const from = [C + Math.cos(a) * 40, C + Math.sin(a) * 40];
      const to = [C + Math.cos(a) * 72, C + Math.sin(a) * 72];
      return group([ellipse(9, 9), fill(i % 2 ? c.accent : c.sun)], {
        p: [{ t: 12, v: from, e: 'out' }, { t: 42, v: to }],
        o: [{ t: 12, v: 0, e: 'linear' }, { t: 16, v: 100, e: 'linear' }, { t: 34, v: 100, e: 'linear' }, { t: 44, v: 0 }],
        s: [{ t: 12, v: [100, 100], e: 'out' }, { t: 44, v: [30, 30] }],
      });
    });
    return doc('success', 160, 100, [
      layer('ring', [group([ellipseAnim([{ t: 8, v: [80, 80], e: 'out' }, { t: 42, v: [156, 156] }]), stroke(c.success, 4, [{ t: 8, v: 60, e: 'out' }, { t: 42, v: 0 }])], { p: [C, C] })]),
      layer('dots', dots),
      layer('disc', [group([ellipse(100, 100), fill(c.success)], { p: [C, C], s: [{ t: 0, v: [0, 0], e: 'back' }, { t: 20, v: [100, 100] }] })]),
      layer('check', [group([path([[-22, 2], [-6, 18], [24, -14]]), trim(0, [{ t: 0, v: 0 }, { t: 16, v: 0, e: 'out' }, { t: 38, v: 100 }]), stroke('#ffffff', 10)], { p: [C, C] })]),
    ]);
  },

  emptyBox(c) {
    const op = 150;
    const bob: Key[] = [{ t: 0, v: [C, 92] }, { t: 75, v: [C, 86] }, { t: op, v: [C, 92] }];
    const sprout = group(
      [
        group([path([[0, 0], [0, -22]]), stroke(c.success, 4)]),
        group([ellipse(18, 9), fill(c.success)], { p: [-8, -18], r: -32 }),
        group([ellipse(18, 9), fill(c.success)], { p: [8, -26], r: 32 }),
      ],
      { p: [0, -30], r: [{ t: 0, v: -6 }, { t: 75, v: 6 }, { t: op, v: -6 }] },
    );
    return doc('emptyBox', 160, op, [
      layer('shadow', [group([ellipse(76, 10), fill(c.line)], { p: [C, 130], s: [{ t: 0, v: [100, 100] }, { t: 75, v: [86, 86] }, { t: op, v: [100, 100] }] })]),
      layer('crate', [
        group(
          [
            sprout,
            group([rect(84, 12, 4), fill(c.earthDark)], { p: [0, -24] }),
            group([path([[-14, -18], [-14, 22]]), stroke(c.earthDark, 3)]),
            group([path([[14, -18], [14, 22]]), stroke(c.earthDark, 3)]),
            group([rect(74, 46, 7), fill(c.earth)], { p: [0, 2] }),
          ],
          { p: bob },
        ),
      ]),
    ]);
  },

  bell(c) {
    const op = 140;
    const swing: Key[] = [{ t: 0, v: 0 }, { t: 10, v: -16 }, { t: 22, v: 13 }, { t: 34, v: -9 }, { t: 44, v: 5 }, { t: 52, v: 0 }, { t: op, v: 0 }];
    const clapper: Key[] = [{ t: 0, v: 0 }, { t: 14, v: 18 }, { t: 26, v: -14 }, { t: 38, v: 9 }, { t: 48, v: -4 }, { t: 58, v: 0 }, { t: op, v: 0 }];
    const wave = (side: number, delay: number) =>
      group([arc(14, side > 0 ? -40 : 220, side > 0 ? 40 : 140), stroke(c.accent, 4, [{ t: delay, v: 0, e: 'out' }, { t: delay + 6, v: 100, e: 'linear' }, { t: delay + 22, v: 0 }])], {
        p: [C + side * 44, 74],
      });
    return doc('bell', 160, op, [
      layer('waves', [wave(1, 8), wave(-1, 20)]),
      layer('bell', [
        group(
          [
            group([ellipse(16, 16), fill(c.earthDark)], { p: [0, 30], r: clapper, a: [0, -12] }),
            group([ellipse(12, 12), fill(c.sun)], { p: [0, -40] }),
            group([rect(72, 12, 6), fill(c.accent)], { p: [0, 20] }),
            group([rect(54, 34, 4), fill(c.sun)], { p: [0, 4] }),
            group([ellipse(54, 58), fill(c.sun)], { p: [0, -12] }),
          ],
          { p: [C, 78], a: [0, -38], r: swing },
        ),
      ]),
    ]);
  },

  forms(c) {
    const op = 170;
    const line = (y: number, w: number, t0: number) => group([path([[-w / 2, 0], [w / 2, 0]]), trim(0, [{ t: t0, v: 0, e: 'out' }, { t: t0 + 20, v: 100 }]), stroke(c.line, 6)], { p: [-4 + (w - 44) / 2, y] });
    return doc('forms', 160, op, [
      layer(
        'board',
        [
          group(
            [
              group([ellipse(30, 30), fill(c.success)], { p: [26, 36], s: [{ t: 64, v: [0, 0], e: 'back' }, { t: 80, v: [100, 100] }] }),
              group([path([[-6, 0], [-1, 5], [7, -4]]), trim(0, [{ t: 72, v: 0, e: 'out' }, { t: 86, v: 100 }]), stroke('#ffffff', 4)], { p: [26, 36] }),
              line(-14, 44, 10),
              line(4, 44, 26),
              line(22, 28, 42),
              group([rect(36, 14, 6), fill(c.primary)], { p: [0, -46] }),
              group([rect(80, 100, 12), fill(c.surface), stroke(c.line, 3)], { p: [0, 0] }),
            ],
            { p: [C, 84] },
          ),
        ],
        { o: fadeLoop(op) },
      ),
    ]);
  },

  offline(c) {
    const op = 140;
    const pulse = (t0: number): Key[] => [{ t: t0, v: 15, e: 'out' }, { t: t0 + 10, v: 100, e: 'linear' }, { t: 90, v: 100, e: 'in' }, { t: 104, v: 15 }];
    return doc('offline', 160, op, [
      layer('cloud', [
        group(
          [group([ellipse(64, 48), fill(c.soft)], { p: [0, -6] }), group([ellipse(44, 34), fill(c.soft)], { p: [-30, 6] }), group([ellipse(44, 34), fill(c.soft)], { p: [30, 6] }), group([rect(100, 26, 13), fill(c.soft)], { p: [0, 14] })],
          { p: [C, 86] },
        ),
      ]),
      layer('signal', [
        group(
          [
            group([ellipse(10, 10), fill(c.primary)], { p: [0, 18] }),
            group([arc(14, 225, 315), stroke(c.primary, 6, pulse(4))], { p: [0, 18] }),
            group([arc(27, 225, 315), stroke(c.primary, 6, pulse(14))], { p: [0, 18] }),
            group([arc(40, 225, 315), stroke(c.primary, 6, pulse(24))], { p: [0, 18] }),
          ],
          { p: [C, 76] },
        ),
      ]),
      layer('slash', [group([path([[-34, -34], [34, 34]]), trim(0, [{ t: 40, v: 0, e: 'out' }, { t: 58, v: 100, e: 'linear' }, { t: 104, v: 100, e: 'in' }, { t: 118, v: 0 }]), stroke(c.accent, 7)], { p: [C, 72] })]),
    ]);
  },

  sprout(c) {
    const op = 110;
    return doc('sprout', 160, op, [
      layer('soil', [group([ellipse(70, 16), fill(c.earth)], { p: [C, 120] })]),
      layer(
        'plant',
        [
          group(
            [
              group([ellipse(26, 13), fill(c.success)], { p: [-12, -30], r: -28, s: [{ t: 22, v: [0, 0], e: 'back' }, { t: 40, v: [100, 100] }] }),
              group([ellipse(30, 14), fill(c.success)], { p: [13, -40], r: 30, s: [{ t: 30, v: [0, 0], e: 'back' }, { t: 48, v: [100, 100] }] }),
              group([path([[0, 0], [0, -40]]), trim(0, [{ t: 0, v: 0, e: 'out' }, { t: 30, v: 100 }]), stroke(c.success, 5)]),
            ],
            { p: [C, 116] },
          ),
        ],
        { o: fadeLoop(op) },
      ),
    ]);
  },

  pin(c) {
    const op = 130;
    const ripple = (t0: number) =>
      group([ellipseAnim([{ t: t0, v: [12, 4], e: 'out' }, { t: t0 + 50, v: [96, 28] }]), stroke(c.accent, 3, [{ t: t0, v: 70, e: 'out' }, { t: t0 + 50, v: 0 }])], { p: [C, 122] });
    return doc('pin', 160, op, [
      layer('ripples', [ripple(20), ripple(46)]),
      layer('shadow', [group([ellipse(30, 8), fill(c.line)], { p: [C, 122], s: [{ t: 0, v: [40, 40], e: 'in' }, { t: 18, v: [100, 100], e: 'out' }, { t: 26, v: [80, 80], e: 'in' }, { t: 34, v: [100, 100] }] })]),
      layer('pin', [
        group(
          [
            group([ellipse(16, 16), fill('#ffffff')], { p: [0, -26] }),
            group([ellipse(44, 44), fill(c.accent)], { p: [0, -26] }),
            group([path([[-17, -16], [0, 10], [17, -16]], true), fill(c.accent)]),
          ],
          { p: [{ t: 0, v: [C, 36], e: 'in' }, { t: 18, v: [C, 112], e: 'out' }, { t: 26, v: [C, 102], e: 'in' }, { t: 34, v: [C, 112] }] },
        ),
      ]),
    ]);
  },

  search(c) {
    const op = 160;
    const pos: Key[] = [{ t: 0, v: [92, 72] }, { t: 40, v: [66, 92] }, { t: 80, v: [100, 100] }, { t: 120, v: [80, 70] }, { t: op, v: [92, 72] }];
    return doc('search', 160, op, [
      layer('card', [
        group(
          [group([path([[-24, 8], [10, 8]]), stroke(c.line, 6)]), group([path([[-24, -8], [24, -8]]), stroke(c.line, 6)]), group([rect(88, 62, 12), fill(c.surface), stroke(c.line, 3)])],
          { p: [74, 88] },
        ),
      ]),
      layer('glass', [group([group([path([[13, 13], [28, 28]]), stroke(c.primary, 9)]), group([ellipse(36, 36), stroke(c.primary, 7)])], { p: pos, r: [{ t: 0, v: -6 }, { t: 80, v: 8 }, { t: op, v: -6 }] })]),
    ]);
  },

  calendar(c) {
    const op = 160;
    const dots = [0, 1, 2, 3, 4, 5].map((i) => {
      const x = -22 + (i % 3) * 22;
      const y = 4 + Math.floor(i / 3) * 18;
      const t0 = 12 + i * 8;
      return group([ellipse(12, 12), fill(i === 4 ? c.accent : c.line)], { p: [x, y], s: [{ t: t0, v: [0, 0], e: 'back' }, { t: t0 + 14, v: [100, 100] }] });
    });
    return doc('calendar', 160, op, [
      layer(
        'cal',
        [
          group(
            [
              ...dots,
              group([rect(8, 18, 4), fill(c.ink)], { p: [-22, -38] }),
              group([rect(8, 18, 4), fill(c.ink)], { p: [22, -38] }),
              group([rect(88, 14), fill(c.primary)], { p: [0, -22] }),
              group([rect(88, 26, 12), fill(c.primary)], { p: [0, -28] }),
              group([rect(88, 84, 12), fill(c.surface), stroke(c.line, 3)], { p: [0, 0] }),
            ],
            { p: [C, 88] },
          ),
        ],
        { o: fadeLoop(op) },
      ),
    ]);
  },

  bookmark(c) {
    const op = 150;
    const shape = path(
      [
        [-22, -32],
        [22, -32],
        [22, 34],
        [0, 18],
        [-22, 34],
      ],
      true,
    );
    return doc('bookmark', 160, op, [
      layer('mark', [
        group([shape, fill(c.soft), stroke(c.primary, 5)], {
          p: [C, 82],
          s: [{ t: 0, v: [100, 100] }, { t: 20, v: [92, 108], e: 'back' }, { t: 40, v: [100, 100] }, { t: op, v: [100, 100] }],
        }),
        group([ellipse(14, 14), fill(c.accent)], { p: [C, 66], s: [{ t: 30, v: [0, 0], e: 'back' }, { t: 46, v: [100, 100] }, { t: 120, v: [100, 100], e: 'in' }, { t: 140, v: [0, 0] }] }),
      ]),
    ]);
  },
};
