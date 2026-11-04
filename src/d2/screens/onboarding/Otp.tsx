import { Navigate, useLocation } from 'react-router-dom';
import { actions, getState } from '@/services/store';
import { Screen, PageTitle } from '../../layout/Screen';
import { useNav } from '../../nav';
import { to } from '../../paths';
import { OtpForm } from './OtpForm';

export default function Otp() {
  const nav = useNav();
  const { state } = useLocation() as { state: { phone?: string } | null };
  const phone = state?.phone;
  if (!phone) return <Navigate to={to('/auth')} replace />;
  return (
    <Screen title="Enter the code" backTo="/auth">
      <PageTitle kicker="Step 2 of 2" title="Enter the 6-digit code" />
      <div className="fj-gutter">
        <OtpForm
          phone={phone}
          onChangeNumber={() => nav(-1)}
          onVerified={() => {
            actions.signIn(phone, true);
            nav(getState().session.location !== 'unknown' ? '/home' : '/auth/location', { replace: true });
          }}
        />
      </div>
    </Screen>
  );
}
