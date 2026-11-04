import { useState, type ReactNode } from 'react';
import type { Machinery as M } from '@/types';
import { actions, useStore } from '@/services/store';
import { Screen, PageTitle } from '../../layout/Screen';
import { Button } from '../../ui/Button';
import { Accordion } from '../../ui/Blocks';
import { Counter, Toggle } from '../../ui/Controls';
import { GroupLabel, SelectField, TextArea, TextField } from '../../ui/Field';
import { useToast } from '../../ui/Toast';
import { useNav } from '../../nav';
import s from './Account.module.css';

const BRANDS = ['Mahindra', 'Swaraj', 'Sonalika', 'TAFE / Massey Ferguson', 'John Deere', 'Eicher', 'Escorts', 'New Holland', 'Kubota', 'Other'];

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
          <GroupLabel>How many?</GroupLabel>
          <Counter value={count} onChange={onCount} label={title} />
        </div>
        {count > 0 && children}
      </div>
    </Accordion>
  );
}

export default function Machinery() {
  const nav = useNav();
  const toast = useToast();
  const saved = useStore((st) => st.machinery);
  const [m, setM] = useState<M>(saved);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const year = new Date().getFullYear();
  const t = m.tractor;
  const save = () => {
    const e: Record<string, string | null> = {};
    if (t.count > 0) {
      const y = Number(t.year);
      e.year = !t.year ? 'Enter the year.' : y < 1970 || y > year ? `Enter a year between 1970 and ${year}.` : null;
      e.hp = t.hp && (Number(t.hp) < 10 || Number(t.hp) > 150) ? 'Enter HP between 10 and 150.' : null;
    }
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;
    actions.setMachinery(m);
    toast({ message: 'Machinery details saved', tone: 'success' });
    nav(-1);
  };
  return (
    <Screen
      title="Farm machinery"
      backTo="/account"
      footer={
        <Button size="lg" block onClick={save}>
          Save machinery
        </Button>
      }
    >
      <PageTitle kicker="My farm" title="Farm machinery" deck="Which machines do you own? It helps plan field services in your area." />
      <div className={s.sub}>
        <div className="fj-stack" style={{ ['--gap' as string]: '10px' }}>
          <Machine title="Tractor" count={t.count} onCount={(n) => setM({ ...m, tractor: { ...t, count: n } })} open>
            <SelectField label="Brand" value={t.brand} onChange={(v) => setM({ ...m, tractor: { ...t, brand: v } })} options={BRANDS.map((b) => ({ value: b, label: b }))} placeholder="Choose brand" />
            <div className={s.grid2}>
              <TextField label="Year bought" inputMode="numeric" maxLength={4} placeholder="YYYY" value={t.year} onChange={(e) => setM({ ...m, tractor: { ...t, year: e.target.value.replace(/\D/g, '') } })} error={errors.year} />
              <TextField label="Power" inputMode="numeric" suffix="HP" value={t.hp} onChange={(e) => setM({ ...m, tractor: { ...t, hp: e.target.value.replace(/\D/g, '') } })} error={errors.hp} />
            </div>
            <div className="fj-stack" style={{ ['--gap' as string]: '8px' }}>
              <GroupLabel>Who drives it?</GroupLabel>
              <Toggle label="Driver" value={t.driver} onChange={(v) => setM({ ...m, tractor: { ...t, driver: v } })} options={[{ value: 'Self', label: 'I drive' }, { value: 'Hired', label: 'Hired driver' }]} />
            </div>
            <div className={s.grid2}>
              <div className="fj-stack" style={{ ['--gap' as string]: '8px' }}>
                <GroupLabel>Clutch</GroupLabel>
                <Toggle label="Clutch" value={t.clutch} onChange={(v) => setM({ ...m, tractor: { ...t, clutch: v } })} options={[{ value: 'Single', label: 'Single' }, { value: 'Dual', label: 'Dual' }]} />
              </div>
              <div className="fj-stack" style={{ ['--gap' as string]: '8px' }}>
                <GroupLabel>Power steering</GroupLabel>
                <Toggle label="Power steering" value={t.powerSteering} onChange={(v) => setM({ ...m, tractor: { ...t, powerSteering: v } })} options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]} />
              </div>
            </div>
          </Machine>
          <Machine title="Slasher" count={m.slasher} onCount={(n) => setM({ ...m, slasher: n })} />
          <Machine title="Raker" count={m.raker} onCount={(n) => setM({ ...m, raker: n })} />
          <Machine title="Baler" count={m.baler.count} onCount={(n) => setM({ ...m, baler: { ...m.baler, count: n } })}>
            <TextField label="Model" placeholder="As written on the machine" value={m.baler.model} onChange={(e) => setM({ ...m, baler: { ...m.baler, model: e.target.value } })} />
          </Machine>
          <Machine title="Trolley" count={m.trolley.count} onCount={(n) => setM({ ...m, trolley: { ...m.trolley, count: n } })}>
            <div className="fj-stack" style={{ ['--gap' as string]: '8px' }}>
              <GroupLabel>Type</GroupLabel>
              <Toggle label="Trolley type" value={m.trolley.type} onChange={(v) => setM({ ...m, trolley: { ...m.trolley, type: v } })} options={[{ value: 'Manual', label: 'Manual' }, { value: 'Hydraulic', label: 'Hydraulic' }]} />
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
