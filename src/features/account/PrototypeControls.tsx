import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Play, LayoutTemplate } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Switch } from '@/components/ui/Misc';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Blocks';
import { Sheet } from '@/components/ui/Sheet';
import { useToast } from '@/components/ui/Toast';
import { clearQueryCache } from '@/services/query';
import { actions, setState, useStore } from '@/services/store';
import s from './Account.module.css';

export default function PrototypeControls() {
  const navigate = useNavigate();
  const toast = useToast();
  const demo = useStore((st) => st.demo);
  const verified = useStore((st) => st.session.verified);
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <Screen title="Prototype controls" back backTo="/account">
      <div className={s.page}>
        <Callout tone="info" title="For demos and testing">
          These switches only exist in the prototype. They help you show how the app behaves in different situations.
        </Callout>

        <section className={s.card}>
          <div className="row-between">
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
          <p className={s.cardSub}>Slow shows loading skeletons. Offline shows saved data, offline messages and failed requests.</p>
          <div style={{ marginTop: 14 }}>
            <SegmentedControl
              label="Network"
              value={demo.network}
              onChange={(v) => {
                actions.setDemo({ network: v });
                clearQueryCache();
              }}
              segments={[
                { value: 'normal', label: 'Normal' },
                { value: 'slow', label: 'Slow' },
                { value: 'offline', label: 'Offline' },
              ]}
            />
          </div>
        </section>

        <section className={s.card}>
          <div className="row-between">
            <div>
              <h2 className={s.cardTitle}>Empty states</h2>
              <p className={s.cardSub}>Lists return nothing, so you can see every empty screen.</p>
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

        <div className="stack" style={{ ['--gap' as string]: '10px' }}>
          <Button variant="secondary" icon={<LayoutTemplate aria-hidden />} to="/design-system">
            Open design system
          </Button>
          <Button
            variant="secondary"
            icon={<Play aria-hidden />}
            onClick={() => {
              setState((st) => ({ ...st, session: { ...st.session, onboarded: false, signedIn: false } }));
              navigate('/welcome', { replace: true });
            }}
          >
            Replay onboarding
          </Button>
          <Button variant="danger" icon={<RotateCcw aria-hidden />} onClick={() => setResetOpen(true)}>
            Reset all prototype data
          </Button>
        </div>
      </div>

      <Sheet
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        variant="dialog"
        title="Reset prototype data?"
        description="Orders, bookings, bookmarks, fields and settings you changed on this phone go back to the sample data."
        footer={
          <div className="stack" style={{ ['--gap' as string]: '8px', width: '100%' }}>
            <Button
              variant="danger"
              block
              onClick={() => {
                setResetOpen(false);
                actions.resetAll();
                clearQueryCache();
                navigate('/', { replace: true });
              }}
            >
              Reset
            </Button>
            <Button variant="secondary" block onClick={() => setResetOpen(false)} data-autofocus>
              Cancel
            </Button>
          </div>
        }
      />
    </Screen>
  );
}
