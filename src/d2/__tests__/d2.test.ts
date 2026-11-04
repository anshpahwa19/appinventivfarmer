import { describe, expect, it } from 'vitest';
import { fromD2, isD2Path, isTabRoot, to } from '../paths';
import { SLOTS, resolvePhoto, slotFor } from '../photo/catalog';
import { counterpartPath } from '@/app/DirectionSwitcher';
import { buildContent } from '@/data/content';
import { buildEvents } from '@/data/events';

describe('Direction 02 paths', () => {
  it('maps shared paths into /d2 and back', () => {
    expect(to('/orders/fom/FOM1')).toBe('/d2/orders/fom/FOM1');
    expect(to('/d2/home')).toBe('/d2/home');
    expect(to('/')).toBe('/d2');
    expect(fromD2('/d2/learn')).toBe('/learn');
    expect(isD2Path('/d2x')).toBe(false);
    expect(isTabRoot('/d2/account')).toBe(true);
  });
  it('switches the same screen between directions', () => {
    expect(counterpartPath('/events/e-training')).toBe('/d2/events/e-training');
    expect(counterpartPath('/d2/events/e-training')).toBe('/events/e-training');
    expect(counterpartPath('/d2/search')).toBe('/learn');
  });
});

describe('Direction 02 photo slots', () => {
  it('gives every content item and event a known slot', () => {
    const ids = new Set(SLOTS.map((s) => s.id));
    for (const c of buildContent()) expect(ids.has(slotFor(c.scene, c.id))).toBe(true);
    for (const e of buildEvents()) expect(ids.has(slotFor(e.scene, e.id))).toBe(true);
  });
  it('slot ids are unique and have briefs and alt text', () => {
    expect(new Set(SLOTS.map((s) => s.id)).size).toBe(SLOTS.length);
    for (const s of SLOTS) {
      expect(s.subject.length).toBeGreaterThan(20);
      expect(s.alt.length).toBeGreaterThan(5);
    }
  });
  it('prefers a real photo from data over the slot', () => {
    expect(resolvePhoto('harvest-baler', 'x.jpg').src).toBe('x.jpg');
  });
});
