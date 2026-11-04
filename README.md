# Kisani Urjaa farmer app, redesigned

A working, mobile-first rebuild of the Kisani Urjaa farmer app: React 18, TypeScript and Vite. Every feature from the 80 original design frames is kept. Missing screens and states (OTP, bookings list, add land, profile, help, loading, empty, offline and error) were added.

- **Audit of the original designs:** [`docs/audit.md`](docs/audit.md)
- **Living design system:** in the app at Account → Design system (`#/design-system`)

## Run it

```bash
npm install
npm run dev        # http://localhost:5173 (phone-sized frame on desktop)
```

| Script | What it does |
|---|---|
| `npm run build` | Type-check, then production build to `dist/` (hash routing, static hosting) |
| `npm run build:demo` | Self-contained build to `dist-demo/` with in-memory routing, for embedding in hosts that don't allow URL routing |
| `npm run typecheck` | TypeScript only |
| `npm test` | Unit tests for pricing, validation, formatting, weather advice, filtering, season-record totals |

**Demo tips:** the OTP is `123456`. Account → Prototype controls switches verified/unverified, normal/slow/offline network and empty states, and resets data. Everything you create is stored on your device only.

## What's inside

| Module | Screens |
|---|---|
| Brand | Client logo on a splash screen (tap to skip; shorter with reduced motion), welcome, sign-in, About, app icons and favicon |
| Onboarding | Welcome carousel, phone sign-up and log-in, OTP, continue without verifying, location permission |
| Home | Weather card with a spray advisory, quick actions with live counts, Kisani Didi contact, next event, fields, news, videos, guides |
| Learn | News / Videos / Articles in one hub: search, categories, date filter (90-day cap), bookmarks, sharing, reading progress, custom video player |
| Events | Upcoming / past, date strip, live status, interest, map link, photo viewer |
| Orders | FOM orders and bookings with status filters; order creation with live price and review; three-step booking flow; success screens |
| My forms | Season cycles, 8-step timeline, step records with the calculation shown for each total |
| Fields | List, detail, active toggle, add/edit crops, add-a-field flow |
| Notifications | Grouped by day, unread markers, categories, mark all read with undo |
| Account | Profile, language, display (large text, dark mode, reduce animations), password, farm machinery, help, contact, legal, verification |

## Architecture

```
src/
  app/             router, page transitions, app frame, shared sheets (create, verify gate, contact)
  components/ui/   design-system components (Button, fields, Sheet, Toast, badges, lists, timeline…)
  components/      layout (Screen, TabBar), media (Scene, Lottie, VideoPlayer), content cards
  features/        one folder per module
  services/        api.ts (the only backend seam), store.ts (persisted state), query.ts (cache)
  data/            sample data, dated relative to today
  lib/             formatting, pricing, validation, weather, dates
  scenes/          procedural landscape illustrations
  lottie/          Lottie animations authored in code
  styles/          tokens.css (light + dark), base.css
```

- **Connecting a real backend:** replace the functions in `src/services/api.ts`; screens only call `api.*`. Writes made in the prototype are marked `origin: 'device'`, and the UI says they were not sent.
- **Weather:** live from Open-Meteo, with a clearly labelled sample forecast when offline or blocked.
- **Imagery:** image hosts were unreachable from the build environment, so `src/scenes` draws Indian farmland scenes in SVG. Set `scene.src` on any item to use a licensed photo instead.
- **Sample videos:** `public/media/*.mp4` are short clips rendered from the scenes (labelled "Sample clip" in the player).

## Assumptions to confirm

FOM = fermented organic manure at ₹100/kg + ₹100 shipping (from the designs). Bookings are field-service requests that need approval. Machinery details describe machines the farmer owns. Kisani Didis fill the season forms. Hindi and Marathi are shown as "coming soon". Details: [`docs/audit.md`](docs/audit.md).

## Credits

Plus Jakarta Sans (SIL OFL), Lucide icons (ISC), lottie-web (MIT), Framer Motion (MIT), React Router (MIT).
