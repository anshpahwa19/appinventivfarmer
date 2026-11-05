import { Check } from 'lucide-react';
import { actions, useStore, LANGUAGE_CATALOG, type Language } from '@/services/store';
import { Screen } from '@/components/layout/Screen';
import { Callout } from '@/components/ui/Blocks';
import s from './Account.module.css';

const LANGS = LANGUAGE_CATALOG.map((l) => ({ code: l.code as Language, name: l.english, native: l.native, ready: l.ready }));

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
        <Callout tone="info" title="Hindi and Marathi: Home screen first">
          The Home screen is available in Hindi and Marathi. Punjabi, Gujarati, Telugu and Odia are coming soon. Other screens stay in English while translations are prepared with farmers and Kisani Didis. The Hindi and Marathi text is a first draft awaiting review by native speakers.
        </Callout>
      </div>
    </Screen>
  );
}
