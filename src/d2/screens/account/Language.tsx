import { Check } from 'lucide-react';
import { actions, useStore, LANGUAGE_CATALOG, type Language } from '@/services/store';
import { Screen, PageTitle } from '../../layout/Screen';
import { Note } from '../../ui/Blocks';
import s from './Account.module.css';

const LANGS = LANGUAGE_CATALOG.map((l) => ({ code: l.code as Language, name: l.english, native: l.native, ready: l.ready }));

export default function LanguageScreen() {
  const current = useStore((st) => st.prefs.language);
  return (
    <Screen title="Language" backTo="/account">
      <PageTitle kicker="Preferences" title="Language" />
      <div className={s.sub}>
        <div className="fj-stack" role="radiogroup" aria-label="App language" style={{ ['--gap' as string]: '10px' }}>
          {LANGS.map((l) => (
            <button key={l.code} type="button" role="radio" aria-checked={l.code === current} className={s.option} disabled={!l.ready} lang={l.code} onClick={() => actions.setPrefs({ language: l.code })}>
              <span className={s.optionText}>
                <span className={s.optionTitle}>{l.native}</span>
                <span className={s.optionSub} lang="en">
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
        <Note tone="info" title="Hindi and Marathi: Home screen first">
          The Home screen is available in Hindi and Marathi. Punjabi, Gujarati, Telugu and Odia are coming soon. Other screens stay in English while translations are prepared with farmers and Kisani Didis. The Hindi and Marathi text is a first draft awaiting review by native speakers.
        </Note>
      </div>
    </Screen>
  );
}
