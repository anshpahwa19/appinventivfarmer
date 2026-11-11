# Design Direction 02 · “Field Journal”

A second, independent design direction for the Kisani Urjaa farmer app. It has the same product, features, data, business rules and flows as Direction 01, with a different creative execution: editorial and photography-led, on light, warm, sunlit paper, where Direction 01 is illustrated and nature-inspired.

- **Open it:** `npm run dev`, then `http://localhost:5173/#/d2`. On a desktop-sized window, a switch at the top left opens the same screen in the other direction. On a phone, use **Me → Switch to Direction 01** or **Account → Switch to Direction 02**.
- **Demo build:** `npm run build:demo2` (opens on Direction 02; both directions are included).

## What is shared, and what is not

| | Direction 01 | Direction 02 |
|---|---|---|
| Typeface | Plus Jakarta Sans Variable | **Same files, same loading** (`var(--font)`) |
| Corner radii | `--r-xs 8 · sm 12 · md 16 · lg 22 · xl 28 · 2xl 34 · pill` | **Same tokens, referenced directly** |
| Data, API, store, rules | `src/services`, `src/lib`, `src/data` | **Shared**, not forked |
| Colour | Cream, forest green, harvest orange | Warm ivory and sand, espresso ink, clay actions, pale apricot highlights |
| Imagery | Procedural illustrated landscapes | Full-bleed and documentary-style photography (AI concept images for now, see below) |
| Layout | Card grids, rounded tiles | Editorial: full-bleed covers, index lists, split panels, night bands, posters, receipts |
| Navigation | Floating glass pill with a centre “+” | Fixed edge dock: 4 labelled tabs + a lime “New” key anchored right |
| Page motion | iOS horizontal push | Pages rise like sheets and recede; tabs cross-fade |
| Lottie | `src/lottie` | `src/d2/lottie`, a new monoline kit and 12 new animations |

Direction 01 is unchanged apart from three wiring points: `src/app/App.tsx` chooses the direction from the URL, `src/app/DirectionSwitcher.tsx` provides the review switch, and one row in Account opens Direction 02.

## Structure

```
src/d2/
  D2App.tsx, routes.tsx   shell and routes (every Direction 01 route, under /d2, plus /d2/search)
  paths.ts, nav.ts        /d2 path mapping (shared data stores Direction 01 paths)
  styles/                 tokens.css and base.css, scoped to .fj
  frame/                  device frame, status bar, splash
  layout/                 Screen (contextual headers), Dock
  ui/                     buttons, controls, fields, sheet, toast, date range, blocks
  content/                editorial cards, video player, share, Journal section nav
  photo/                  photo slots: catalog, credits, drop-in files folder
  lottie/                 Lottie kit and animations
  motion/                 word-by-word reveals, cascades, in-view rises
  screens/                every screen
```

## Colour and contrast

Second edition, after review: the first palette (midnight, cobalt, citrus lime) was too bold for this audience, so Direction 02 now uses light, warm, quiet tones. Photographs carry the colour; the interface stays calm.

Raw palette: ivory `#FBF7F1` (pages), sand `#F3EADF` / `#EADFD1` (panels), white (cards), espresso `#3A2E28` (text), clay `#A8573A` (actions), deep clay `#94492C` (links and accent text), apricot `#F2C79B` (highlights, the New key, chips on photos), with muted sage, ochre, brick and slate-blue for status.

Checked text pairs (WCAG 2.2 AA, 4.5:1 for text):

| Pair | Ratio |
|---|---|
| Espresso text on ivory | 12.3 |
| Secondary text on ivory | 6.8 |
| Tertiary text on ivory / sand | 5.1 / 4.6 |
| White on clay (buttons) | 5.1 |
| Deep clay links on ivory / sand | 6.1 / 5.4 |
| Espresso on apricot | 8.4 |
| Success / warning / danger / info text on their tints | 5.3 / 5.4 / 5.2 / 5.5 |

Apricot is never used for text on light paper. Every status pairs colour with a word and a shape.

## Photography

Image hosts are still blocked by the build environment’s network policy. Agreed with the product owner, the 22 photo slots are filled with **AI-generated concept images** (Figma AI, gpt-image-2.5-flare) for the design review, to be replaced with licensed or commissioned photography before launch. They are labelled as AI concept images in the credit line under heroes, in Me → About (per slot) and in the review notes beside the device. They don’t show real people or places.

The shot list for replacing them, with where each image is used, is in [`photo-shot-list.md`](photo-shot-list.md). Each slot keeps its brief, alt text and focal point in `src/d2/photo/catalog.ts`. Drop a real photo into `src/d2/photo/files/` under the same name and update `src/d2/photo/credits.ts`.

Photography now runs through the whole app: heroes, covers, posters and rails, plus the Today index, order and booking tickets, notification thumbnails, the Me cover, search topics, season-step banners, success screens, location, help and contact.

Sample videos (`public/media/fj/`) are still rendered placeholders with a “Sample clip · footage to be supplied” slate (`scripts/make-d2-clips.py`).

## Navigation decision

The product’s information architecture has four daily destinations: **Today** (home), **Journal** (news, videos, guides, events), **Orders** (FOM and bookings) and **Me**. It also has one action, creating an order, booking or field. Direction 02 shows these as a solid dock fixed to the bottom edge: four always-labelled tabs and a separate lime **New** key at the right, where a right thumb rests. Events joined the Journal as its fourth section, with shared section tabs, so the publication reads as one place. Global search (`/d2/search`) covers stories, films, guides and events.

## Motion

- Page transitions: new pages rise from below over the current one, which recedes and dims; Back lowers them again. Tabs cross-fade.
- Headlines reveal word by word from masks. Large photos unmask from a clip and settle from 1.14× zoom. Heroes drift slowly and move with parallax.
- Section tabs slide an ink bar; toggles slide a thumb; trackers, segment bars and timelines draw in sequence.
- Lottie (`src/d2/lottie`): loader, success, sprout, search, crate, calendar, bell, offline, pin, bookmark, records and weather. All are monoline drawings in espresso and clay, with apricot highlights, that draw themselves on.
- Reduced motion (the phone setting or Display → Reduce animations) turns off drift, parallax and transforms, and Lottie shows its final frame.

## Screens

Every Direction 01 screen has a Direction 02 version: onboarding cover, sign-in (split screen), OTP, location, Today, Journal (News, Videos, Guides), story reader, video (cinema mode), bookmarks, search, events (date ribbon and timeline), event detail (poster, ticket, RSVP, collage and viewer), orders (status ledger and tickets), order detail (tracker and receipt), new order (stepper and live receipt), order placed, booking flow, booking detail, booking requested, season records, form cycle, step records, fields, field detail, add a field (with a success state), notifications (activity feed), Me, profile, language, display, password, machinery, help, contact, about with photo credits, legal, verify, prototype controls, design system and not found. Each data screen has loading, empty, error and offline states.

## Quality checks run

- `npx tsc --noEmit`, `npx vitest run` (27 tests, including Direction 02 path and photo-slot tests), `npm run build`, `npm run build:demo`, `npm run build:demo2`.
- Playwright end-to-end: order validation, live price, placing an order, booking steps and validation, status filters, the 90-day date cap, search with no results, bookmarks, mark all read with undo, event interest, adding a field, video playback, and the direction switch.
- All 37 Direction 02 routes and 6 Direction 01 routes at 360 px width, with and without reduced motion: no horizontal overflow, no page errors.
- Light theme (the app is light only), desktop device frame and phone-width layout reviewed by screenshot.
