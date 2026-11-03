import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { Callout } from '@/components/ui/Blocks';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { actions, useStore } from '@/services/store';
import { OtpForm } from '@/features/onboarding/OtpForm';
import s from './Account.module.css';

export default function Verify() {
  const navigate = useNavigate();
  const toast = useToast();
  const phone = useStore((st) => st.session.phone || st.profile.phone);
  const verified = useStore((st) => st.session.verified);
  return (
    <Screen title="Verify number" back backTo="/account">
      <div className={s.page}>
        <h1 className="t-title">Verify your number</h1>
        {verified ? (
          <>
            <Callout tone="success" icon={<CheckCircle2 aria-hidden />} title="Already verified">
              You can order FOM and book field services.
            </Callout>
            <Button onClick={() => navigate('/home', { replace: true })}>Go to home</Button>
          </>
        ) : (
          <OtpForm
            phone={phone}
            onVerified={() => {
              actions.verify(phone);
              toast({ message: 'Number verified. Orders and bookings are unlocked.', tone: 'success' });
              navigate(-1);
            }}
          />
        )}
      </div>
    </Screen>
  );
}
