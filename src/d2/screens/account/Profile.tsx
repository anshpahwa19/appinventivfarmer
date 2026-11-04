import { useState } from 'react';
import { Lock } from 'lucide-react';
import { actions, useStore } from '@/services/store';
import { formatPhone } from '@/lib/format';
import { validatePincode, validateRequired } from '@/lib/validation';
import { Screen, PageTitle } from '../../layout/Screen';
import { Button } from '../../ui/Button';
import { TextField } from '../../ui/Field';
import { Note } from '../../ui/Blocks';
import { useToast } from '../../ui/Toast';
import { useNav } from '../../nav';
import s from './Account.module.css';

export default function Profile() {
  const nav = useNav();
  const toast = useToast();
  const profile = useStore((st) => st.profile);
  const phone = useStore((st) => st.session.phone || st.profile.phone);
  const [f, setF] = useState({ name: profile.name, village: profile.village, taluka: profile.taluka, district: profile.district, pincode: profile.pincode });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const dirty = Object.entries(f).some(([k, v]) => profile[k as keyof typeof f] !== v);
  const save = () => {
    const e = { name: validateRequired(f.name, 'your name'), village: validateRequired(f.village, 'your village'), district: validateRequired(f.district, 'your district'), pincode: validatePincode(f.pincode) };
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;
    actions.updateProfile({ ...f, name: f.name.trim() });
    toast({ message: 'Profile saved', tone: 'success' });
    nav(-1);
  };
  return (
    <Screen
      title="My profile"
      backTo="/account"
      footer={
        <Button size="lg" block onClick={save} disabled={!dirty}>
          {dirty ? 'Save changes' : 'No changes yet'}
        </Button>
      }
    >
      <PageTitle kicker="Me" title="My profile" />
      <div className={s.sub}>
        <section className={s.form} aria-label="About you">
          <TextField label="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} error={errors.name} autoComplete="name" />
          <TextField label="Mobile number" value={formatPhone(phone)} readOnly suffix={<Lock aria-hidden />} hint="To change your number, contact support." />
          <TextField label="Username" value={profile.username} readOnly suffix={<Lock aria-hidden />} />
        </section>
        <section className={s.form} aria-label="Where you farm">
          <div className={s.grid2}>
            <TextField label="Village" value={f.village} onChange={(e) => setF({ ...f, village: e.target.value })} error={errors.village} />
            <TextField label="Taluka" value={f.taluka} onChange={(e) => setF({ ...f, taluka: e.target.value })} />
          </div>
          <div className={s.grid2}>
            <TextField label="District" value={f.district} onChange={(e) => setF({ ...f, district: e.target.value })} error={errors.district} />
            <TextField label="PIN code" inputMode="numeric" maxLength={6} value={f.pincode} onChange={(e) => setF({ ...f, pincode: e.target.value.replace(/\D/g, '') })} error={errors.pincode} />
          </div>
          <Note>Your village is used for weather and delivery when location is off.</Note>
        </section>
      </div>
    </Screen>
  );
}
