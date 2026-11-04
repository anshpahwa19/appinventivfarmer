import { Check } from 'lucide-react';
import { Screen, PageTitle } from '../../layout/Screen';
import { Note } from '../../ui/Blocks';
import s from './Account.module.css';

const LANGS = [
  { code: 'en', name: 'English', native: 'English', ready: true },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', ready: false },
  { code: 'mr', name: 'Marathi', native: 'मराठी', ready: false },
];

export default function Language() {
  return (
    <Screen title="Language" backTo="/account">
      <PageTitle kicker="Preferences" title="Language" />
      <div className={s.sub}>
        <div className="fj-stack" role="radiogroup" aria-label="App language" style={{ ['--gap' as string]: '10px' }}>
          {LANGS.map((l) => (
            <button key={l.code} type="button" role="radio" aria-checked={l.code === 'en'} className={s.option} disabled={!l.ready} lang={l.code}>
              <span className={s.optionText}>
                <span className={s.optionTitle}>{l.native}</span>
                <span className={s.optionSub} lang="en">
                  {l.name}
                </span>
              </span>
              {l.ready ? (
                <span className={s.radio} aria-hidden>
                  <Check strokeWidth={3} />
                </span>
              ) : (
                <span className={s.soon} lang="en">
                  Coming soon
                </span>
              )}
            </button>
          ))}
        </div>
        <Note tone="info" title="Hindi and Marathi are on the way">
          Translations are being prepared with farmers and Kisani Didis. Until then the app stays in English.
        </Note>
      </div>
    </Screen>
  );
}
