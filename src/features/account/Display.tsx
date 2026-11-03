import { Screen } from '@/components/layout/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Switch } from '@/components/ui/Misc';
import { actions, useStore } from '@/services/store';
import s from './Account.module.css';

export default function Display() {
  const prefs = useStore((st) => st.prefs);
  return (
    <Screen title="Display" back backTo="/account">
      <div className={s.page}>
        <section className={s.card}>
          <h2 className={s.cardTitle}>Text size</h2>
          <p className={s.cardSub}>Make all text in the app bigger and easier to read outdoors.</p>
          <div style={{ marginTop: 16 }}>
            <SegmentedControl label="Text size" value={prefs.text} onChange={(v) => actions.setPrefs({ text: v })} segments={[{ value: 'default', label: 'Default' }, { value: 'large', label: 'Large' }]} />
          </div>
          <div className={s.preview} aria-hidden>
            <p className="t-subheading">Good day to spray</p>
            <p className="t-support c-2" style={{ marginTop: 4 }}>
              Calm and dry. Spray in the morning or late afternoon.
            </p>
          </div>
        </section>

        <section className={s.card}>
          <h2 className={s.cardTitle}>Theme</h2>
          <p className={s.cardSub}>Dark saves battery at night. “Automatic” follows your phone.</p>
          <div style={{ marginTop: 16 }}>
            <SegmentedControl
              label="Theme"
              value={prefs.theme}
              onChange={(v) => actions.setPrefs({ theme: v })}
              segments={[
                { value: 'system', label: 'Automatic' },
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
            />
          </div>
        </section>

        <section className={s.card}>
          <div className="row-between">
            <div>
              <h2 className={s.cardTitle}>Reduce animations</h2>
              <p className={s.cardSub}>Turns off moving backgrounds and slide effects.</p>
            </div>
            <Switch checked={prefs.motion === 'reduce'} onChange={(v) => actions.setPrefs({ motion: v ? 'reduce' : 'system' })} label="Reduce animations" />
          </div>
        </section>
      </div>
    </Screen>
  );
}
