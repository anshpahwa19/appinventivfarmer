import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type { Land, SceneKind } from '@/types';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { TextField, SelectField } from '@/components/ui/TextField';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { DetailGrid, Stepper, Callout } from '@/components/ui/Blocks';
import { useToast } from '@/components/ui/Toast';
import { invalidate } from '@/services/query';
import { actions, useStore } from '@/services/store';
import { validateAcres, validatePincode, validateRequired } from '@/lib/validation';
import s from './Lands.module.css';
import o from '../orders/Orders.module.css';

const STATES = ['Maharashtra', 'Madhya Pradesh', 'Karnataka', 'Telangana', 'Gujarat', 'Uttar Pradesh', 'Rajasthan', 'Punjab'];
const STEPS = ['About the field', 'Where it is', 'Check and save'];
const SCENES: SceneKind[] = ['paddy', 'wheat', 'cotton', 'mustard', 'canal', 'soil'];

export default function NewLand() {
  const navigate = useNavigate();
  const toast = useToast();
  const profile = useStore((st) => st.profile);
  const count = useStore((st) => st.lands.length);
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [f, setF] = useState({ name: '', area: '', ownership: 'Owned' as 'Owned' | 'Leased', line: '', village: profile.village, taluka: profile.taluka, district: profile.district, state: profile.state, pincode: profile.pincode });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));

  const validate = () => {
    const e: Record<string, string | null> =
      step === 1
        ? { name: validateRequired(f.name, 'a name you’ll recognise, like “Canal field”'), area: validateAcres(f.area) }
        : step === 2
          ? { village: validateRequired(f.village, 'the village'), district: validateRequired(f.district, 'the district'), pincode: validatePincode(f.pincode) }
          : {};
    setErrors(e);
    return Object.values(e).every((v) => !v);
  };

  const next = () => {
    if (!validate()) return;
    if (step < 3) {
      setDir(1);
      setStep(step + 1);
      return;
    }
    const land: Land = {
      id: `l-${Date.now().toString(36)}`,
      name: f.name.trim(),
      areaAcres: Number(f.area),
      ownership: f.ownership,
      active: true,
      scene: { kind: SCENES[count % SCENES.length], seed: 40 + count, time: 'morning' },
      address: { line: f.line.trim(), village: f.village.trim(), taluka: f.taluka.trim(), district: f.district.trim(), state: f.state, pincode: f.pincode },
      crops: [],
    };
    actions.addLand(land);
    invalidate('lands');
    toast({ message: `${land.name} added. Now add the crops you grow there.`, tone: 'success' });
    navigate(`/lands/${land.id}`, { replace: true });
  };

  return (
    <Screen
      title="Add a field"
      back
      backTo="/lands"
      footer={
        <div className="row" style={{ ['--gap' as string]: '10px' }}>
          {step > 1 && (
            <Button
              variant="secondary"
              size="lg"
              icon={<ArrowLeft aria-hidden />}
              onClick={() => {
                setDir(-1);
                setStep(step - 1);
              }}
            >
              Back
            </Button>
          )}
          <div className="grow">
            <Button size="lg" block iconRight={step < 3 ? <ArrowRight aria-hidden /> : <Check aria-hidden />} onClick={next}>
              {step < 3 ? 'Continue' : 'Save field'}
            </Button>
          </div>
        </div>
      }
    >
      <div className={o.page}>
        <Stepper step={step} total={3} title={STEPS[step - 1]} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} initial={{ opacity: 0, x: dir * 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -20 }} transition={{ duration: 0.25 }} className={s.form}>
            {step === 1 && (
              <>
                <TextField label="Field name" placeholder="e.g. Canal field" value={f.name} onChange={(e) => set('name', e.target.value)} error={errors.name} hint="A name you’ll recognise in bookings" autoFocus />
                <TextField label="Area" inputMode="decimal" suffix="acres" placeholder="e.g. 5" value={f.area} onChange={(e) => set('area', e.target.value.replace(/[^\d.]/g, ''))} error={errors.area} hint="1 hectare = 2.47 acres" />
                <div className="stack" style={{ ['--gap' as string]: '8px' }}>
                  <span style={{ font: '650 0.9375rem/1.3 var(--font)' }}>Do you own or lease it?</span>
                  <SegmentedControl label="Ownership" value={f.ownership} onChange={(v) => set('ownership', v)} segments={[{ value: 'Owned', label: 'Owned' }, { value: 'Leased', label: 'Leased' }]} />
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <TextField label="Address" optional placeholder="Survey or gat number, landmark" value={f.line} onChange={(e) => set('line', e.target.value)} />
                <div className={s.grid2}>
                  <TextField label="Village" value={f.village} onChange={(e) => set('village', e.target.value)} error={errors.village} />
                  <TextField label="Taluka" optional value={f.taluka} onChange={(e) => set('taluka', e.target.value)} />
                </div>
                <div className={s.grid2}>
                  <TextField label="District" value={f.district} onChange={(e) => set('district', e.target.value)} error={errors.district} />
                  <TextField label="PIN code" inputMode="numeric" maxLength={6} value={f.pincode} onChange={(e) => set('pincode', e.target.value.replace(/\D/g, ''))} error={errors.pincode} />
                </div>
                <SelectField label="State" value={f.state} onChange={(v) => set('state', v)} options={STATES.map((x) => ({ value: x, label: x }))} />
                <Callout tone="neutral">We filled in your village from your profile. Change it if this field is somewhere else.</Callout>
              </>
            )}
            {step === 3 && (
              <>
                <DetailGrid
                  items={[
                    { label: 'Name', value: f.name },
                    { label: 'Area', value: `${f.area} acres` },
                    { label: 'Ownership', value: f.ownership },
                    { label: 'PIN code', value: f.pincode },
                    { label: 'Address', value: [f.line, f.village, f.taluka, f.district, f.state].filter(Boolean).join(', '), full: true },
                  ]}
                />
                <Callout tone="info">After saving, add the crops you grow on this field.</Callout>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Screen>
  );
}
