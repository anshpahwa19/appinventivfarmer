# Home redesign: both directions

The redesign changes only the Home screen of Direction 01 (`/#/home`) and Direction 02 (`/#/d2/home`). The two directions share the logic and keep their own look.

## What changed

| | Direction 01 · Illustrated | Direction 02 · Field Journal |
|---|---|---|
| Language | A header button showing the current language in its own script. It opens a 2-column picker for all 7 languages. | The same button above the dateline, opening the same picker in the journal's sheet |
| Weather | A glass card: temperature, condition, high and low, rain, humidity and wind chips, a 5-day strip and spray advice | The "instrument panel", plus a metrics row and a 5-day strip |
| Alerts | Cards with a severity bar, an icon chip and a word tag | A ruled dispatch list with an icon tile and a severity tag |
| Quick actions | 4 tiles: Field records, Order FOM, Bookings, Farm updates | The numbered index, rebuilt as the same 4 actions with photos |
| Kisani Didi | An "Ask Didi" mic pill, plus Call and Message | A split photo card, with "Ask Didi" in a full-width foot |

Removed to cut clutter. All of these are still one tap away in Learn, Orders or Events:
- The Learn and Events tiles.
- The videos and guides rails.
- The latest-order card.
- The extra news rows.

## Shared pieces

- `src/i18n/home.ts`
  - A typed dictionary for Home strings in `en`, `hi` and `mr`.
  - `useHomeT()` reads `prefs.language`.
  - Helpers for day words, crops, steps, conditions and alert copy, plus the voice keyword matching.
- `src/lib/alerts.ts`
  - `deriveAlerts()` uses only the forecast, fields, season records, bookings, orders and events.
  - All thresholds are in `THRESHOLDS`. Heavy rain uses the IMD 64.5 mm mark.
  - The humidity alert is a general advisory, never a pest or disease report.
  - Alerts based on the offline sample forecast are tagged "Sample forecast".
- `src/lib/voice.ts`
  - Web Speech API speech-to-text. The states are idle, listening, processing, done, unsupported, denied, and error (no speech, offline or other).
  - There is no voice or AI backend. The words are only offered as a WhatsApp message to Didi. You can also call Didi, or open a matching app screen.
- `src/components/home/`
  - `LanguageSwitch`, `VoicePanel`, `Alerts` and `useHomeData`.
  - These are styled through `--hm-*` tokens, which each Home defines in its own palette, in light and dark.
- `src/lib/weather.ts`
  - Adds `sprayKind()`.
  - Adds the optional daily `rainMm` and `windMaxKph` fields. These are requested from Open-Meteo, and the sample forecast includes them too.
- `prefs.language` now covers all 7 app languages: `en`, `hi`, `pa`, `gu`, `mr`, `te` and `or`. `normalizeLanguage()` keeps old saves safe.
- `LANGUAGE_CATALOG` in `store.ts` lists them, and all 7 can be chosen. Only Hindi and Marathi have Home strings so far. Punjabi, Gujarati, Telugu and Odia are saved as the choice, but Home keeps its English strings until theirs are added in `src/i18n/home.ts`. The `lang` attribute follows the text actually shown (`contentLang`). The picker marks the device language.
- The language control looks different in each direction. Direction 01 has a rounded glass pill and a 2-column card grid. Direction 02 has a squared journal tag with a kicker and a ruled index list.
- Settings → Language, in both directions, uses the same catalog and now selects the language. The Account row shows the current language.

## ⚠ Native-speaker review needed

Every Hindi and Marathi string in `src/i18n/home.ts` is a first draft. The voice keywords there are drafts too. A native speaker has not checked any of them yet. The app says so on Home, in the Ask Didi sheet and in Settings → Language. Screens other than Home stay in English. The verification dialog and the contact sheet also stay in English.
