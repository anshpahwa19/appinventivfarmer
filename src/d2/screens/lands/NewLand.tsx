import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type { Land, SceneKind } from '@/types';
import { invalidate } from '@/services/query';
import { actions, useStore } from '@/services/store';
import { useStatusTone } from '@/lib/statusTone';
import { validateAcres, validatePincode, validateRequired } from '@/lib/validation';
import { Screen } from '../../layout/Screen';
import { Button } from '../../ui/Button';
import { GroupLabel, SelectField, TextField } from '../../ui/Field';
import { Toggle } from '../../ui/Controls';
import { Note, Receipt, Segments } from '../../ui/Blocks';
import { FjLottie } from '../../lottie/Lottie';
import { RevealText } from '../../motion/Reveal';
import { useNav } from '../../nav';
import { Photo } from '../../photo/Photo';
import o from '../orders/Orders.module.css';
import s from './Lands.module.css';

const STATES = ['Maharashtra', 'Madhya Pradesh', 'Karnataka', 'Telangana', 'Gujarat', 'Uttar Pradesh', 'Rajasthan', 'Punjab'];
const STEPS = ['About the field', 'Where it is', 'Check and save'];
const SCENES: SceneKind[] = ['paddy', 'wheat', 'cotton', 'mustard', 'canal', 'soil'];

function Saved({ land }: { land: Land }) {
  const nav = useNav();
  useStatusTone('dark');
  return (
    <div className={`${o.success}`}>
      <div className={o.successPhoto}>
        <Photo id="paddy-field" ratio="fill" shade="bottom" priority />
      </div>
      <div className={o.successTop}>
        <FjLottie name="sprout" size={140} night loop={false} label="Field saved" />
        <p className={o.successKicker}>{land.areaAcres} acres · {land.address.village}</p>
        <RevealText text={`${land.name} is saved`} className={o.successTitle} delay={0.3} />
        <p className={o.successBody}>Next, add the crops you grow there, so bookings and advice match this field.</p>
      </div>
      <div className={o.successBottom}>
        <div className={o.successActions}>
          <Button size="lg" block onClick={() => nav(`/lands/${land.id}`, { replace: true })}>
            Add crops
          </Button>
          <Button variant="ghost" block onClick={() => nav('/lands', { replace: true })}>
            See all fields
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function NewLand() {
  const profile = useStore((st) => st.profile);
  const count = useStore((st) => st.lands.length);
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [saved, setSaved] = useState<Land | null>(null);
  const [f, setF] = useState({ name: '', area: '', ownership: 'Owned' as 'Owned' | 'Leased', line: '', village: profile.village, taluka: profile.taluka, district: profile.district, state: profile.state, pincode: profile.pincode });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));

  const validate = () => {
    const e: Record<string, string | null> =
      step === 1 ? { name: validateRequired(f.name, 'a name you’ll recognise, like “Canal field”'), area: validateAcres(f.area) } : step === 2 ? { village: validateRequired(f.village, 'the village'), district: validateRequired(f.district, 'the district'), pincode: validatePincode(f.pincode) } : {};
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
    setSaved(land);
  };

  if (saved) return <Saved land={saved} />;

  return (
    <Screen
      title="Add a field"
      backTo="/lands"
      footer={
        <div className={o.footerRow}>
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
          <Button size="lg" block iconRight={step < 3 ? <ArrowRight aria-hidden /> : <Check aria-hidden />} onClick={next}>
            {step < 3 ? 'Continue' : 'Save field'}
          </Button>
        </div>
      }
    >
      <div className={o.page}>
        <div className={o.steps}>
          <div className={o.stepsHead}>
            <h2 className={o.stepsTitle}>{STEPS[step - 1]}</h2>
            <span className={o.stepsNum} aria-label={`Step ${step} of 3`}>
              0{step}
              <span>/03</span>
            </span>
          </div>
          <Segments done={step} total={3} label={`Step ${step} of 3`} />
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} className={s.form} initial={{ opacity: 0, x: dir * 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -30 }} transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}>
            {step === 1 && (
              <>
                <TextField label="Field name" placeholder="e.g. Canal field" value={f.name} onChange={(e) => set('name', e.target.value)} error={errors.name} hint="A name you’ll recognise in bookings" autoFocus />
                <TextField label="Area" inputMode="decimal" suffix="acres" placeholder="e.g. 5" value={f.area} onChange={(e) => set('area', e.target.value.replace(/[^\d.]/g, ''))} error={errors.area} hint="1 hectare = 2.47 acres" />
                <div className="fj-stack" style={{ ['--gap' as string]: '8px' }}>
                  <GroupLabel>Do you own or lease it?</GroupLabel>
                  <Toggle label="Ownership" value={f.ownership} onChange={(v) => set('ownership', v)} options={[{ value: 'Owned', label: 'Owned' }, { value: 'Leased', label: 'Leased' }]} />
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
                <Note>We filled in your village from your profile. Change it if this field is somewhere else.</Note>
              </>
            )}
            {step === 3 && (
              <>
                <Receipt
                  rows={[
                    { label: 'Name', value: f.name },
                    { label: 'Area', value: `${f.area} acres` },
                    { label: 'Ownership', value: f.ownership },
                    { label: 'PIN code', value: f.pincode },
                    { label: 'Address', value: [f.line, f.village, f.taluka, f.district, f.state].filter(Boolean).join(', '), stacked: true },
                  ]}
                />
                <Note tone="info">After saving, add the crops you grow on this field.</Note>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Screen>
  );
}
