import { useRef, type KeyboardEvent } from 'react';
import { Check, ChevronDown, Languages } from 'lucide-react';
import { actions, deviceLanguage, LANGUAGE_CATALOG, useStore, type Language } from '@/services/store';
import type { HomeT } from '@/i18n/home';
import s from './HomeShared.module.css';

/**
 * Header control: shows the current language in its own script and opens the
 * picker. One tap to open, one tap to choose.
 * - `pill` (Direction 01): rounded glass pill with a language icon.
 * - `journal` (Direction 02): a squared glass tag with a small kicker, in the journal's editorial voice.
 */
export function LanguageButton({ t, variant, onOpen, className }: { t: HomeT; variant: 'pill' | 'journal'; onOpen: () => void; className?: string }) {
  const current = LANGUAGE_CATALOG.find((l) => l.code === t.lang) ?? LANGUAGE_CATALOG[0];
  const label = t.languagePicker.current(current.native);
  if (variant === 'journal')
    return (
      <button type="button" className={`${s.langTag} ${className ?? ''}`} onClick={onOpen} aria-haspopup="dialog" aria-label={label}>
        <span className={s.langTagText}>
          <span className={s.langTagKicker}>{t.language}</span>
          <span className={s.langTagName} lang={current.code}>
            {current.native}
          </span>
        </span>
        <ChevronDown aria-hidden />
      </button>
    );
  return (
    <button type="button" className={`${s.langBtn} ${className ?? ''}`} onClick={onOpen} aria-haspopup="dialog" aria-label={label}>
      <Languages aria-hidden />
      <span className={s.langBtnName} lang={current.code}>
        {current.native}
      </span>
      <ChevronDown aria-hidden className={s.langChevron} />
    </button>
  );
}

/**
 * The picker body. Choosing a language applies at once (writes
 * prefs.language) and then calls onDone.
 * - `cards` (Direction 01): two-column grid of radio cards with a large script sign.
 * - `index` (Direction 02): a ruled index list, the script sign set like a journal numeral.
 */
export function LanguagePicker({ t, variant, onDone }: { t: HomeT; variant: 'cards' | 'index'; onDone: () => void }) {
  const current = useStore((st) => st.prefs.language);
  const device = deviceLanguage();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const pick = (code: Language) => {
    actions.setPrefs({ language: code });
    setTimeout(onDone, 220);
  };

  const onKey = (e: KeyboardEvent, i: number) => {
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + LANGUAGE_CATALOG.length) % LANGUAGE_CATALOG.length;
    refs.current[next]?.focus();
    actions.setPrefs({ language: LANGUAGE_CATALOG[next].code });
  };

  const index = variant === 'index';

  return (
    <div className={s.picker}>
      <div className={index ? s.pickList : s.pickGrid} role="radiogroup" aria-label={t.languagePicker.title}>
        {LANGUAGE_CATALOG.map((l, i) => {
          const on = l.code === current;
          const isDevice = device === l.code;
          const common = {
            ref: (el: HTMLButtonElement | null) => (refs.current[i] = el),
            type: 'button' as const,
            role: 'radio',
            'aria-checked': on,
            tabIndex: on ? 0 : -1,
            onClick: () => pick(l.code),
            onKeyDown: (e: KeyboardEvent) => onKey(e, i),
            'data-autofocus': on || undefined,
          };
          if (index)
            return (
              <button key={l.code} {...common} className={`${s.pickRow} ${on ? s.pickRowOn : ''}`}>
                <span className={s.pickRowMark} aria-hidden lang={l.code}>
                  {l.mark}
                </span>
                <span className={s.pickRowText}>
                  <span className={s.pickRowKicker} lang="en">
                    {l.english}
                    {isDevice && <span className={s.pickRowDevice}> · {t.languagePicker.device}</span>}
                  </span>
                  <span className={s.pickRowNative} lang={l.code}>
                    {l.native}
                  </span>
                </span>
                <span className={s.pickRowCheck} aria-hidden>
                  {on && <Check strokeWidth={3} />}
                </span>
              </button>
            );
          return (
            <button key={l.code} {...common} className={`${s.pickCard} ${on ? s.pickOn : ''}`}>
              {isDevice && <span className={s.pickDevice}>{t.languagePicker.device}</span>}
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
              </span>
              <span className={s.pickMark} aria-hidden lang={l.code}>
                {l.mark}
              </span>
            </button>
          );
        })}
      </div>
      {t.reviewNote && <p className={s.pickNote}>{t.reviewNote}</p>}
    </div>
  );
}
