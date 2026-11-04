# Design Direction 02 · “Field Journal”

A second, independent design direction for the Kisani Urjaa farmer app. It has the same product, features, data, business rules and flows as Direction 01, with a different creative execution: editorial, photography-led and technologically crisp, where Direction 01 is warm, illustrated and nature-inspired.

- **Open it:** `npm run dev`, then `http://localhost:5173/#/d2`. On a desktop-sized window, a switch at the top left opens the same screen in the other direction. On a phone, use **Me → Switch to Direction 01** or **Account → Switch to Direction 02**.
- **Demo build:** `npm run build:demo2` (opens on Direction 02; both directions are included).

## What is shared, and what is not

| | Direction 01 | Direction 02 |
|---|---|---|
| Typeface | Plus Jakarta Sans Variable | **Same files, same loading** (`var(--font)`) |
| Corner radii | `--r-xs 8 · sm 12 · md 16 · lg 22 · xl 28 · 2xl 34 · pill` | **Same tokens, referenced directly** |
| Data, API, store, rules | `src/services`, `src/lib`, `src/data` | **Shared**, not forked |
| Colour | Cream, forest green, harvest orange | Midnight ink, electric cobalt, citrus lime on cool mist paper |
| Imagery | Procedural illustrated landscapes | Photo slots with art direction (see below) |
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

Raw palette: midnight `#0A1128`, ink `#141E45`, cobalt `#2448E0`, lime `#C8F135`, chartreuse `#DCFB72`, sky `#8EC5FF`, mist `#F3F5F9`, grey `#596276`. Light “paper” screens alternate with always-dark “night” spreads (weather, Kisani Didi, video band, tickets, receipts, the dock), so not every screen is dark. The theme setting adds a night edition.

Checked text pairs (WCAG 2.2 AA, 4.5:1 for text):

| Pair | Ratio |
|---|---|
| Ink text on mist | 17.0 |
| Secondary text on mist | 8.9 |
| Tertiary text on mist / white | 5.6 / 6.1 |
| Cobalt on white, white on cobalt | 6.8 |
| Midnight on lime, lime on midnight | 14.3 |
| Secondary night text on midnight | 9.0 |
| Success / warning / danger / info text on their tints | 4.7 / 6.3 / 5.6 / 6.3 |
| Dark theme: text, secondary, tertiary on surface | 17.4 / 9.5 / 6.3 |

Lime is never used for text on light paper. Every status pairs colour with a word and a shape.

## Photography

Real photographs could not be fetched: the build environment’s network policy blocks image hosts (Unsplash, Wikimedia Commons, Pexels, Pixabay, Flickr and Openverse all returned a gateway 403). No photos were invented or generated, and Direction 01’s illustrations are not used.

Instead, every image is a named **photo slot** (`src/d2/photo/catalog.ts`, 22 slots) with:

- a commissioning brief (subject, light, angle, place),
- alt text and a focal point for art-directed crops,
- a tonal “blur-up” field in the expected colours of the photo. This is shown until a photo exists, and as the loading placeholder after,
- a visible “Photo slot” label on large images and an editorial credit line under heroes, so nobody mistakes a slot for a photo.

**To add a licensed photo:** save it as `src/d2/photo/files/<slot-id>.jpg` (or .webp/.avif) and add its credit to `src/d2/photo/credits.ts`. It then appears everywhere the slot is used. **Me → About** lists all slots with their status (Photo needed, Credit missing, or the credit). Content items whose `scene.src` is set use that photo directly.

Sample videos (`public/media/fj/`) are rendered placeholders in the slot colours with a “Sample clip · footage to be supplied” slate (`scripts/make-d2-clips.py`).

## Navigation decision

The product’s information architecture has four daily destinations: **Today** (home), **Journal** (news, videos, guides, events), **Orders** (FOM and bookings) and **Me**. It also has one action, creating an order, booking or field. Direction 02 shows these as a solid dock fixed to the bottom edge: four always-labelled tabs and a separate lime **New** key at the right, where a right thumb rests. Events joined the Journal as its fourth section, with shared section tabs, so the publication reads as one place. Global search (`/d2/search`) covers stories, films, guides and events.

## Motion

- Page transitions: new pages rise from below over the current one, which recedes and dims; Back lowers them again. Tabs cross-fade.
- Headlines reveal word by word from masks. Large photos unmask from a clip and settle from 1.14× zoom. Heroes drift slowly and move with parallax.
- Section tabs slide an ink bar; toggles slide a thumb; trackers, segment bars and timelines draw in sequence.
- Lottie (`src/d2/lottie`): loader, success, sprout, search, crate, calendar, bell, offline, pin, bookmark, records and weather. All are monoline drawings that draw themselves on.
- Reduced motion (the phone setting or Display → Reduce animations) turns off drift, parallax and transforms, and Lottie shows its final frame.

## Screens

Every Direction 01 screen has a Direction 02 version: onboarding cover, sign-in (split screen), OTP, location, Today, Journal (News, Videos, Guides), story reader, video (cinema mode), bookmarks, search, events (date ribbon and timeline), event detail (poster, ticket, RSVP, collage and viewer), orders (status ledger and tickets), order detail (tracker and receipt), new order (stepper and live receipt), order placed, booking flow, booking detail, booking requested, season records, form cycle, step records, fields, field detail, add a field (with a success state), notifications (activity feed), Me, profile, language, display, password, machinery, help, contact, about with photo credits, legal, verify, prototype controls, design system and not found. Each data screen has loading, empty, error and offline states.

## Quality checks run

- `npx tsc --noEmit`, `npx vitest run` (27 tests, including Direction 02 path and photo-slot tests), `npm run build`, `npm run build:demo`, `npm run build:demo2`.
- Playwright end-to-end: order validation, live price, placing an order, booking steps and validation, status filters, the 90-day date cap, search with no results, bookmarks, mark all read with undo, event interest, adding a field, video playback, and the direction switch.
- All 37 Direction 02 routes and 6 Direction 01 routes at 360 px width, with and without reduced motion: no horizontal overflow, no page errors.
- Light and dark themes, desktop device frame and phone-width layout reviewed by screenshot.
