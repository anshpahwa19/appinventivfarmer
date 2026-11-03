import { useLocation, useNavigate } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { Screen } from '@/components/layout/Screen';
import { actions, getState } from '@/services/store';
import { OtpForm } from './OtpForm';

export default function Otp() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: { phone?: string; mode?: 'signup' | 'login' } | null };
  const phone = state?.phone;
  if (!phone) return <Navigate to="/auth" replace />;
  return (
    <Screen title="Verify number" back backTo="/auth">
      <div className="gutter stack" style={{ ['--gap' as string]: '12px', paddingTop: 8 }}>
        <h1 className="t-title">Enter the code</h1>
        <OtpForm
          phone={phone}
          onChangeNumber={() => navigate(-1)}
          onVerified={() => {
            actions.signIn(phone, true);
            const decided = getState().session.location !== 'unknown';
            navigate(decided ? '/home' : '/auth/location', { replace: true });
          }}
        />
      </div>
    </Screen>
  );
}
