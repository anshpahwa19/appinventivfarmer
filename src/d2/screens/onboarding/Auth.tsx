import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { api, ApiError } from '@/services/api';
import { actions, getState } from '@/services/store';
import { validatePhone } from '@/lib/validation';
import { useStatusTone } from '@/lib/statusTone';
import markUrl from '@/assets/brand/kisani-urjaa-mark.webp';
import { Photo } from '../../photo/Photo';
import { Button } from '../../ui/Button';
import { TextField } from '../../ui/Field';
import { SectionTabs } from '../../ui/Controls';
import { Sheet } from '../../ui/Sheet';
import { useToast } from '../../ui/Toast';
import { useNav } from '../../nav';
import { to } from '../../paths';
import s from './Onboarding.module.css';

function fmt(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 10);
  return d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d;
}

export default function Auth() {
  const nav = useNav();
  const toast = useToast();
  useStatusTone('light');
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [skip, setSkip] = useState(false);
  const digits = phone.replace(/\D/g, '');

  const check = () => {
    const e = validatePhone(digits);
    setError(e);
    setTouched(true);
    return !e;
  };

  const send = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!check()) return;
    setSending(true);
    try {
      await api.sendOtp(digits);
      nav('/auth/otp', { state: { phone: digits, mode } });
    } catch (err) {
      toast({ message: err instanceof ApiError ? err.message : 'Could not send the code.', tone: 'error' });
    } finally {
      setSending(false);
    }
  };

  const continueUnverified = () => {
    setSkip(false);
    actions.signIn(digits, false);
    nav(getState().session.location !== 'unknown' ? '/home' : '/auth/location', { replace: true });
  };

  return (
    <div className={`${s.split}`}>
      <div className={s.splitPhoto}>
        <Photo id="paddy-transplant" ratio="fill" shade="full" drift priority label="hero" />
        <div className={s.splitBrand}>
          <span className={s.plate}>
            <img src={markUrl} alt="" />
          </span>
          <span className={s.brandName}>
            Kisani Urjaa
            <small>From waste to wealth</small>
          </span>
        </div>
      </div>
      <form className={s.splitPanel} onSubmit={send} noValidate>
        <SectionTabs
          label="Account"
          size="md"
          value={mode}
          onChange={(m) => {
            setMode(m);
            setError(null);
          }}
          items={[
            { value: 'signup', label: 'New here' },
            { value: 'login', label: 'Log in' },
          ]}
        />
        <div className={s.panelBody}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
              <h1 className={s.panelTitle}>{mode === 'signup' ? 'Start with your mobile number' : 'Welcome back'}</h1>
              <p className={s.panelText}>{mode === 'signup' ? 'We’ll send a code by SMS to check it’s yours.' : 'Log in with the number you registered with.'}</p>
            </motion.div>
          </AnimatePresence>
          <TextField
            big
            label="Mobile number"
            prefix="+91"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="98765 43210"
            value={phone}
            onChange={(e) => {
              setPhone(fmt(e.target.value));
              if (touched) setError(validatePhone(e.target.value));
            }}
            onBlur={() => digits && check()}
            error={error}
            hint="10 digits, without 0 or +91"
          />
          <Button type="submit" size="lg" block loading={sending}>
            {sending ? 'Sending code…' : 'Send me a code'}
          </Button>
          {mode === 'signup' && (
            <Button variant="ghost" block onClick={() => check() && setSkip(true)}>
              Continue without verifying
            </Button>
          )}
          <p className={s.legal}>
            By continuing you accept the <Link to={to('/account/legal/terms')}>Terms</Link> and <Link to={to('/account/legal/privacy')}>Privacy policy</Link>.
          </p>
        </div>
      </form>

      <Sheet
        open={skip}
        onClose={() => setSkip(false)}
        variant="dialog"
        icon={<ShieldAlert />}
        tone="warning"
        title="Continue without verifying?"
        description="You can read stories, watch videos and see events. Ordering FOM and booking services stay locked until your number is verified, from Me or by your Kisani Didi."
        footer={
          <>
            <Button block onClick={continueUnverified} data-autofocus>
              Continue
            </Button>
            <Button variant="secondary" block onClick={() => setSkip(false)}>
              Go back and verify
            </Button>
          </>
        }
      />
    </div>
  );
}
