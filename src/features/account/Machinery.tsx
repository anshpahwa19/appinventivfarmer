import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import type { Machinery as M } from '@/types';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { Accordion } from '@/components/ui/Blocks';
import { SelectField, TextArea, TextField } from '@/components/ui/TextField';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useToast } from '@/components/ui/Toast';
import { actions, useStore } from '@/services/store';
import s from './Account.module.css';

const BRANDS = ['Mahindra', 'Swaraj', 'Sonalika', 'TAFE / Massey Ferguson', 'John Deere', 'Eicher', 'Escorts', 'New Holland', 'Kubota', 'Other'];

function Counter({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className={s.counter} role="group" aria-label={`${label} count`}>
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))} disabled={value === 0} aria-label={`Fewer ${label}`}>
        <Minus aria-hidden />
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(Math.min(20, value + 1))} aria-label={`More ${label}`}>
        <Plus aria-hidden />
      </button>
    </div>
  );
}

function Machine({ title, count, onCount, children, open }: { title: string; count: number; onCount: (n: number) => void; children?: ReactNode; open?: boolean }) {
  if (!children)
    return (
      <div className={s.card} style={{ padding: '12px 16px' }}>
        <div className={s.machineHead}>
          <span className={s.cardTitle}>{title}</span>
          <Counter value={count} onChange={onCount} label={title} />
        </div>
      </div>
    );
  return (
    <Accordion title={title} meta={count ? `${count} owned` : 'None'} defaultOpen={open}>
      <div className={s.form}>
        <div className={s.machineHead}>
          <span className={s.label}>How many?</span>
          <Counter value={count} onChange={onCount} label={title} />
        </div>
        {count > 0 && children}
      </div>
    </Accordion>
  );
}

export default function Machinery() {
  const navigate = useNavigate();
  const toast = useToast();
  const saved = useStore((st) => st.machinery);
  const [m, setM] = useState<M>(saved);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const year = new Date().getFullYear();

  const save = () => {
    const e: Record<string, string | null> = {};
    if (m.tractor.count > 0) {
      const y = Number(m.tractor.year);
      e.year = !m.tractor.year ? 'Enter the year.' : y < 1970 || y > year ? `Enter a year between 1970 and ${year}.` : null;
      e.hp = m.tractor.hp && (Number(m.tractor.hp) < 10 || Number(m.tractor.hp) > 150) ? 'Enter HP between 10 and 150.' : null;
    }
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;
    actions.setMachinery(m);
    toast({ message: 'Machinery details saved', tone: 'success' });
    navigate(-1);
  };

  const t = m.tractor;
  return (
    <Screen
      title="Farm machinery"
      back
      backTo="/account"
      footer={
        <Button size="lg" block onClick={save}>
          Save machinery
        </Button>
      }
    >
      <div className={s.page}>
        <p className="t-support c-3">Tell us which machines you own. It helps plan field services in your area.</p>
        <div className="stack" style={{ ['--gap' as string]: '12px' }}>
          <Machine title="Tractor" count={t.count} onCount={(n) => setM({ ...m, tractor: { ...t, count: n } })} open>
            <SelectField label="Brand" value={t.brand} onChange={(v) => setM({ ...m, tractor: { ...t, brand: v } })} options={BRANDS.map((b) => ({ value: b, label: b }))} placeholder="Choose brand" />
            <div className={s.grid2}>
              <TextField label="Year bought" inputMode="numeric" maxLength={4} placeholder="YYYY" value={t.year} onChange={(e) => setM({ ...m, tractor: { ...t, year: e.target.value.replace(/\D/g, '') } })} error={errors.year} />
              <TextField label="Power" inputMode="numeric" suffix="HP" value={t.hp} onChange={(e) => setM({ ...m, tractor: { ...t, hp: e.target.value.replace(/\D/g, '') } })} error={errors.hp} />
            </div>
            <div className="stack" style={{ ['--gap' as string]: '8px' }}>
              <span className={s.label}>Who drives it?</span>
              <SegmentedControl label="Driver" value={t.driver} onChange={(v) => setM({ ...m, tractor: { ...t, driver: v } })} segments={[{ value: 'Self', label: 'I drive' }, { value: 'Hired', label: 'Hired driver' }]} />
            </div>
            <div className={s.grid2}>
              <div className="stack" style={{ ['--gap' as string]: '8px' }}>
                <span className={s.label}>Clutch</span>
                <SegmentedControl label="Clutch" value={t.clutch} onChange={(v) => setM({ ...m, tractor: { ...t, clutch: v } })} segments={[{ value: 'Single', label: 'Single' }, { value: 'Dual', label: 'Dual' }]} />
              </div>
              <div className="stack" style={{ ['--gap' as string]: '8px' }}>
                <span className={s.label}>Power steering</span>
                <SegmentedControl label="Power steering" value={t.powerSteering} onChange={(v) => setM({ ...m, tractor: { ...t, powerSteering: v } })} segments={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]} />
              </div>
            </div>
          </Machine>
          <Machine title="Slasher" count={m.slasher} onCount={(n) => setM({ ...m, slasher: n })} />
          <Machine title="Raker" count={m.raker} onCount={(n) => setM({ ...m, raker: n })} />
          <Machine title="Baler" count={m.baler.count} onCount={(n) => setM({ ...m, baler: { ...m.baler, count: n } })}>
            <TextField label="Model" placeholder="As written on the machine" value={m.baler.model} onChange={(e) => setM({ ...m, baler: { ...m.baler, model: e.target.value } })} />
          </Machine>
          <Machine title="Trolley" count={m.trolley.count} onCount={(n) => setM({ ...m, trolley: { ...m.trolley, count: n } })}>
            <div className="stack" style={{ ['--gap' as string]: '8px' }}>
              <span className={s.label}>Type</span>
              <SegmentedControl label="Trolley type" value={m.trolley.type} onChange={(v) => setM({ ...m, trolley: { ...m.trolley, type: v } })} segments={[{ value: 'Manual', label: 'Manual' }, { value: 'Hydraulic', label: 'Hydraulic' }]} />
            </div>
            <TextField label="Capacity" inputMode="decimal" suffix="tonnes" value={m.trolley.capacityTonnes} onChange={(e) => setM({ ...m, trolley: { ...m.trolley, capacityTonnes: e.target.value.replace(/[^\d.]/g, '') } })} />
          </Machine>
          <Machine title="Harvester" count={m.harvester} onCount={(n) => setM({ ...m, harvester: n })} />
          <Machine title="Tube-well pump" count={m.pump.count} onCount={(n) => setM({ ...m, pump: { ...m.pump, count: n } })}>
            <TextField label="Pump capacity" inputMode="decimal" suffix="HP" value={m.pump.capacityHp} onChange={(e) => setM({ ...m, pump: { ...m.pump, capacityHp: e.target.value.replace(/[^\d.]/g, '') } })} />
          </Machine>
          <TextArea label="Other machines" optional placeholder="For example: rotavator, seed drill, sprayer" value={m.others} onChange={(e) => setM({ ...m, others: e.target.value })} maxLength={300} />
        </div>
      </div>
    </Screen>
  );
}
