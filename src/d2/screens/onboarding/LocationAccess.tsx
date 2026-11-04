import { useState } from 'react';
import { actions, useStore } from '@/services/store';
import { useStatusTone } from '@/lib/statusTone';
import { FjLottie } from '../../lottie/Lottie';
import { Button } from '../../ui/Button';
import { Note } from '../../ui/Blocks';
import { useToast } from '../../ui/Toast';
import { RevealText, Cascade, Rise } from '../../motion/Reveal';
import { useNav } from '../../nav';
import { Photo } from '../../photo/Photo';
import s from './Onboarding.module.css';

const BENEFITS = [
  { title: 'Weather for your field', text: 'Rain and wind warnings before you spray' },
  { title: 'Events near you', text: 'Workshops and camps in nearby villages' },
  { title: 'Easier deliveries', text: 'Drivers find your farm faster' },
];

export default function LocationAccess() {
  const nav = useNav();
  const toast = useToast();
  const profile = useStore((st) => st.profile);
  const [asking, setAsking] = useState(false);
  const [denied, setDenied] = useState(false);
  useStatusTone('dark');
  const done = () => nav('/home', { replace: true });

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
        toast({ message: 'Location on. Weather now matches your fields.', tone: 'success' });
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
    <div className={`${s.location}`}>
      <div className={s.locPhoto}>
        <Photo id="dawn-field" ratio="fill" shade="bottom" priority />
      </div>
      <div className={s.locTop}>
        <FjLottie name="pin" size={150} night />
        <p className={s.section}>One last thing</p>
        <RevealText text="Use your location?" className={s.locTitle} delay={0.1} />
        <p className={s.locText}>It makes weather and spray advice match your fields. You can change this any time in your phone settings.</p>
      </div>
      <div className={s.locBottom}>
        <Cascade>
          <ol className={s.benefits}>
            {BENEFITS.map((b, i) => (
              <Rise as="li" key={b.title} className={s.benefit}>
                <span className={s.benefitNum}>0{i + 1}</span>
                <span>
                  <strong>{b.title}</strong>
                  {b.text}
                </span>
              </Rise>
            ))}
          </ol>
        </Cascade>
        {denied && (
          <Note tone="warning" title="Location is off">
            We’ll show weather for {profile.village}, {profile.district}. You can allow location later in your phone settings.
          </Note>
        )}
        <div className="fj-stack" style={{ ['--gap' as string]: '8px' }}>
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
    </div>
  );
}
