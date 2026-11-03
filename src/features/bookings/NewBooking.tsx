import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type { Land } from '@/types';
import { Screen } from '@/components/layout/Screen';
import { Scene } from '@/components/media/Scene';
import { Button } from '@/components/ui/Button';
import { TextField, TextArea } from '@/components/ui/TextField';
import { Chip } from '@/components/ui/Chip';
import { Callout, DetailGrid, Stepper } from '@/components/ui/Blocks';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/States';
import { useUI } from '@/app/providers';
import { BOOKING_SLOTS } from '@/data/bookings';
import { api } from '@/services/api';
import { invalidate, useMutation, useQuery } from '@/services/query';
import { useStore } from '@/services/store';
import { addDays, startOfDay, toISODate } from '@/lib/dates';
import { formatDate, formatTime, monthShort, weekdayShort } from '@/lib/format';
import { validateAcres } from '@/lib/validation';
import s from './Bookings.module.css';
import o from '../orders/Orders.module.css';

const STEPS = ['Field and crop', 'Date and time', 'Review'];
const SLOT_HINT: Record<string, string> = { '07:00': 'Early morning', '09:00': 'Morning', '12:00': 'Midday', '15:00': 'Afternoon' };

export default function NewBooking() {
  const navigate = useNavigate();
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

  const chooseLand = (l: Land) => {
    setLand(l);
    const first = l.crops[0];
    setCrop(first?.name ?? '');
    setAcres(String(first?.areaAcres ?? l.areaAcres));
    setErrors({});
  };

  const validateStep = () => {
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
    if (!validateStep()) return;
    if (step < 3) {
      setDir(1);
      setStep(step + 1);
      return;
    }
    const b = await create.mutate({ land: land!, crop, acres: Number(acres), date: date!, slot: slot!, notes });
    if (b) {
      invalidate('bookings');
      invalidate('notifications');
      navigate(`/bookings/${b.id}/requested`, { replace: true, state: { booking: b } });
    }
  };

  const back = () => {
    setDir(-1);
    setStep(step - 1);
  };

  const activeLands = lands.data ?? [];

  return (
    <Screen
      title="Book a field service"
      back
      backTo="/orders?tab=bookings"
      footer={
        <div className={s.footer}>
          {step > 1 && (
            <Button variant="secondary" size="lg" icon={<ArrowLeft aria-hidden />} onClick={back} disabled={create.pending} aria-label="Previous step">
              Back
            </Button>
          )}
          <Button size="lg" iconRight={step < 3 ? <ArrowRight aria-hidden /> : <Check aria-hidden />} onClick={next} loading={create.pending}>
            {step < 3 ? 'Continue' : create.pending ? 'Sending request…' : 'Request booking'}
          </Button>
        </div>
      }
    >
      <div className={o.page}>
        <Stepper step={step} total={3} title={STEPS[step - 1]} />
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="stack"
            style={{ ['--gap' as string]: '16px' }}
          >
            {step === 1 && (
              <>
                <div className="stack" style={{ ['--gap' as string]: '12px' }}>
                  <span className={s.label} id="land-label">
                    Which field?
                  </span>
                  {lands.status === 'loading' && <Skeleton h={88} r={22} />}
                  {lands.status === 'success' && activeLands.length === 0 && (
                    <EmptyState animation="emptyBox" title="Add a field first" body="Bookings are made for a registered field." action={<Button to="/lands/new">Add a field</Button>} />
                  )}
                  <div className={s.lands} role="radiogroup" aria-labelledby="land-label">
                    {activeLands.map((l) => (
                      <button key={l.id} type="button" role="radio" aria-checked={land?.id === l.id} className={s.landOpt} disabled={!l.active} onClick={() => chooseLand(l)}>
                        <span className={s.landThumb}>
                          <Scene scene={l.scene} aspect="square" style={{ position: 'absolute', inset: 0 }} />
                        </span>
                        <span>
                          <span className={s.landName} style={{ display: 'block' }}>
                            {l.name}
                          </span>
                          <span className={s.landSub} style={{ display: 'block' }}>
                            {l.areaAcres} acres · {l.active ? (l.crops.length ? l.crops.map((c) => c.name.replace(/\s*\(.*\)/, '')).join(', ') : 'No crops added') : 'Inactive field'}
                          </span>
                        </span>
                        <span className={s.radio} aria-hidden>
                          {land?.id === l.id && <Check strokeWidth={3} />}
                        </span>
                      </button>
                    ))}
                  </div>
                  {errors.land && (
                    <p className={s.fieldError} role="alert">
                      {errors.land}
                    </p>
                  )}
                </div>
                {land && (
                  <>
                    <div className="stack" style={{ ['--gap' as string]: '12px' }}>
                      <span className={s.label}>Crop</span>
                      <div className="row" style={{ flexWrap: 'wrap', ['--gap' as string]: '8px' }}>
                        {[...land.crops.map((c) => c.name), 'Other'].map((c) => (
                          <Chip key={c} selected={crop === c} onClick={() => setCrop(c)}>
                            {c.replace(/\s*\(.*\)/, '')}
                          </Chip>
                        ))}
                      </div>
                      {errors.crop && <p className={s.fieldError}>{errors.crop}</p>}
                    </div>
                    <TextField label="Area to cover" inputMode="decimal" suffix="acres" value={acres} onChange={(e) => setAcres(e.target.value.replace(/[^\d.]/g, ''))} error={errors.acres} hint={`${land.name} is ${land.areaAcres} acres`} />
                  </>
                )}
              </>
            )}

            {step === 2 && (
              <>
                <div className="stack" style={{ ['--gap' as string]: '12px' }}>
                  <span className={s.label} id="date-label">
                    Preferred date
                  </span>
                  <div className={s.dates} role="group" aria-labelledby="date-label">
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
                  {errors.date && <p className={s.fieldError}>{errors.date}</p>}
                </div>
                <div className="stack" style={{ ['--gap' as string]: '12px' }}>
                  <span className={s.label} id="slot-label">
                    Preferred time
                  </span>
                  <div className={s.slots} role="group" aria-labelledby="slot-label">
                    {BOOKING_SLOTS.map((t) => (
                      <button key={t} type="button" className={s.slot} aria-pressed={slot === t} onClick={() => setSlot(t)}>
                        <strong>{formatTime(t)}</strong>
                        <span>{SLOT_HINT[t]}</span>
                      </button>
                    ))}
                  </div>
                  {errors.slot && <p className={s.fieldError}>{errors.slot}</p>}
                </div>
                <Callout tone="neutral">The team confirms the exact time when they approve your booking.</Callout>
              </>
            )}

            {step === 3 && land && date && slot && (
              <>
                <DetailGrid
                  items={[
                    { label: 'Field', value: land.name },
                    { label: 'Crop', value: crop.replace(/\s*\(.*\)/, '') },
                    { label: 'Area', value: `${acres} acres` },
                    { label: 'Time', value: formatTime(slot) },
                    { label: 'Date', value: formatDate(date, 'long'), full: true },
                  ]}
                />
                <TextArea label="Notes for the team" optional placeholder="For example: straw is spread across the whole field" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} />
                <p style={{ font: 'var(--t-caption)', color: 'var(--fg-3)' }}>You’ll get a notification when the booking is approved and an operator is assigned.</p>
                {create.error && (
                  <Callout tone="danger" icon={<AlertTriangle aria-hidden />} title="Booking not sent">
                    {create.error.message}
                  </Callout>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Screen>
  );
}
