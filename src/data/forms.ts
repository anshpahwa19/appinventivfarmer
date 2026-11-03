import type { FormCycle, FormStep, RecordField, RecordSection, StepEntry, StepId } from '@/types';
import { relativeISO } from '@/lib/dates';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';
import { KISANI_DIDI } from './people';

export const STEP_TITLES: Record<StepId, string> = {
  'land-preparation': 'Land preparation',
  sowing: 'Sowing & transplantation',
  intercultivation: 'Intercultivation',
  water: 'Water management',
  nutrients: 'Nutrient management',
  pesticides: 'Pesticide management',
  harvest: 'Harvest management',
  transport: 'Transportation',
};

export const STEP_ORDER: StepId[] = ['land-preparation', 'sowing', 'intercultivation', 'water', 'nutrients', 'pesticides', 'harvest', 'transport'];

const rs = (n: number) => formatCurrency(n);
const f = (label: string, value: string | number): RecordField => ({ label, value: typeof value === 'number' ? formatNumber(value) : value });

/* ---------- Section builders with visible arithmetic ---------- */

export function labourCost(male: number, maleWage: number, female: number, femaleWage: number, hours: number, days: number) {
  return (male * maleWage + female * femaleWage) * hours * days;
}

function labour(male: number, maleWage: number, female: number, femaleWage: number, hours: number, days: number): RecordSection {
  const total = labourCost(male, maleWage, female, femaleWage, hours, days);
  const same = maleWage === femaleWage;
  const formula = same
    ? `${male + female} workers × ${rs(maleWage)}/hr × ${hours} hrs × ${days} days`
    : `(${male} × ${rs(maleWage)} + ${female} × ${rs(femaleWage)}) per hr × ${hours} hrs × ${days} days`;
  return {
    title: 'Labour',
    fields: [
      f('Men', male),
      f('Wage for men', `${rs(maleWage)}/hr`),
      f('Women', female),
      f('Wage for women', `${rs(femaleWage)}/hr`),
      f('Hours per day', hours),
      f('Working days', days),
      { label: 'Labour cost', value: rs(total), total: true, formula },
    ],
  };
}

export function machineryCost(rent: number, fuelPerHour: number, hours: number, days: number, fuelPrice: number) {
  const litres = fuelPerHour * hours * days;
  return { litres, fuel: litres * fuelPrice, total: rent + litres * fuelPrice };
}

function machinery(machine: string, status: 'Rented' | 'Owned', rent: number, fuelPerHour: number, hours: number, days: number, fuelPrice: number): RecordSection {
  const c = machineryCost(rent, fuelPerHour, hours, days, fuelPrice);
  return {
    title: 'Machinery',
    fields: [
      f('Machine used', machine),
      f('Owned or rented', status),
      f('Rent paid', rs(rent)),
      f('Hours per day', hours),
      f('Working days', days),
      f('Diesel per hour', `${fuelPerHour} L`),
      f('Diesel price', `${rs(fuelPrice)}/L`),
      { label: 'Diesel cost', value: rs(c.fuel), formula: `${fuelPerHour} L/hr × ${hours} hrs × ${days} days = ${formatNumber(c.litres)} L × ${rs(fuelPrice)}` },
      { label: 'Machinery cost', value: rs(c.total), total: true, formula: `Rent ${rs(rent)} + diesel ${rs(c.fuel)}` },
    ],
  };
}

function summary(parts: [string, number][]): RecordSection {
  const total = parts.reduce((s, [, v]) => s + v, 0);
  return {
    title: 'Step total',
    fields: [{ label: 'Total cost of this step', value: rs(total), total: true, formula: parts.map(([k, v]) => `${k} ${rs(v)}`).join(' + ') }],
  };
}

function entry(id: string, date: string, sections: RecordSection[]): StepEntry {
  return { id, date, sections };
}

function step(id: StepId, entries: StepEntry[], updatedAt?: string): FormStep {
  return {
    id,
    title: STEP_TITLES[id],
    status: entries.length ? 'submitted' : 'pending',
    updatedBy: entries.length ? `${KISANI_DIDI.name} (Kisani Didi)` : undefined,
    updatedAt,
    entries,
  };
}

export function buildForms(now = new Date()): FormCycle[] {
  const at = (days: number, h = 11) => relativeISO(days, h, 0, now);
  const day = (days: number) => at(days).slice(0, 10);

  /* ---------------- Cycle #2: Cotton, in progress ---------------- */
  const cottonSowing = day(-95);
  const cotton: FormCycle = {
    id: 'fc-cotton',
    number: 2,
    landId: 'l-cotton',
    landName: 'Cotton Field',
    crop: { name: 'Cotton', variety: 'AKH-081', season: 'Kharif 2026', areaAcres: 8, sowingDate: cottonSowing, harvestDate: day(60) },
    steps: [
      step(
        'land-preparation',
        [
          entry('lp-1', day(-110), [
            { title: 'Details', fields: [f('Date', formatDate(day(-110))), f('Preparation type', 'Ploughing and harrowing'), f('Area prepared', '8 acres')] },
            labour(5, 150, 5, 150, 7, 5),
            machinery('Tractor with plough', 'Rented', 500, 5, 5, 5, 100),
            summary([['Labour', labourCost(5, 150, 5, 150, 7, 5)], ['Machinery', machineryCost(500, 5, 5, 5, 100).total]]),
          ]),
        ],
        at(-108),
      ),
      step(
        'sowing',
        [
          entry('sw-1', cottonSowing, [
            {
              title: 'Details',
              fields: [
                f('Date', formatDate(cottonSowing)),
                f('Seed or sapling', 'Seed'),
                f('Seed quantity', '12 kg'),
                f('Seed price', `${rs(150)}/kg`),
                { label: 'Seed cost', value: rs(1800), formula: `12 kg × ${rs(150)}` },
                f('Area sown', '8 acres'),
                f('Row spacing', '90 cm'),
                f('Plant spacing', '30 cm'),
                { label: 'Plant population', value: '≈ 1,19,900 plants', formula: '8 acres (32,375 m²) ÷ (0.9 m × 0.3 m)' },
                f('Sowing method', 'Seed drill (mechanised)'),
              ],
            },
            labour(2, 150, 4, 150, 7, 2),
            machinery('Tractor with seed drill', 'Rented', 500, 5, 5, 2, 100),
            summary([['Seed', 1800], ['Labour', labourCost(2, 150, 4, 150, 7, 2)], ['Machinery', machineryCost(500, 5, 5, 2, 100).total]]),
          ]),
        ],
        at(-94),
      ),
      step(
        'intercultivation',
        [
          entry('ic-1', day(-60), [
            {
              title: 'Details',
              fields: [f('Date', formatDate(day(-60))), f('Days after sowing', 35), f('Crop stage', 'Vegetative'), f('Weeding round', 'First weeding'), f('Method', 'Manual (hand hoe)'), f('Area covered', '8 acres'), f('Other costs', rs(5000))],
            },
            labour(5, 150, 5, 150, 7, 5),
            summary([['Labour', labourCost(5, 150, 5, 150, 7, 5)], ['Other', 5000]]),
          ]),
          entry('ic-2', day(-35), [
            {
              title: 'Details',
              fields: [f('Date', formatDate(day(-35))), f('Days after sowing', 60), f('Crop stage', 'Square formation'), f('Weeding round', 'Second weeding'), f('Method', 'Bullock-drawn hoe'), f('Area covered', '8 acres'), f('Other costs', rs(2000))],
            },
            labour(3, 150, 3, 150, 7, 3),
            summary([['Labour', labourCost(3, 150, 3, 150, 7, 3)], ['Other', 2000]]),
          ]),
        ],
        at(-34),
      ),
      step('water', []),
      step('nutrients', []),
      step('pesticides', []),
      step('harvest', []),
      step('transport', []),
    ],
  };

  /* ---------------- Cycle #1: Wheat, completed ---------------- */
  const ws = (d: number) => day(-300 + d);
  const wheat: FormCycle = {
    id: 'fc-wheat',
    number: 1,
    landId: 'l-wheat',
    landName: 'Wheat Field',
    crop: { name: 'Wheat', variety: 'Lokwan', season: 'Rabi 2025–26', areaAcres: 30, sowingDate: ws(12), harvestDate: ws(140) },
    steps: [
      step('land-preparation', [entry('w-lp', ws(0), [{ title: 'Details', fields: [f('Date', formatDate(ws(0))), f('Preparation type', 'Rotavator after paddy'), f('Area prepared', '30 acres')] }, labour(2, 150, 0, 150, 8, 4), machinery('Tractor with rotavator', 'Owned', 0, 6, 8, 4, 100), summary([['Labour', labourCost(2, 150, 0, 150, 8, 4)], ['Machinery', machineryCost(0, 6, 8, 4, 100).total]])])], ws(1)),
      step('sowing', [entry('w-sw', ws(12), [{ title: 'Details', fields: [f('Date', formatDate(ws(12))), f('Seed or sapling', 'Seed'), f('Seed rate', '40 kg per acre'), f('Seed quantity', '1,200 kg'), f('Seed price', `${rs(45)}/kg`), { label: 'Seed cost', value: rs(54000), formula: `1,200 kg × ${rs(45)}` }, f('Row spacing', '22.5 cm'), f('Sowing method', 'Seed drill (mechanised)')] }, labour(3, 150, 2, 150, 8, 3), summary([['Seed', 54000], ['Labour', labourCost(3, 150, 2, 150, 8, 3)]])])], ws(13)),
      step('intercultivation', [entry('w-ic', ws(40), [{ title: 'Details', fields: [f('Date', formatDate(ws(40))), f('Days after sowing', 28), f('Crop stage', 'Tillering'), f('Weeding round', 'First weeding'), f('Method', 'Manual'), f('Area covered', '30 acres')] }, labour(6, 150, 8, 150, 7, 4), summary([['Labour', labourCost(6, 150, 8, 150, 7, 4)]])])], ws(41)),
      step('water', [entry('w-wa', ws(33), [{ title: 'Details', fields: [f('Irrigation method', 'Flood (canal)'), f('Number of irrigations', 5), f('Water source', 'Canal and borewell'), f('Pump hours (total)', 60), f('Electricity and water charges', rs(9000))] }, summary([['Charges', 9000]])])], ws(120)),
      step('nutrients', [entry('w-nu', ws(12), [{ title: 'Details', fields: [f('Organic manure', 'FOM, 500 kg (Kisani Urjaa)'), f('Urea', '25 bags × 45 kg'), f('DAP', '15 bags × 50 kg'), { label: 'Fertiliser cost', value: rs(26925), formula: `Urea 25 × ${rs(267)} + DAP 15 × ${rs(1350)}` }] }, labour(2, 150, 0, 150, 6, 3), summary([['Fertiliser', 26925], ['Labour', labourCost(2, 150, 0, 150, 6, 3)]])])], ws(70)),
      step('pesticides', [entry('w-pe', ws(85), [{ title: 'Details', fields: [f('Problem', 'Yellow rust (early signs)'), f('Product type', 'Recommended fungicide'), f('Sprays', 1), f('Area sprayed', '30 acres'), f('Product cost', rs(7500))] }, labour(2, 150, 0, 150, 7, 2), summary([['Product', 7500], ['Labour', labourCost(2, 150, 0, 150, 7, 2)]])])], ws(86)),
      step('harvest', [entry('w-ha', ws(140), [{ title: 'Details', fields: [f('Harvest date', formatDate(ws(140))), f('Method', 'Combine harvester (rented)'), f('Yield', '18 quintals per acre'), f('Total produce', '540 quintals'), f('Harvester rent', rs(45000))] }, labour(4, 150, 0, 150, 8, 2), summary([['Harvester', 45000], ['Labour', labourCost(4, 150, 0, 150, 8, 2)]])])], ws(141)),
      step('transport', [entry('w-tr', ws(146), [{ title: 'Details', fields: [f('Vehicle', 'Tractor trolley'), f('Trips', 12), f('Distance to market', '18 km'), f('Market', 'APMC Buldhana'), f('Transport cost', rs(14400))] }, summary([['Transport', 14400]])])], ws(147)),
    ],
  };

  return [cotton, wheat];
}

export function cycleProgress(c: FormCycle) {
  const done = c.steps.filter((s) => s.status === 'submitted').length;
  return { done, total: c.steps.length, complete: done === c.steps.length };
}
