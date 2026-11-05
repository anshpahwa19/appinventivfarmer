import { useRef, type KeyboardEvent } from 'react';
import { actions, LANGUAGES, useStore, type Language } from '@/services/store';
import { HOME_STRINGS } from '@/i18n/home';
import s from './HomeShared.module.css';

/**
 * One-tap language switch for the Home header. Writes `prefs.language`, so the
 * Settings → Language screen stays in sync. A radio group with roving focus.
 */
export function LanguageSwitch({ tone = 'surface', className, label }: { tone?: 'glass' | 'surface'; className?: string; label: string }) {
  const current = useStore((st) => st.prefs.language);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const pick = (l: Language) => {
    if (l !== current) actions.setPrefs({ language: l });
  };

  const onKey = (e: KeyboardEvent, i: number) => {
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + LANGUAGES.length) % LANGUAGES.length;
    refs.current[next]?.focus();
    pick(LANGUAGES[next]);
  };

  return (
    <div role="radiogroup" aria-label={label} className={`${s.lang} ${tone === 'glass' ? s.langGlass : s.langSurface} ${className ?? ''}`}>
      {LANGUAGES.map((l, i) => {
        const on = l === current;
        return (
          <button
            key={l}
            ref={(el) => (refs.current[i] = el)}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={HOME_STRINGS[l].langName}
            tabIndex={on ? 0 : -1}
            lang={l}
            className={`${s.langOpt} ${on ? s.langOn : ''}`}
            onClick={() => pick(l)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {HOME_STRINGS[l].langShort}
          </button>
        );
      })}
    </div>
  );
}
