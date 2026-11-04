import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutTemplate, Play, Repeat, RotateCcw } from 'lucide-react';
import { clearQueryCache } from '@/services/query';
import { actions, setState, useStore } from '@/services/store';
import { counterpartPath } from '@/app/DirectionSwitcher';
import { Screen, PageTitle } from '../../layout/Screen';
import { Switch, Toggle } from '../../ui/Controls';
import { Button } from '../../ui/Button';
import { Note } from '../../ui/Blocks';
import { Sheet } from '../../ui/Sheet';
import { useToast } from '../../ui/Toast';
import { useNav } from '../../nav';
import s from './Account.module.css';

export default function PrototypeControls() {
  const nav = useNav();
  const toast = useToast();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const demo = useStore((st) => st.demo);
  const verified = useStore((st) => st.session.verified);
  const [reset, setReset] = useState(false);
  return (
    <Screen title="Prototype controls" backTo="/account">
      <PageTitle kicker="Design review" title="Prototype controls" />
      <div className={s.sub}>
        <Note tone="info" title="For demos and testing">
          These switches only exist in the prototype. They are shared by both design directions.
        </Note>
        <section className={s.card}>
          <div className={s.cardRow}>
            <div>
              <h2 className={s.cardTitle}>Verified account</h2>
              <p className={s.cardSub}>Unverified accounts can’t order or book.</p>
            </div>
            <Switch
              checked={verified}
              onChange={(v) => {
                setState((st) => ({ ...st, session: { ...st.session, verified: v } }));
                toast({ message: v ? 'Now verified' : 'Now unverified', tone: 'info' });
              }}
              label="Verified account"
            />
          </div>
        </section>
        <section className={s.card}>
          <h2 className={s.cardTitle}>Network</h2>
          <p className={s.cardSub}>Slow shows loading states. Offline shows saved data and failed requests.</p>
          <div style={{ marginTop: 12 }}>
            <Toggle
              label="Network"
              value={demo.network}
              onChange={(v) => {
                actions.setDemo({ network: v });
                clearQueryCache();
              }}
              options={[
                { value: 'normal', label: 'Normal' },
                { value: 'slow', label: 'Slow' },
                { value: 'offline', label: 'Offline' },
              ]}
            />
          </div>
        </section>
        <section className={s.card}>
          <div className={s.cardRow}>
            <div>
              <h2 className={s.cardTitle}>Empty states</h2>
              <p className={s.cardSub}>Lists return nothing, so every empty screen can be seen.</p>
            </div>
            <Switch
              checked={demo.emptyData}
              onChange={(v) => {
                actions.setDemo({ emptyData: v });
                clearQueryCache();
              }}
              label="Show empty states"
            />
          </div>
        </section>
        <div className="fj-stack" style={{ ['--gap' as string]: '10px' }}>
          <Button variant="secondary" icon={<Repeat aria-hidden />} onClick={() => navigate(counterpartPath(pathname))}>
            Open this screen in Direction 01
          </Button>
          <Button variant="secondary" icon={<LayoutTemplate aria-hidden />} to="/design-system">
            Open the design system
          </Button>
          <Button
            variant="secondary"
            icon={<Play aria-hidden />}
            onClick={() => {
              setState((st) => ({ ...st, session: { ...st.session, onboarded: false, signedIn: false } }));
              nav('/welcome', { replace: true });
            }}
          >
            Replay onboarding
          </Button>
          <Button variant="danger" icon={<RotateCcw aria-hidden />} onClick={() => setReset(true)}>
            Reset all prototype data
          </Button>
        </div>
      </div>
      <Sheet
        open={reset}
        onClose={() => setReset(false)}
        variant="dialog"
        icon={<RotateCcw />}
        tone="danger"
        title="Reset prototype data?"
        description="Orders, bookings, bookmarks, fields and settings you changed on this phone go back to the sample data."
        footer={
          <>
            <Button
              variant="danger"
              block
              onClick={() => {
                setReset(false);
                actions.resetAll();
                clearQueryCache();
                nav('/', { replace: true });
              }}
            >
              Reset
            </Button>
            <Button variant="secondary" block onClick={() => setReset(false)} data-autofocus>
              Cancel
            </Button>
          </>
        }
      />
    </Screen>
  );
}
