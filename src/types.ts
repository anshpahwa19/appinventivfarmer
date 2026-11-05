/* Domain model for the Kisani Urjaa farmer app. */

export type SceneKind =
  | 'paddy'
  | 'wheat'
  | 'mustard'
  | 'cotton'
  | 'soil'
  | 'harvest'
  | 'village'
  | 'workshop'
  | 'canal'
  | 'monsoon';

export type SceneTime = 'dawn' | 'morning' | 'day' | 'golden' | 'dusk' | 'overcast';

export interface SceneSpec {
  kind: SceneKind;
  seed: number;
  time?: SceneTime;
  /** Optional real photo. When present it replaces the illustration. */
  src?: string;
  alt?: string;
}

/* ---------- Content ---------- */

export type ContentKind = 'news' | 'article' | 'video';

export type Category =
  | 'announcements'
  | 'crop-care'
  | 'soil'
  | 'residue'
  | 'weather'
  | 'water'
  | 'machinery'
  | 'market';

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'tip'; title: string; text: string };

export interface Author {
  name: string;
  role: string;
}

export interface ContentItem {
  id: string;
  kind: ContentKind;
  title: string;
  summary: string;
  body: Block[];
  category: Category;
  publishedAt: string;
  author: Author;
  source?: { name: string; url?: string };
  scene: SceneSpec;
  gallery?: SceneSpec[];
  video?: { src: string; durationSec: number };
  featured?: boolean;
  /** Optional deep link into the app (e.g. an event this news item announces). */
  cta?: { label: string; to: string };
}

/* ---------- Events ---------- */

export type EventStatus = 'upcoming' | 'live' | 'completed';
export type Interest = 'interested' | 'not_interested';

export interface FarmEvent {
  id: string;
  title: string;
  summary: string;
  description: string[];
  topic: string;
  start: string;
  end: string;
  location: { name: string; village: string; district: string; mapsQuery: string };
  organizer: { name: string; role: string; phone: string };
  scene: SceneSpec;
  media?: SceneSpec[];
  agenda?: { time: string; title: string }[];
  bring?: string[];
}

/* ---------- Orders (FOM) ---------- */

export type OrderStatus = 'pending' | 'approved' | 'rejected';
export type QuantityUnit = 'kg' | 'MT';

export interface FomOrder {
  id: string;
  createdAt: string;
  quantity: number;
  unit: QuantityUnit;
  pricePerKg: number;
  shipping: number;
  status: OrderStatus;
  decidedAt?: string;
  dispatchDate?: string;
  rejectionReason?: string;
  deliveryInstructions?: string;
  adminNote?: string;
  /** "device" = created in this prototype and stored on this device only. */
  origin: 'server' | 'device';
}

/* ---------- Bookings ---------- */

export type BookingStatus = 'pending' | 'approved' | 'rejected';

export interface Booking {
  id: string;
  createdAt: string;
  landId: string;
  landName: string;
  crop: string;
  acres: number;
  date: string; // yyyy-mm-dd
  slot: string; // HH:mm
  status: BookingStatus;
  requestedBy: { name: string; role: 'You' | 'Farm manager' };
  operator?: { name: string; phone: string };
  rejectionReason?: string;
  notes?: string;
  decidedAt?: string;
  origin: 'server' | 'device';
}

/* ---------- Lands & crops ---------- */

export type Season = 'Kharif' | 'Rabi' | 'Zaid';

export interface Crop {
  id: string;
  name: string;
  variety: string;
  season: Season;
  areaAcres: number;
  sowingDate?: string;
}

export interface Address {
  line: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  pincode: string;
}

export interface Land {
  id: string;
  name: string;
  areaAcres: number;
  ownership: 'Owned' | 'Leased';
  active: boolean;
  scene: SceneSpec;
  address: Address;
  crops: Crop[];
}

/* ---------- Season records (forms) ---------- */

export interface RecordField {
  label: string;
  value: string;
  /** Emphasised totals. */
  total?: boolean;
  /** Plain-language explanation of how a value was calculated. */
  formula?: string;
}

export interface RecordSection {
  title: string;
  fields: RecordField[];
}

export interface StepEntry {
  id: string;
  date: string;
  sections: RecordSection[];
}

export type StepId =
  | 'land-preparation'
  | 'sowing'
  | 'intercultivation'
  | 'water'
  | 'nutrients'
  | 'pesticides'
  | 'harvest'
  | 'transport';

export interface FormStep {
  id: StepId;
  title: string;
  status: 'submitted' | 'pending';
  updatedBy?: string;
  updatedAt?: string;
  entries: StepEntry[];
}

export interface FormCycle {
  id: string;
  number: number;
  landId: string;
  landName: string;
  crop: { name: string; variety: string; season: string; areaAcres: number; sowingDate: string; harvestDate: string };
  steps: FormStep[];
}

/* ---------- Notifications ---------- */

export type NotificationCategory = 'booking' | 'order' | 'event' | 'form' | 'account';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  createdAt: string;
  link?: string;
}

/* ---------- People ---------- */

export interface Profile {
  name: string;
  username: string;
  phone: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  pincode: string;
  memberSince: string;
}

export interface KisaniDidi {
  name: string;
  phone: string;
  area: string;
  languages: string[];
}

/* ---------- Machinery ---------- */

export interface Machinery {
  tractor: { count: number; brand: string; year: string; hp: string; driver: string; clutch: string; powerSteering: string };
  slasher: number;
  raker: number;
  baler: { count: number; model: string };
  trolley: { count: number; type: 'Manual' | 'Hydraulic'; capacityTonnes: string };
  harvester: number;
  pump: { count: number; capacityHp: string };
  others: string;
}

/* ---------- Weather ---------- */

export interface WeatherDay {
  date: string;
  code: number;
  maxC: number;
  minC: number;
  rainChance: number;
  /** Forecast rain total for the day in mm, when the source provides it. */
  rainMm?: number;
  /** Strongest wind expected that day in km/h, when the source provides it. */
  windMaxKph?: number;
}

export interface WeatherHour {
  time: string;
  tempC: number;
  code: number;
  rainChance: number;
}

export interface Advisory {
  tone: 'good' | 'caution' | 'warning';
  title: string;
  text: string;
}

export interface Weather {
  source: 'live' | 'sample';
  locationName: string;
  updatedAt: string;
  current: { tempC: number; feelsLikeC: number; code: number; humidity: number; windKph: number; rainChance: number };
  daily: WeatherDay[];
  hourly: WeatherHour[];
  advisory: Advisory;
}
