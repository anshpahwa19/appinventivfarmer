import { useStatusTone } from '@/lib/statusTone';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, CloudSun, Truck } from 'lucide-react';
import { Lottie } from '@/components/media/Lottie';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Blocks';
import { useToast } from '@/components/ui/Toast';
import { actions, useStore } from '@/services/store';
import s from './Onboarding.module.css';

export default function LocationAccess() {
  const navigate = useNavigate();
  const toast = useToast();
  const profile = useStore((st) => st.profile);
  const [asking, setAsking] = useState(false);
  useStatusTone('dark');
  const [denied, setDenied] = useState(false);

  const done = () => navigate('/home', { replace: true });

  const allow = () => {
    if (!('geolocation' in navigator)) {
      setDenied(true);
      actions.setLocation('denied');
      return;
    }
    setAsking(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAsking(false);
        actions.setLocation('granted', { latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        toast({ message: 'Location on. Weather is now for your fields.', tone: 'success' });
        done();
      },
      () => {
        setAsking(false);
        setDenied(true);
        actions.setLocation('denied');
      },
      { timeout: 10_000, maximumAge: 600_000 },
    );
  };

  return (
    <div className={s.auth}>
      <div className={s.center}>
        <Lottie name="pin" size={150} />
        <h1 className="t-title" style={{ marginTop: 4 }}>
          Use your location?
        </h1>
        <p className="t-body c-2" style={{ maxWidth: '32ch' }}>
          It makes weather and spray advice match your fields. You can change this any time in your phone settings.
        </p>
        <div className={s.benefits}>
          {[
            { icon: <CloudSun />, title: 'Weather for your field', text: 'Rain and wind alerts before you spray' },
            { icon: <CalendarDays />, title: 'Events near you', text: 'Workshops and camps in nearby villages' },
            { icon: <Truck />, title: 'Easier deliveries', text: 'Helps drivers find your farm' },
          ].map((b) => (
            <div className={s.benefit} key={b.title}>
              <span className={s.benefitIcon} aria-hidden>
                {b.icon}
              </span>
              <div>
                <div className={s.benefitTitle}>{b.title}</div>
                <div className={s.benefitText}>{b.text}</div>
              </div>
            </div>
          ))}
        </div>
        {denied && (
          <div style={{ width: '100%', marginTop: 14, textAlign: 'left' }}>
            <Callout tone="warning" title="Location is off">
              We’ll show weather for {profile.village}, {profile.district}. You can allow location later in your phone settings.
            </Callout>
          </div>
        )}
      </div>
      <div className={s.bottomActions}>
        {denied ? (
          <Button size="lg" block onClick={done}>
            Continue
          </Button>
        ) : (
          <>
            <Button size="lg" block loading={asking} onClick={allow}>
              {asking ? 'Waiting for permission…' : 'Allow location'}
            </Button>
            <Button
              variant="ghost"
              block
              onClick={() => {
                actions.setLocation('skipped');
                done();
              }}
            >
              Not now
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
