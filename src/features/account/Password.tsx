import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Eye, EyeOff, X } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Callout } from '@/components/ui/Blocks';
import { useToast } from '@/components/ui/Toast';
import s from './Account.module.css';

const RULES = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'A letter and a number', test: (v: string) => /[a-z]/i.test(v) && /\d/.test(v) },
];

export default function Password() {
  const navigate = useNavigate();
  const toast = useToast();
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [saving, setSaving] = useState(false);

  const toggle = (
    <button type="button" onClick={() => setShow((x) => !x)} aria-label={show ? 'Hide passwords' : 'Show passwords'} style={{ display: 'grid', placeItems: 'center', width: 36, height: 36 }}>
      {show ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
    </button>
  );

  const save = async () => {
    const e = {
      cur: cur ? null : 'Enter your current password.',
      next: RULES.every((r) => r.test(next)) ? (next === cur ? 'Choose a password different from the current one.' : null) : 'The new password doesn’t meet the rules below.',
      confirm: confirm === next ? null : 'The passwords don’t match.',
    };
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast({ message: 'Password changed (prototype: nothing was sent)', tone: 'success' });
    navigate(-1);
  };

  return (
    <Screen
      title="Change password"
      back
      backTo="/account"
      footer={
        <Button size="lg" block onClick={save} loading={saving}>
          {saving ? 'Saving…' : 'Change password'}
        </Button>
      }
    >
      <div className={s.page}>
        <div className={s.form}>
          <TextField label="Current password" type={show ? 'text' : 'password'} autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} error={errors.cur} suffix={toggle} />
          <TextField label="New password" type={show ? 'text' : 'password'} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} error={errors.next} />
          <ul className="stack" style={{ ['--gap' as string]: '6px' }} aria-label="Password rules">
            {RULES.map((r) => {
              const ok = r.test(next);
              return (
                <li key={r.label} className="row" style={{ ['--gap' as string]: '8px', font: '600 0.875rem/1.3 var(--font)', color: ok ? 'var(--success-fg)' : 'var(--fg-3)' }}>
                  {ok ? <Check aria-hidden style={{ width: 16, height: 16 }} /> : <X aria-hidden style={{ width: 16, height: 16 }} />}
                  {r.label}
                  <span className="sr-only">{ok ? '(met)' : '(not met)'}</span>
                </li>
              );
            })}
          </ul>
          <TextField label="Confirm new password" type={show ? 'text' : 'password'} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
          <Callout tone="neutral">You can always log in with an OTP sent to your mobile number instead.</Callout>
        </div>
      </div>
    </Screen>
  );
}
