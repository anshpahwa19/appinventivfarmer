import { actions, useStore } from '@/services/store';
import { Screen, PageTitle } from '../../layout/Screen';
import { Switch, Toggle } from '../../ui/Controls';
import s from './Account.module.css';

export default function Display() {
  const prefs = useStore((st) => st.prefs);
  return (
    <Screen title="Display" backTo="/account">
      <PageTitle kicker="Preferences" title="Display" deck="Settings are shared by both design directions." />
      <div className={s.sub}>
        <section className={s.card}>
          <h2 className={s.cardTitle}>Text size</h2>
          <p className={s.cardSub}>Make all text bigger and easier to read outdoors.</p>
          <div style={{ marginTop: 12 }}>
            <Toggle label="Text size" value={prefs.text} onChange={(v) => actions.setPrefs({ text: v })} options={[{ value: 'default', label: 'Default' }, { value: 'large', label: 'Large' }]} />
          </div>
          <div className={s.preview} aria-hidden>
            <strong>Good day to spray</strong>
            <span>Calm and dry. Spray in the morning or late afternoon.</span>
          </div>
        </section>
        <section className={s.card}>
          <h2 className={s.cardTitle}>Theme</h2>
          <p className={s.cardSub}>Night edition saves battery after dark. Automatic follows your phone.</p>
          <div style={{ marginTop: 12 }}>
            <Toggle
              label="Theme"
              value={prefs.theme}
              onChange={(v) => actions.setPrefs({ theme: v })}
              options={[
                { value: 'system', label: 'Automatic' },
                { value: 'light', label: 'Day' },
                { value: 'dark', label: 'Night' },
              ]}
            />
          </div>
        </section>
        <section className={s.card}>
          <div className={s.cardRow}>
            <div>
              <h2 className={s.cardTitle}>Reduce animations</h2>
              <p className={s.cardSub}>Turns off moving photos, reveals and page slides.</p>
            </div>
            <Switch checked={prefs.motion === 'reduce'} onChange={(v) => actions.setPrefs({ motion: v ? 'reduce' : 'system' })} label="Reduce animations" />
          </div>
        </section>
      </div>
    </Screen>
  );
}
