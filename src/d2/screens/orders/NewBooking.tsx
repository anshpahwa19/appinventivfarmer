import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type { Land } from '@/types';
import { BOOKING_SLOTS } from '@/data/bookings';
import { api } from '@/services/api';
import { invalidate, useMutation, useQuery } from '@/services/query';
import { useStore } from '@/services/store';
import { addDays, startOfDay, toISODate } from '@/lib/dates';
import { formatDate, formatTime, monthShort, weekdayShort } from '@/lib/format';
import { validateAcres } from '@/lib/validation';
import { Screen } from '../../layout/Screen';
import { Photo } from '../../photo/Photo';
import { Button } from '../../ui/Button';
import { FieldError, GroupLabel, TextArea, TextField } from '../../ui/Field';
import { Chip } from '../../ui/Controls';
import { EmptyState, Note, Receipt, Segments, Skel } from '../../ui/Blocks';
import { photoOf } from '../../content/meta';
import { useUI } from '../../providers';
import { useNav } from '../../nav';
import s from './Orders.module.css';

const STEPS = ['Field and crop', 'Date and time', 'Check and send'];
const SLOT_HINT: Record<string, string> = { '07:00': 'Early morning', '09:00': 'Morning', '12:00': 'Midday', '15:00': 'Afternoon' };
const clean = (c: string) => c.replace(/\s*\(.*\)/, '');

export default function NewBooking() {
  const nav = useNav();
  const { requireVerified } = useUI();
  const verified = useStore((st) => st.session.verified);
  const lands = useQuery('lands', () => api.listLands());
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [land, setLand] = useState<Land | null>(null);
  const [crop, setCrop] = useState('');
  const [acres, setAcres] = useState('');
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const create = useMutation(api.createBooking);

  useEffect(() => {
    if (!verified) requireVerified('Booking needs a verified mobile number', () => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const days = useMemo(() => Array.from({ length: 21 }, (_, i) => addDays(startOfDay(new Date()), i + 1)), []);
  const choose = (l: Land) => {
    setLand(l);
    setCrop(l.crops[0]?.name ?? '');
    setAcres(String(l.crops[0]?.areaAcres ?? l.areaAcres));
    setErrors({});
  };
  const validate = () => {
    const e: Record<string, string | null> = {};
    if (step === 1) {
      if (!land) e.land = 'Choose the field for this booking.';
      if (land && !crop) e.crop = 'Choose the crop.';
      if (land) e.acres = validateAcres(acres, land.areaAcres);
    }
    if (step === 2) {
      if (!date) e.date = 'Choose a date.';
      if (!slot) e.slot = 'Choose a time.';
    }
    setErrors(e);
    return Object.values(e).every((v) => !v);
  };
  const next = async () => {
    if (!verified) return requireVerified('Booking needs a verified mobile number', () => undefined);
    if (!validate()) return;
    if (step < 3) {
      setDir(1);
      setStep(step + 1);
      return;
    }
    const b = await create.mutate({ land: land!, crop, acres: Number(acres), date: date!, slot: slot!, notes });
    if (b) {
      invalidate('bookings');
      invalidate('notifications');
      nav(`/bookings/${b.id}/requested`, { replace: true, state: { booking: b } });
    }
  };

  return (
    <Screen
      title="Book a field service"
      backTo="/orders?tab=bookings"
      footer={
        <div className={s.footerRow}>
          {step > 1 && (
            <Button
              variant="secondary"
              size="lg"
              icon={<ArrowLeft aria-hidden />}
              disabled={create.pending}
              onClick={() => {
                setDir(-1);
                setStep(step - 1);
              }}
            >
              Back
            </Button>
          )}
          <Button size="lg" block iconRight={step < 3 ? <ArrowRight aria-hidden /> : <Check aria-hidden />} onClick={next} loading={create.pending}>
            {step < 3 ? 'Continue' : create.pending ? 'Sending…' : 'Send request'}
          </Button>
        </div>
      }
    >
      <div className={s.page}>
        <div className={s.steps}>
          <div className={s.stepsHead}>
            <h2 className={s.stepsTitle}>{STEPS[step - 1]}</h2>
            <span className={s.stepsNum} aria-label={`Step ${step} of 3`}>
              0{step}
              <span>/03</span>
            </span>
          </div>
          <Segments done={step} total={3} label={`Step ${step} of 3`} />
        </div>

        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div key={step} initial={{ opacity: 0, x: dir * 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -30 }} transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }} className="fj-stack" style={{ ['--gap' as string]: '22px' }}>
            {step === 1 && (
              <>
                <div className="fj-stack" style={{ ['--gap' as string]: '10px' }}>
                  <GroupLabel id="fj-land">Which field?</GroupLabel>
                  {lands.status === 'loading' && <Skel h={88} r="var(--r-lg)" />}
                  {lands.status === 'success' && (lands.data ?? []).length === 0 && <EmptyState animation="crate" title="Add a field first" body="Bookings are made for a registered field." action={<Button to="/lands/new">Add a field</Button>} compact />}
                  <div className={s.choices} role="radiogroup" aria-labelledby="fj-land">
                    {(lands.data ?? []).map((l) => (
                      <motion.button key={l.id} type="button" whileTap={{ scale: 0.98 }} role="radio" aria-checked={land?.id === l.id} className={s.landOpt} disabled={!l.active} onClick={() => choose(l)}>
                        <span className={s.landThumb}>
                          <Photo id={photoOf(l)} src={l.scene.src} ratio="1/1" decorative muted={!l.active} />
                        </span>
                        <span className={s.landText}>
                          <span className={s.landName}>{l.name}</span>
                          <span className={s.landSub}>
                            {l.areaAcres} acres · {l.active ? l.crops.map((c) => clean(c.name)).join(', ') || 'No crops yet' : 'Inactive field'}
                          </span>
                        </span>
                        <span className={s.radio} aria-hidden>
                          {land?.id === l.id && <Check strokeWidth={3} />}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                  <FieldError>{errors.land}</FieldError>
                </div>
                {land && (
                  <>
                    <div className="fj-stack" style={{ ['--gap' as string]: '10px' }}>
                      <GroupLabel>Crop</GroupLabel>
                      <div className={s.quick}>
                        {[...land.crops.map((c) => c.name), 'Other'].map((c) => (
                          <Chip key={c} selected={crop === c} onClick={() => setCrop(c)}>
                            {clean(c)}
                          </Chip>
                        ))}
                      </div>
                      <FieldError>{errors.crop}</FieldError>
                    </div>
                    <TextField label="Area to clear" inputMode="decimal" suffix="acres" value={acres} onChange={(e) => setAcres(e.target.value.replace(/[^\d.]/g, ''))} error={errors.acres} hint={`${land.name} is ${land.areaAcres} acres`} />
                  </>
                )}
              </>
            )}
            {step === 2 && (
              <>
                <div className="fj-stack" style={{ ['--gap' as string]: '10px' }}>
                  <GroupLabel id="fj-date">Preferred date</GroupLabel>
                  <div className={s.dates} role="group" aria-labelledby="fj-date">
                    {days.map((d) => {
                      const iso = toISODate(d);
                      return (
                        <button key={iso} type="button" className={s.date} aria-pressed={date === iso} aria-label={formatDate(d, 'long')} onClick={() => setDate(iso)}>
                          {weekdayShort(d)}
                          <strong>{d.getDate()}</strong>
                          {monthShort(d)}
                        </button>
                      );
                    })}
                  </div>
                  <FieldError>{errors.date}</FieldError>
                </div>
                <div className="fj-stack" style={{ ['--gap' as string]: '10px' }}>
                  <GroupLabel id="fj-slot">Preferred time</GroupLabel>
                  <div className={s.slots} role="group" aria-labelledby="fj-slot">
                    {BOOKING_SLOTS.map((t) => (
                      <button key={t} type="button" className={s.slot} aria-pressed={slot === t} onClick={() => setSlot(t)}>
                        <strong>{formatTime(t)}</strong>
                        {SLOT_HINT[t]}
                      </button>
                    ))}
                  </div>
                  <FieldError>{errors.slot}</FieldError>
                </div>
                <Note>The team confirms the exact time when they approve your booking.</Note>
              </>
            )}
            {step === 3 && land && date && slot && (
              <>
                <Receipt
                  rows={[
                    { label: 'Field', value: land.name },
                    { label: 'Crop', value: clean(crop) },
                    { label: 'Area', value: `${acres} acres` },
                    { label: 'Date', value: formatDate(date, 'long') },
                    { label: 'Time', value: formatTime(slot) },
                  ]}
                />
                <TextArea label="Notes for the team" optional placeholder="For example: straw is spread across the whole field" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} />
                <p className="fj-small fj-c3">You’ll get a notification when it’s approved and an operator is assigned.</p>
                {create.error && (
                  <Note tone="danger" icon={<AlertTriangle aria-hidden />} title="Request not sent">
                    {create.error.message}
                  </Note>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Screen>
  );
}
