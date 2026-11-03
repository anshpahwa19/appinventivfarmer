import { useEffect, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Blocks';
import { useToast } from '@/components/ui/Toast';
import { api, ApiError, DEMO_OTP } from '@/services/api';
import { formatPhone } from '@/lib/format';
import s from './Onboarding.module.css';

const LENGTH = 6;

/** Six-box OTP entry backed by one real input (paste, SMS autofill and screen readers work). */
export function OtpForm({ phone, onVerified, onChangeNumber }: { phone: string; onVerified: () => void; onChangeNumber?: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [focused, setFocused] = useState(true);
  const [wait, setWait] = useState(30);
  const input = useRef<HTMLInputElement>(null);
  const shake = useAnimationControls();
  const toast = useToast();

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
      shake.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.4 } });
      input.current?.focus();
    } finally {
      setPending(false);
    }
  };

  const onChange = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, LENGTH);
    setCode(digits);
    setError(null);
    if (digits.length === LENGTH) submit(digits);
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
    <div className="stack" style={{ ['--gap' as string]: '18px' }}>
      <p style={{ font: 'var(--t-body)', color: 'var(--fg-2)' }}>
        We sent a 6-digit code to <strong style={{ color: 'var(--fg)' }}>{formatPhone(phone)}</strong>.{' '}
        {onChangeNumber && (
          <button type="button" onClick={onChangeNumber} style={{ color: 'var(--link)', fontWeight: 700, padding: '4px 2px' }}>
            Change number
          </button>
        )}
      </p>
      <motion.div animate={shake} className={`${s.otpWrap} ${error ? s.otpError : ''}`} onClick={() => input.current?.focus()}>
        {Array.from({ length: LENGTH }, (_, i) => {
          const active = focused && i === Math.min(code.length, LENGTH - 1) && !pending;
          return (
            <div key={i} className={`${s.otpBox} ${active ? s.otpActive : ''}`} aria-hidden>
              {code[i] ?? (active ? <span className={s.caret} /> : '')}
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
          aria-describedby="otp-error"
          disabled={pending}
        />
      </motion.div>
      {error && (
        <p id="otp-error" role="alert" style={{ color: 'var(--danger-fg)', font: '600 0.9375rem/1.4 var(--font)' }}>
          {error}
        </p>
      )}
      <div className={s.resend}>
        <span>Didn’t get it?</span>
        <button type="button" onClick={resend} disabled={wait > 0}>
          {wait > 0 ? `Resend in 0:${String(wait).padStart(2, '0')}` : 'Resend code'}
        </button>
      </div>
      <Button size="lg" block loading={pending} disabled={code.length < LENGTH} onClick={() => submit(code)}>
        {pending ? 'Verifying…' : 'Verify'}
      </Button>
      <Callout tone="info" icon={<Info aria-hidden />} title="Prototype">
        No SMS is sent. Use the code {DEMO_OTP}.
      </Callout>
    </div>
  );
}
