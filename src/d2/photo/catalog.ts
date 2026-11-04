/**
 * Direction 02 photography catalogue.
 *
 * Every image in Direction 02 is a named photo slot with an art-direction
 * brief. Real photographs were not reachable from the build environment
 * (image hosts are blocked by its network policy), so no photo is bundled
 * yet. Until one is, a slot shows a tonal "blur-up" field: the colour and
 * light the photo is expected to have, the way production image systems show
 * a placeholder while a photo loads. It is deliberately not a picture.
 *
 * To add a licensed photo:
 *   1. Save it as src/d2/photo/files/<slot-id>.jpg (or .webp / .avif).
 *   2. Add its credit to CREDITS in ./credits.ts.
 * The slot picks it up automatically, everywhere it is used, with the
 * focal point below. Account → About lists every slot and its status.
 */
import type { SceneKind, SceneSpec } from '@/types';
import { CREDITS, type PhotoCredit } from './credits';

export type ToneField =
  | {
      kind: 'land';
      /** Sky top → sky at the horizon. */
      sky: [string, string];
      haze: string;
      /** Near field → deep foreground. */
      land: [string, string];
      /** Horizon height, 0–100 from the top. */
      horizon: number;
      sun: { x: number; color: string };
    }
  | {
      kind: 'macro';
      base: string;
      subject: string;
      glow: string;
      /** Where the subject sits, 0–100. */
      x: number;
      y: number;
    };

export interface PhotoSlot {
  id: string;
  /** What the photograph should show. Used for commissioning and as the slot label. */
  subject: string;
  /** Short label shown on the slot while no photo exists. */
  short: string;
  alt: string;
  /** object-position for crops, as "x% y%". */
  focal: string;
  tone: ToneField;
}

const land = (sky: [string, string], haze: string, landC: [string, string], horizon: number, sunX: number, sun: string): ToneField => ({ kind: 'land', sky, haze, land: landC, horizon, sun: { x: sunX, color: sun } });
const macro = (base: string, subject: string, glow: string, x = 50, y = 55): ToneField => ({ kind: 'macro', base, subject, glow, x, y });

export const SLOTS: PhotoSlot[] = [
  { id: 'harvest-baler', short: 'Baler in a paddy field', subject: 'A tractor-drawn baler working a harvested paddy field at golden hour, low angle, straw dust in the light. Buldhana or Punjab.', alt: 'A tractor and baler clearing paddy straw from a harvested field at sunset', focal: '58% 55%', tone: land(['#f3c27a', '#f7dca6'], '#f6e2b6', ['#b8873f', '#5a3d1c'], 46, 70, '#fff3c4') },
  { id: 'harvest-bales', short: 'Straw bales at dusk', subject: 'Rectangular straw bales stacked at a field edge at dusk, farmer silhouetted, village tree line behind.', alt: 'Stacked straw bales at the edge of a field at dusk', focal: '55% 60%', tone: land(['#5b5f8f', '#e39b6b'], '#f0b58a', ['#a8743a', '#3b2a19'], 52, 30, '#ffd29a') },
  { id: 'harvest-hands', short: 'Hands binding a sheaf', subject: 'Close-up of a farmer’s weathered hands binding a paddy sheaf with straw, shallow depth of field.', alt: 'Close-up of a farmer’s hands binding a bundle of paddy', focal: '50% 50%', tone: macro('#3a2a17', '#d9a856', '#f4d38f', 52, 52) },
  { id: 'paddy-transplant', short: 'Transplanting paddy', subject: 'Women transplanting paddy seedlings in a flooded field in the morning, reflections in the water, hills behind.', alt: 'Women transplanting paddy seedlings in a flooded field', focal: '50% 58%', tone: land(['#a9c8d8', '#dfe9e6'], '#e8efe9', ['#5f9a6b', '#1f4a36'], 40, 40, '#ffffff') },
  { id: 'paddy-closeup', short: 'Ripening paddy', subject: 'Close-up of ripening paddy panicles with morning dew, backlit.', alt: 'Ripening paddy grains with dew, close up', focal: '45% 50%', tone: macro('#2c3d1d', '#c9b75a', '#f1e7a1', 46, 48) },
  { id: 'paddy-field', short: 'Green paddy field', subject: 'Wide, lush green paddy field with a farmer walking along the bund, monsoon clouds.', alt: 'A farmer walking along the bund of a green paddy field', focal: '25% 55%', tone: land(['#8fa9b8', '#cfdcd8'], '#dde6df', ['#4f9452', '#1c4127'], 38, 62, '#f5f8ef') },
  { id: 'wheat-field', short: 'Wheat at golden hour', subject: 'A wheat field at golden hour with a farmer walking through the crop, warm backlight.', alt: 'A farmer walking through a ripe wheat field in evening light', focal: '32% 40%', tone: land(['#e9b36c', '#f6d9a0'], '#f8e4b5', ['#d1a246', '#6f4d1c'], 44, 64, '#fff4c9') },
  { id: 'wheat-grain', short: 'Wheat in the palm', subject: 'Close-up of harvested wheat grain held in a farmer’s cupped palm.', alt: 'Wheat grains in a farmer’s palm', focal: '50% 52%', tone: macro('#3b2716', '#d6a75a', '#f1cf8c') },
  { id: 'mustard-field', short: 'Mustard in bloom', subject: 'A mustard field in full yellow bloom, village and trees on the horizon, clear winter sky.', alt: 'A mustard field in yellow bloom under a clear sky', focal: '50% 58%', tone: land(['#7fb0e0', '#cfe2f2'], '#e6eef2', ['#e6c62f', '#7d6b12'], 42, 36, '#ffffff') },
  { id: 'cotton-picking', short: 'Picking cotton', subject: 'A woman picking cotton bolls in a Vidarbha field, cotton bag over her shoulder, soft daylight.', alt: 'A woman picking cotton in a field', focal: '40% 40%', tone: land(['#b9cde0', '#e7eef2'], '#f0f3f2', ['#9fae7c', '#47522f'], 36, 55, '#ffffff') },
  { id: 'cotton-drip', short: 'Drip lines in cotton', subject: 'Drip irrigation lines running along cotton rows, low angle, receding into the distance.', alt: 'Drip irrigation lines between rows of cotton', focal: '50% 65%', tone: land(['#a8c3dc', '#dfe8ee'], '#e8eeee', ['#6c9a55', '#2a3f22'], 34, 50, '#ffffff') },
  { id: 'soil-sample', short: 'Taking a soil sample', subject: 'Hands lifting a soil slice from a V-shaped cut with a khurpi, sample bucket beside it.', alt: 'A farmer taking a soil sample from a small trench', focal: '55% 60%', tone: macro('#2e1f14', '#8a5d36', '#c9925a', 50, 58) },
  { id: 'soil-texture', short: 'Ploughed soil', subject: 'Dark, crumbly black cotton soil after ploughing, raking light showing texture.', alt: 'Freshly ploughed dark soil, close up', focal: '50% 50%', tone: macro('#1f1712', '#5a4433', '#9b7a5d', 40, 60) },
  { id: 'village-meeting', short: 'Kisani Didi with farmers', subject: 'A Kisani Didi talking with a group of farmers under a neem tree, notebook in hand, documentary style.', alt: 'A Kisani Didi talking with farmers under a tree', focal: '38% 45%', tone: land(['#c9d6c4', '#e8e6d4'], '#ece7d2', ['#9b8a5c', '#4a3f26'], 30, 70, '#fff8de') },
  { id: 'village-delivery', short: 'FOM delivery', subject: 'Bags of fermented organic manure being unloaded from a truck at a village delivery point.', alt: 'Bags of organic manure unloaded from a truck in a village', focal: '50% 50%', tone: land(['#b7c9d6', '#e3e6e2'], '#ebe9e0', ['#8d7a5a', '#3e3426'], 40, 30, '#ffffff') },
  { id: 'workshop-demo', short: 'Village workshop', subject: 'Farmer training workshop in a village hall, agronomist demonstrating compost to seated farmers.', alt: 'Farmers at a training workshop in a village hall', focal: '35% 45%', tone: macro('#2b2a33', '#b58a55', '#f0c98d', 62, 40) },
  { id: 'canal-irrigation', short: 'Irrigation canal', subject: 'An irrigation canal between green fields, reflection of the sky, early morning.', alt: 'An irrigation canal running between green fields', focal: '50% 60%', tone: land(['#9cc0e2', '#dbe9f2'], '#e6eff2', ['#5d9a73', '#234433'], 42, 45, '#ffffff') },
  { id: 'monsoon-sky', short: 'Monsoon over fields', subject: 'Heavy monsoon clouds over open fields, a farmer with an umbrella on the bund.', alt: 'Dark monsoon clouds over open farmland', focal: '28% 55%', tone: land(['#4d5868', '#8c96a0'], '#a3aaae', ['#56715a', '#1f2c22'], 50, 50, '#c9d0d4') },
  { id: 'fom-product', short: 'FOM manure', subject: 'Close-up texture of fermented organic manure in an open sack, with a farmer’s hand for scale.', alt: 'Fermented organic manure in an open sack, close up', focal: '50% 55%', tone: macro('#21180f', '#6a4a2c', '#a87d4f', 55, 60) },
  { id: 'machinery-tractor', short: 'Tractor at work', subject: 'A tractor with a rotavator turning a field, dust in the air, documentary angle.', alt: 'A tractor working a field', focal: '45% 55%', tone: land(['#b7c4cf', '#e2e2da'], '#e9e5d8', ['#9a7f55', '#3f3122'], 44, 60, '#fff8e2') },
  { id: 'farmer-portrait', short: 'Farmer portrait', subject: 'Environmental portrait of a farmer standing in his field at dawn, looking at the camera, natural light.', alt: 'Portrait of a farmer standing in his field', focal: '48% 30%', tone: macro('#1f2b33', '#7d6a55', '#e5c9a2', 50, 38) },
  { id: 'dawn-field', short: 'Dawn over the farm', subject: 'Wide dawn view over a farm in Buldhana: mist low on the fields, a lone tree, first light.', alt: 'Mist over farm fields at dawn', focal: '40% 55%', tone: land(['#26315f', '#e8a98a'], '#f2c7a8', ['#4c6b4f', '#16241b'], 54, 58, '#ffe1c2') },
];

const byId = new Map(SLOTS.map((s) => [s.id, s]));

/** Photo files dropped into ./files, keyed by slot id. */
const FILES: Record<string, string> = Object.fromEntries(
  Object.entries(import.meta.glob('./files/*.{jpg,jpeg,png,webp,avif}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>).map(([path, url]) => [path.replace(/^.*\/([^/]+)\.\w+$/, '$1'), url]),
);

export interface ResolvedPhoto {
  slot: PhotoSlot;
  src?: string;
  credit?: PhotoCredit;
}

export function slot(id: string): PhotoSlot {
  return byId.get(id) ?? SLOTS[0];
}

export function resolvePhoto(id: string, src?: string): ResolvedPhoto {
  const s = slot(id);
  return { slot: s, src: src ?? FILES[s.id], credit: CREDITS[s.id] };
}

export function hasFile(id: string): boolean {
  return !!FILES[id];
}

/* ---------- Mapping from shared data (SceneSpec) to slots ---------- */

const BY_KIND: Record<SceneKind, string[]> = {
  harvest: ['harvest-baler', 'harvest-bales', 'harvest-hands'],
  paddy: ['paddy-field', 'paddy-closeup', 'paddy-transplant'],
  wheat: ['wheat-field', 'wheat-grain'],
  mustard: ['mustard-field'],
  cotton: ['cotton-picking', 'cotton-drip'],
  soil: ['soil-sample', 'soil-texture'],
  village: ['village-meeting', 'village-delivery'],
  workshop: ['workshop-demo'],
  canal: ['canal-irrigation'],
  monsoon: ['monsoon-sky'],
};

/** Hand-picked art direction for specific items, where the generic pick would be weaker. */
const OVERRIDES: Record<string, string> = {
  'n-straw-collection': 'harvest-bales',
  'n-stubble-cost': 'soil-texture',
  'n-soil-camp': 'workshop-demo',
  'n-fom-deliveries': 'village-delivery',
  'n-season-records': 'village-meeting',
  'a-soil-health-card': 'soil-sample',
  'a-seeders': 'machinery-tractor',
  'a-drip-cotton': 'cotton-drip',
  'a-fom-use': 'fom-product',
  'v-baling': 'harvest-hands',
  'v-soil-sample': 'soil-sample',
  'v-drip': 'cotton-drip',
  'v-decomposer': 'paddy-closeup',
  'v-stem-borer': 'paddy-field',
  'v-wheat-storage': 'wheat-grain',
  'e-training': 'workshop-demo',
  'e-baling-demo': 'harvest-baler',
  'e-soil-camp': 'soil-sample',
};

/** The slot for a piece of shared data. `key` is the item id, for art-directed overrides. */
export function slotFor(scene: SceneSpec | undefined, key?: string): string {
  if (key && OVERRIDES[key]) return OVERRIDES[key];
  if (!scene) return 'dawn-field';
  const list = BY_KIND[scene.kind] ?? ['dawn-field'];
  return list[Math.abs(scene.seed) % list.length];
}
