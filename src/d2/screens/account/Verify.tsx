import { CheckCircle2 } from 'lucide-react';
import { actions, useStore } from '@/services/store';
import { Screen, PageTitle } from '../../layout/Screen';
import { Note } from '../../ui/Blocks';
import { Button } from '../../ui/Button';
import { useToast } from '../../ui/Toast';
import { useNav } from '../../nav';
import { OtpForm } from '../onboarding/OtpForm';
import s from './Account.module.css';

export default function Verify() {
  const nav = useNav();
  const toast = useToast();
  const phone = useStore((st) => st.session.phone || st.profile.phone);
  const verified = useStore((st) => st.session.verified);
  return (
    <Screen title="Verify number" backTo="/account">
      <PageTitle kicker="Security" title="Verify your number" deck={verified ? undefined : 'Verifying unlocks FOM orders and field bookings.'} />
      <div className={s.sub}>
        {verified ? (
          <>
            <Note tone="success" icon={<CheckCircle2 aria-hidden />} title="Already verified">
              You can order FOM and book field services.
            </Note>
            <Button onClick={() => nav('/home', { replace: true })}>Go to Today</Button>
          </>
        ) : (
          <OtpForm
            phone={phone}
            onVerified={() => {
              actions.verify(phone);
              toast({ message: 'Number verified. Orders and bookings are unlocked.', tone: 'success' });
              nav(-1);
            }}
          />
        )}
      </div>
    </Screen>
  );
}
