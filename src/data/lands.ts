import type { Land } from '@/types';
import { relativeISO } from '@/lib/dates';

const address = (line: string) => ({
  line,
  village: 'Ratanpur',
  taluka: 'Buldhana',
  district: 'Buldhana',
  state: 'Maharashtra',
  pincode: '443001',
});

export function buildLands(now = new Date()): Land[] {
  const d = (days: number) => relativeISO(days, 9, 0, now).slice(0, 10);
  return [
    {
      id: 'l-paddy',
      name: 'Paddy Field',
      areaAcres: 12,
      ownership: 'Owned',
      active: true,
      scene: { kind: 'paddy', seed: 3, time: 'morning' },
      address: address('Survey no. 214, beside the Ratanpur canal'),
      crops: [
        { id: 'c-rice', name: 'Rice', variety: 'IR-64', season: 'Kharif', areaAcres: 12, sowingDate: d(-112) },
        { id: 'c-gram', name: 'Chickpea (gram)', variety: 'Vijay', season: 'Rabi', areaAcres: 8 },
        { id: 'c-moong', name: 'Green gram (moong)', variety: 'BM-2003-2', season: 'Zaid', areaAcres: 4 },
      ],
    },
    {
      id: 'l-wheat',
      name: 'Wheat Field',
      areaAcres: 30,
      ownership: 'Leased',
      active: true,
      scene: { kind: 'wheat', seed: 6, time: 'golden' },
      address: address('Gat no. 88, Dhad road'),
      crops: [{ id: 'c-wheat', name: 'Wheat', variety: 'Lokwan', season: 'Rabi', areaAcres: 30, sowingDate: d(-260) }],
    },
    {
      id: 'l-cotton',
      name: 'Cotton Field',
      areaAcres: 8,
      ownership: 'Owned',
      active: true,
      scene: { kind: 'cotton', seed: 9, time: 'day' },
      address: address('Survey no. 219, behind the school'),
      crops: [{ id: 'c-cotton', name: 'Cotton', variety: 'AKH-081', season: 'Kharif', areaAcres: 8, sowingDate: d(-95) }],
    },
    {
      id: 'l-riverside',
      name: 'Riverside Plot',
      areaAcres: 4,
      ownership: 'Owned',
      active: false,
      scene: { kind: 'canal', seed: 2, time: 'golden' },
      address: address('Near Penganga river bank'),
      crops: [],
    },
  ];
}
