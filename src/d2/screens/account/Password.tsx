import { useState } from 'react';
import { Check, Eye, EyeOff, X } from 'lucide-react';
import { Screen, PageTitle } from '../../layout/Screen';
import { Button } from '../../ui/Button';
import { TextField } from '../../ui/Field';
import { Note } from '../../ui/Blocks';
import { useToast } from '../../ui/Toast';
import { useNav } from '../../nav';
import s from './Account.module.css';

const RULES = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'A letter and a number', test: (v: string) => /[a-z]/i.test(v) && /\d/.test(v) },
];

export default function Password() {
  const nav = useNav();
  const toast = useToast();
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [saving, setSaving] = useState(false);
  const eye = (
    <button type="button" onClick={() => setShow((x) => !x)} aria-label={show ? 'Hide passwords' : 'Show passwords'} style={{ display: 'grid', placeItems: 'center', width: 40, height: 40 }}>
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
    nav(-1);
  };
  return (
    <Screen
      title="Change password"
      backTo="/account"
      footer={
        <Button size="lg" block onClick={save} loading={saving}>
          {saving ? 'Saving…' : 'Change password'}
        </Button>
      }
    >
      <PageTitle kicker="Security" title="Change password" />
      <div className={s.sub}>
        <div className={s.form}>
          <TextField label="Current password" type={show ? 'text' : 'password'} autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} error={errors.cur} suffix={eye} />
          <TextField label="New password" type={show ? 'text' : 'password'} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} error={errors.next} />
          <ul className={s.rules} aria-label="Password rules">
            {RULES.map((r) => {
              const ok = r.test(next);
              return (
                <li key={r.label} className={`${s.rule} ${ok ? s.ruleOk : ''}`}>
                  {ok ? <Check aria-hidden /> : <X aria-hidden />}
                  {r.label}
                  <span className="sr-only">{ok ? '(met)' : '(not met)'}</span>
                </li>
              );
            })}
          </ul>
          <TextField label="Confirm new password" type={show ? 'text' : 'password'} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
          <Note>You can always log in with a code sent to your mobile number instead.</Note>
        </div>
      </div>
    </Screen>
  );
}
