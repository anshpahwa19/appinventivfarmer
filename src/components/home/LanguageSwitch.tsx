import { useRef, type KeyboardEvent } from 'react';
import { Check, ChevronDown, Languages } from 'lucide-react';
import { actions, deviceLanguage, LANGUAGE_CATALOG, useStore, type Language } from '@/services/store';
import type { HomeT } from '@/i18n/home';
import s from './HomeShared.module.css';

/**
 * Header button: shows the current language in its own script and opens the
 * picker. One tap to open, one tap to choose. Scales to any number of languages.
 */
export function LanguageButton({ t, tone = 'surface', onOpen, className }: { t: HomeT; tone?: 'glass' | 'surface'; onOpen: () => void; className?: string }) {
  const current = LANGUAGE_CATALOG.find((l) => l.code === t.lang)!;
  return (
    <button type="button" className={`${s.langBtn} ${tone === 'glass' ? s.langGlass : s.langSurface} ${className ?? ''}`} onClick={onOpen} aria-haspopup="dialog" aria-label={t.languagePicker.current(current.native)}>
      <Languages aria-hidden />
      <span lang={current.code}>{current.native}</span>
      <ChevronDown aria-hidden className={s.langChevron} />
    </button>
  );
}

/**
 * The picker body: a two-column grid of radio cards, each with the language
 * in its own script, its English name and a large script sign. Choosing a
 * ready language applies at once (writes prefs.language) and calls onDone.
 */
export function LanguagePicker({ t, onDone }: { t: HomeT; onDone: () => void }) {
  const current = useStore((st) => st.prefs.language);
  const device = deviceLanguage();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const ready = LANGUAGE_CATALOG.filter((l) => l.ready);

  const pick = (code: string) => {
    actions.setPrefs({ language: code as Language });
    setTimeout(onDone, 220);
  };

  const onKey = (e: KeyboardEvent, code: string) => {
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const i = ready.findIndex((l) => l.code === code);
    const next = ready[(i + dir + ready.length) % ready.length];
    refs.current[LANGUAGE_CATALOG.indexOf(next)]?.focus();
    actions.setPrefs({ language: next.code as Language });
  };

  return (
    <div className={s.picker}>
      <div className={s.pickGrid} role="radiogroup" aria-label={t.languagePicker.title}>
        {LANGUAGE_CATALOG.map((l, i) => {
          const on = l.code === current;
          return (
            <button
              key={l.code}
              ref={(el) => (refs.current[i] = el)}
              type="button"
              role="radio"
              aria-checked={on}
              aria-disabled={!l.ready || undefined}
              tabIndex={on ? 0 : -1}
              className={`${s.pickCard} ${on ? s.pickOn : ''} ${!l.ready ? s.pickSoon : ''}`}
              onClick={() => l.ready && pick(l.code)}
              onKeyDown={(e) => onKey(e, l.code)}
              data-autofocus={on || undefined}
            >
              {device === l.code && <span className={s.pickDevice}>{t.languagePicker.device}</span>}
              <span className={s.pickRadio} aria-hidden>
                {on && <Check strokeWidth={3} />}
              </span>
              <span className={s.pickText}>
                <span className={s.pickNative} lang={l.code}>
                  {l.native}
                </span>
                <span className={s.pickEnglish} lang="en">
                  {l.english}
                </span>
                {!l.ready && <span className={s.pickTag}>{t.languagePicker.soon}</span>}
              </span>
              <span className={s.pickMark} aria-hidden lang={l.code}>
                {l.mark}
              </span>
            </button>
          );
        })}
      </div>
      <p className={s.pickNote}>{t.languagePicker.soonNote}</p>
      {t.reviewNote && <p className={s.pickNote}>{t.reviewNote}</p>}
    </div>
  );
}
