import { Check } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { Callout } from '@/components/ui/Blocks';
import s from './Account.module.css';

const LANGS = [
  { code: 'en', name: 'English', native: 'English', ready: true },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', ready: false },
  { code: 'mr', name: 'Marathi', native: 'मराठी', ready: false },
];

export default function Language() {
  return (
    <Screen title="Language" back backTo="/account">
      <div className={s.page}>
        <div className="stack" role="radiogroup" aria-label="App language" style={{ ['--gap' as string]: '10px' }}>
          {LANGS.map((l) => (
            <button key={l.code} type="button" role="radio" aria-checked={l.code === 'en'} className={s.option} disabled={!l.ready} lang={l.code}>
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
                  {l.code === 'en' && <Check strokeWidth={3} />}
                </span>
              ) : (
                <span className={s.soon} lang="en">
                  Coming soon
                </span>
              )}
            </button>
          ))}
        </div>
        <Callout tone="info" title="Hindi and Marathi are on the way">
          Translations are being prepared with farmers and Kisani Didis. Until then the app stays in English.
        </Callout>
      </div>
    </Screen>
  );
}
