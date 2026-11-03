import type { EventStatus, FarmEvent } from '@/types';
import { relativeISO } from '@/lib/dates';
import { KISANI_DIDI } from './people';

const organizer = { name: KISANI_DIDI.name, role: 'Kisani Didi', phone: KISANI_DIDI.phone };

export function buildEvents(now = new Date()): FarmEvent[] {
  const at = (days: number, h: number, m = 0) => relativeISO(days, h, m, now);
  // The demonstration is always "live": it started an hour ago and ends in two.
  const liveStart = new Date(now.getTime() - 60 * 60_000).toISOString();
  const liveEnd = new Date(now.getTime() + 2 * 60 * 60_000).toISOString();

  return [
    {
      id: 'e-baling-demo',
      title: 'Paddy straw baling demonstration',
      summary: 'Watch a slasher, raker and baler clear a harvested field, and ask the operators questions.',
      topic: 'Residue management',
      start: liveStart,
      end: liveEnd,
      location: { name: 'Patil farm, near the canal', village: 'Ratanpur', district: 'Buldhana', mapsQuery: 'Ratanpur, Buldhana, Maharashtra' },
      organizer,
      scene: { kind: 'harvest', seed: 101, time: 'golden' },
      description: [
        'See the full straw collection process on a real field: cutting, raking, baling and loading.',
        'Operators will explain how much area they can cover in a day and how to book a slot for your field.',
      ],
      agenda: [
        { time: 'Start', title: 'Slasher and raker in action' },
        { time: '+45 min', title: 'Baling and loading trolleys' },
        { time: '+90 min', title: 'Questions and booking help' },
      ],
    },
    {
      id: 'e-training',
      title: 'Farmer training workshop: organic inputs',
      summary: 'Hands-on session on FOM, compost and bio-decomposers with the agronomy team.',
      topic: 'Soil health',
      start: at(2, 10),
      end: at(2, 12),
      location: { name: 'Village Hall', village: 'Ratanpur', district: 'Buldhana', mapsQuery: 'Village Hall, Ratanpur, Buldhana' },
      organizer,
      scene: { kind: 'workshop', seed: 12, time: 'morning' },
      description: [
        'Learn how organic inputs build soil carbon, how to apply FOM during land preparation, and how to prepare a decomposer spray.',
        'Tea and snacks will be served. Women farmers are especially welcome.',
      ],
      agenda: [
        { time: '10:00 AM', title: 'Why soil carbon matters' },
        { time: '10:45 AM', title: 'FOM: timing and spreading' },
        { time: '11:30 AM', title: 'Decomposer demo and questions' },
      ],
      bring: ['A notebook', 'Your Soil Health Card if you have one'],
    },
    {
      id: 'e-crop-health',
      title: 'Crop health awareness session',
      summary: 'Identify common cotton and paddy pests early, and learn when spraying is really needed.',
      topic: 'Crop care',
      start: at(8, 11),
      end: at(8, 13),
      location: { name: 'Gram Panchayat office', village: 'Dhad', district: 'Buldhana', mapsQuery: 'Gram Panchayat, Dhad, Buldhana' },
      organizer,
      scene: { kind: 'cotton', seed: 71, time: 'day' },
      description: [
        'Bring a few affected leaves or stems in a paper bag. Advisors will help identify the problem on the spot.',
        'The session covers pheromone traps, safe spraying and choosing the right product.',
      ],
      bring: ['Affected leaves or stems in a paper bag'],
    },
    {
      id: 'e-soil-camp',
      title: 'Soil testing camp',
      summary: 'Bring one soil sample per field. Reports with fertiliser advice are shared after testing.',
      topic: 'Soil health',
      start: at(15, 9, 30),
      end: at(15, 13, 30),
      location: { name: 'Village Hall', village: 'Ratanpur', district: 'Buldhana', mapsQuery: 'Village Hall, Ratanpur, Buldhana' },
      organizer,
      scene: { kind: 'soil', seed: 44, time: 'morning' },
      description: [
        'Each sample is tested for nutrients, pH and organic carbon. You will get advice on how much fertiliser your field really needs.',
        'Take samples a day or two before the camp and dry them in the shade.',
      ],
      bring: ['Half a kilogram of dry soil per field, in a labelled cloth bag', 'Your mobile number for the report'],
    },
    {
      id: 'e-fom-field-day',
      title: 'FOM field day',
      summary: 'Farmers compared plots with and without FOM and shared results from last season.',
      topic: 'Soil health',
      start: at(-9, 10),
      end: at(-9, 13),
      location: { name: 'Shinde farm', village: 'Ratanpur', district: 'Buldhana', mapsQuery: 'Ratanpur, Buldhana' },
      organizer,
      scene: { kind: 'wheat', seed: 55, time: 'golden' },
      media: [
        { kind: 'wheat', seed: 55, time: 'golden' },
        { kind: 'workshop', seed: 31, time: 'day' },
        { kind: 'village', seed: 18, time: 'morning' },
        { kind: 'soil', seed: 92, time: 'golden' },
        { kind: 'harvest', seed: 66, time: 'dusk' },
      ],
      description: [
        'Side-by-side plots showed the difference organic manure makes to soil structure and moisture.',
        'Thank you to every farmer who joined and shared their experience.',
      ],
    },
    {
      id: 'e-rabi-planning',
      title: 'Rabi season planning meeting',
      summary: 'Seed choices, sowing windows and machinery bookings for the rabi season.',
      topic: 'Planning',
      start: at(-26, 16),
      end: at(-26, 18),
      location: { name: 'Village Hall', village: 'Ratanpur', district: 'Buldhana', mapsQuery: 'Village Hall, Ratanpur, Buldhana' },
      organizer,
      scene: { kind: 'mustard', seed: 38, time: 'golden' },
      media: [
        { kind: 'mustard', seed: 38, time: 'golden' },
        { kind: 'workshop', seed: 77, time: 'golden' },
        { kind: 'village', seed: 9, time: 'dusk' },
        { kind: 'wheat', seed: 81, time: 'morning' },
      ],
      description: ['Farmers planned wheat, gram and mustard sowing and booked machinery early to avoid delays.'],
    },
  ];
}

export function eventStatus(ev: FarmEvent, now = new Date()): EventStatus {
  const t = now.getTime();
  if (t < new Date(ev.start).getTime()) return 'upcoming';
  if (t <= new Date(ev.end).getTime()) return 'live';
  return 'completed';
}
