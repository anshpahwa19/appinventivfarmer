import { useStatusTone } from '@/lib/statusTone';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { Scene } from '@/components/media/Scene';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Sheet } from '@/components/ui/Sheet';
import { useToast } from '@/components/ui/Toast';
import { api, ApiError } from '@/services/api';
import { actions, getState } from '@/services/store';
import { validatePhone } from '@/lib/validation';
import s from './Onboarding.module.css';

function formatInput(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 10);
  return d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d;
}

export default function Auth() {
  const navigate = useNavigate();
  const toast = useToast();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  useStatusTone('light');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [skipOpen, setSkipOpen] = useState(false);
  const digits = phone.replace(/\D/g, '');

  const check = () => {
    const err = validatePhone(digits);
    setError(err);
    setTouched(true);
    return !err;
  };

  const sendOtp = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!check()) return;
    setSending(true);
    try {
      await api.sendOtp(digits);
      navigate('/auth/otp', { state: { phone: digits, mode } });
    } catch (err) {
      toast({ message: err instanceof ApiError ? err.message : 'Could not send the code.', tone: 'error' });
    } finally {
      setSending(false);
    }
  };

  const skip = () => {
    if (!check()) return;
    setSkipOpen(true);
  };

  const continueUnverified = () => {
    setSkipOpen(false);
    actions.signIn(digits, false);
    const decided = getState().session.location !== 'unknown';
    navigate(decided ? '/home' : '/auth/location', { replace: true });
  };

  return (
    <div className={s.auth}>
      <div className={s.authHero}>
        <Scene scene={{ kind: 'paddy', seed: 21, time: 'morning' }} aspect="wide" detail="high" className={s.authHeroScene} />
        <div className={s.authHeroScrim} aria-hidden />
        <div className={s.authBrand}>
          <Logo size={36} light />
        </div>
      </div>

      <form className={s.authCard} onSubmit={sendOtp} noValidate>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
            <h1 className={s.authTitle}>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
            <p className={s.authBody}>
              {mode === 'signup' ? 'Enter your mobile number. We’ll send a code to verify it.' : 'Log in with the mobile number you registered with.'}
            </p>
          </motion.div>
        </AnimatePresence>

        <TextField
          label="Mobile number"
          prefix="+91"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="98765 43210"
          value={phone}
          onChange={(e) => {
            setPhone(formatInput(e.target.value));
            if (touched) setError(validatePhone(e.target.value));
          }}
          onBlur={() => digits && check()}
          error={error}
          hint="10-digit number, without 0 or +91"
        />

        <div className="stack" style={{ ['--gap' as string]: '12px' }}>
          <Button type="submit" size="lg" block loading={sending}>
            {sending ? 'Sending code…' : 'Get OTP'}
          </Button>
          {mode === 'signup' && (
            <Button variant="ghost" block onClick={skip}>
              Continue without verifying
            </Button>
          )}
        </div>

        <p className={s.switch}>
          {mode === 'signup' ? 'Already registered?' : 'New to Kisani Urjaa?'}
          <button type="button" onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}>
            {mode === 'signup' ? 'Log in' : 'Create an account'}
          </button>
        </p>

        <p className={s.legal}>
          By continuing you accept the <Link to="/account/legal/terms">Terms</Link> and <Link to="/account/legal/privacy">Privacy policy</Link>.
        </p>
      </form>

      <Sheet
        open={skipOpen}
        onClose={() => setSkipOpen(false)}
        variant="dialog"
        icon={<ShieldAlert />}
        iconTone={{ bg: 'var(--warning-bg)', fg: 'var(--warning-fg)' }}
        title="Continue without verifying?"
        description="You can read news, watch videos and see events. Ordering FOM and booking services stay locked until your number is verified. You can verify any time from Account, or your Kisani Didi can verify you."
        footer={
          <div className="stack" style={{ ['--gap' as string]: '8px', width: '100%' }}>
            <Button block onClick={continueUnverified} data-autofocus>
              Continue
            </Button>
            <Button variant="secondary" block onClick={() => setSkipOpen(false)}>
              Go back and verify
            </Button>
          </div>
        }
      />
    </div>
  );
}
