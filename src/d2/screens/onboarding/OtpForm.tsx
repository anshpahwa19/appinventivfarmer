import { useEffect, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { Info } from 'lucide-react';
import { api, ApiError, DEMO_OTP } from '@/services/api';
import { formatPhone } from '@/lib/format';
import { Button } from '../../ui/Button';
import { Note } from '../../ui/Blocks';
import { useToast } from '../../ui/Toast';
import s from './Onboarding.module.css';

const LENGTH = 6;

/** Six large digit slots backed by one real input (paste, SMS autofill, screen readers). */
export function OtpForm({ phone, onVerified, onChangeNumber }: { phone: string; onVerified: () => void; onChangeNumber?: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [focused, setFocused] = useState(true);
  const [wait, setWait] = useState(30);
  const input = useRef<HTMLInputElement>(null);
  const shake = useAnimationControls();
  const toast = useToast();
  const refocus = useRef(false);

  // The input is disabled while checking; give focus back once it is enabled again.
  useEffect(() => {
    if (!pending && refocus.current) {
      refocus.current = false;
      input.current?.focus();
    }
  }, [pending]);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const submit = async (value: string) => {
    setPending(true);
    setError(null);
    try {
      await api.verifyOtp(phone, value);
      onVerified();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not verify. Try again.');
      setCode('');
      shake.start({ x: [0, -12, 12, -6, 6, 0], transition: { duration: 0.4 } });
      refocus.current = true;
    } finally {
      setPending(false);
    }
  };

  const onChange = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, LENGTH);
    setCode(d);
    setError(null);
    if (d.length === LENGTH) submit(d);
  };

  const resend = async () => {
    try {
      await api.sendOtp(phone);
      setWait(30);
      toast({ message: 'New code sent', tone: 'success' });
    } catch (e) {
      toast({ message: e instanceof ApiError ? e.message : 'Could not send the code.', tone: 'error' });
    }
  };

  return (
    <div className="fj-stack" style={{ ['--gap' as string]: '18px' }}>
      <p className={s.otpLead}>
        Sent to <strong>{formatPhone(phone)}</strong>
        {onChangeNumber && (
          <button type="button" onClick={onChangeNumber} className={s.linkBtn}>
            Change
          </button>
        )}
      </p>
      <motion.div animate={shake} className={`${s.otp} ${error ? s.otpError : ''}`} onClick={() => input.current?.focus()}>
        {Array.from({ length: LENGTH }, (_, n) => {
          const active = focused && !pending && n === Math.min(code.length, LENGTH - 1);
          return (
            <div key={n} className={`${s.slot} ${code[n] ? s.slotFilled : ''} ${active ? s.slotActive : ''}`} aria-hidden>
              {code[n] ?? ''}
              {active && !code[n] && <span className={s.caret} />}
            </div>
          );
        })}
        <input
          ref={input}
          className={s.otpInput}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={LENGTH}
          autoFocus
          aria-label={`Verification code, ${LENGTH} digits`}
          aria-invalid={!!error || undefined}
          aria-describedby="fj-otp-error"
          disabled={pending}
        />
      </motion.div>
      {error && (
        <p id="fj-otp-error" role="alert" className={s.otpErr}>
          {error}
        </p>
      )}
      <div className={s.resend}>
        <span>Didn’t get it?</span>
        <button type="button" onClick={resend} disabled={wait > 0} className={s.linkBtn}>
          {wait > 0 ? `Resend in 0:${String(wait).padStart(2, '0')}` : 'Resend code'}
        </button>
      </div>
      <Button size="lg" block loading={pending} disabled={code.length < LENGTH} onClick={() => submit(code)}>
        {pending ? 'Checking…' : 'Verify'}
      </Button>
      <Note tone="info" icon={<Info aria-hidden />} title="Prototype">
        No SMS is sent. Use the code {DEMO_OTP}.
      </Note>
    </div>
  );
}
