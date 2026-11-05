import { Check } from 'lucide-react';
import { actions, useStore, LANGUAGE_CATALOG } from '@/services/store';
import { Screen } from '@/components/layout/Screen';
import { Callout } from '@/components/ui/Blocks';
import s from './Account.module.css';

const LANGS = LANGUAGE_CATALOG.map((l) => ({ code: l.code, name: l.english, native: l.native, ready: true }));

export default function LanguageScreen() {
  const current = useStore((st) => st.prefs.language);
  return (
    <Screen title="Language" back backTo="/account">
      <div className={s.page}>
        <div className="stack" role="radiogroup" aria-label="App language" style={{ ['--gap' as string]: '12px' }}>
          {LANGS.map((l) => (
            <button key={l.code} type="button" role="radio" aria-checked={l.code === current} className={s.option} disabled={!l.ready} lang={l.code} onClick={() => actions.setPrefs({ language: l.code })}>
              <span className={s.optionText}>
                <span className={s.optionTitle} style={{ display: 'block' }}>
                  {l.native}
                </span>
                <span className={s.optionSub} style={{ display: 'block' }} lang="en">
                  {l.name}
                </span>
              </span>
              {l.ready ? (
                <span className={s.radio} aria-hidden>
                  {l.code === current && <Check strokeWidth={3} />}
                </span>
              ) : (
                <span className={s.soon} lang="en">
                  Coming soon
                </span>
              )}
            </button>
          ))}
        </div>
        <Callout tone="info" title="About translations">
          The Hindi and Marathi text on Home is a first draft awaiting review by native speakers.
        </Callout>
      </div>
    </Screen>
  );
}
