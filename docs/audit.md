# Phase 1: Product audit

**Source:** `Farmers.zip`, 80 exported design frames (393 pt wide, iPhone 15 size). When this redesign started the repository was empty, with no code, routes or API clients. So the frames are the functional specification, and this audit is what the redesign works to preserve.

## 1. Screen inventory

| Module | Original frames | States covered |
|---|---|---|
| Onboarding / auth | `OB-01`, `OB-01-1`, `If User Clicks On Skip Verification`, `location confirmation` | Empty and filled phone field, Send OTP, Skip verification (pending-verification dialog), location permission dialog, Login link, T&C / Privacy links |
| Home | `Homepage`, `-1 … -6`, `Without News`, `Without News, Articles`, `Without Videos` | Weather (AccuWeather), Kisani Didi contact, registered lands, events banner, latest news/videos/articles carousels, sections hidden when empty, "+" menu (Add land / booking / FOM order), unverified (2 tabs) and verified (4 tabs) navigation |
| News / Articles / Videos | `All News(-1)`, `Articles(-1)`, `Latest Videos`, `News Details Page (Default)`, `News Video Details page(-1)`, `All Articles Details Page`, `Video Details Page(-1)`, `Potrait video iteration`, `Share` | Search, date filter, list rows, detail with image carousel, summary box, source link, related items, inline and fullscreen landscape video, share sheet (X, Facebook, Reddit, WhatsApp, copy link), placeholder when no image |
| Bookmarks | `News`, `News __ empty`, `Videos(-1)`, `Articles(-1)` | Tabs News / Videos / Articles, search, empty state per tab |
| Filters / calendar | `Filter`, `Filter-1/-2`, `Filter __ First/Both Filled`, `Native Calender __ …`, `if user presses any other date __ error`, `Filters Applied` | From/To date sheet, calendar, **90-day maximum range** error, no-results after filtering with "Clear filter" |
| Events | `All Events(-1/-2)`, `Event Details`, `… If Interested`, `… Not Interested`, `… Past Events(-1)` | Upcoming / Other tabs, Upcoming / Live / Completed status, location with "Open in Map", Interested / Not interested, interest closed for past events, event media gallery with 2/5 viewer |
| My Orders (FOM) | `My Orders`, `My Orders __ Filters(-1)`, `Oder Detail(-1/-2)`, `Add New Order(-1/-2)`, `Select Unit` | Status Pending approval / Approved / Rejected, filter by date and status, order detail (dispatch date, rejection reason, price breakdown, delivery instructions, admin note, Kisani Didi support), create order (quantity, unit KG/MT, auto price, 0/500 notes, shipping ₹100) |
| Bookings | `Add New Booking(-1)`, `Farm Machinery-v2 - Add Machinery Details` | "Verification required" gate for unverified users, machinery details form (tractor, slasher, raker, baler, trolleys, harvester, tube-well pumps, others) |
| My Forms | `My Forms __ With Item(-1/-2/-3)`, `Form Details`, `Land Preparation`, `Sowing & Transplantation`, `Intercultivation(-1)` | Form cycle progress (3/8), status filter, land + crop details, 8-step timeline with "last updated by" Kisani Didi, read-only step data (form, labour and machinery sections), multiple entries per step |
| Lands | `Land Details` | Field summary, active toggle, address, crops with edit |
| Notifications | `Notifications List`, `Notifications Empty`, `Mark all as read(-1)` | Booking requested / requested by farm manager / approved / rejected, empty, mark-all sheet |
| Account | `v2 profile`, `v2 profile-1` | Unverified profile and verified account (Change password, Notifications, My Forms), language, bookmarks, about / privacy / terms / FAQs, contact, logout |

## 2. User journeys preserved

1. **Sign up:** phone → OTP (verified) *or* skip (pending verification) → location permission → Home.
2. **Learn:** Home or Learn → list → search / filter → detail → bookmark / share → related content.
3. **Events:** Home → events → detail → mark interest → open map. Past events show media.
4. **Order FOM (verified):** "+" or Orders → quantity and unit → review price → place → track status → detail.
5. **Book (verified):** "+" or Orders › Bookings → field, crop, area, date and time → request → approval and operator assignment.
6. **Season records:** Account or Home → My forms → cycle → step → read-only records filled by the Kisani Didi.
7. **Lands:** Home → field → details → toggle active → add or edit crops. "+" → add land.
8. **Notifications:** bell → grouped list → open the related order, booking, event or form → mark all read.
9. **Unverified gating:** any order or booking action explains why it is locked and how to get verified.

## 3. Usability problems in the original (and the fix)

| # | Problem | Heuristic | Redesign response |
|---|---|---|---|
| 1 | Orange is used for everything (CTAs, tabs, links, chips, statuses), so nothing stands out | Aesthetic & minimalist design | Green-led palette. Orange is reserved for the create action and live or attention states. |
| 2 | Status shown by colour only (tiny pastel chips) | Accessibility | Every status pairs an icon with a word, and statuses use a consistent semantic set |
| 3 | Price inconsistency: list says ₹1500, detail total ₹1600 | Consistency | One calculation (`lib/pricing.ts`) feeds the list, detail and create screens |
| 4 | Five date formats (`15-09-2025 at 2:00 PM`, `20 Nov, 2025`, `07/03/2026`, `12 Aug 2025`, `DD/MM/YY`) | Consistency | All dates come from one formatter (`lib/format.ts`) using en-IN conventions |
| 5 | Calendar error appears only after a wrong tap ("can't select more than 90 days") | Error prevention | Dates beyond 90 days are disabled with an inline hint, plus quick presets |
| 6 | "Mark all as read" is a bottom sheet with a checkbox and Apply | Efficiency | A single header action with an Undo toast |
| 7 | Internal UUID shown to farmers (`id 016fd89d…`) | Match with real world | Removed |
| 8 | Wrong field semantics: Crop Type = "Kharif", Variety = "Cereals and Millets"; Baler *model* uses a date picker; tube-well *capacity* says "Enter Size" | Match with real world | Crop, variety and season fields corrected. Baler model is text. Pump capacity is in HP. |
| 9 | Totals don't add up (Intercultivation total) and no calculation is explained | Visibility / trust | Totals are computed and show their formula ("10 labourers × ₹150/hr × 7 h × 5 days") |
| 10 | Unverified users lose nav tabs without explanation | Visibility of system status | Tabs stay. Locked actions explain the reason and offer *Verify with OTP* or *Call Kisani Didi*. |
| 11 | Small grey captions (~10 px) and low-contrast chips | Accessibility | Min 13 px text, WCAG AA contrast on all tokens, *Large text* setting |
| 12 | Typos: "Party Cloudy", "20-0-3-2026", "1 hours ago", duplicated address | Credibility | Fixed through formatters and corrected copy |
| 13 | No OTP, login, My Bookings, Add Land, profile, language or help screens. No loading, error or offline states. | Completeness | All designed and implemented (see §4) |
| 14 | Content-heavy home: six identical carousels | Recognition / hierarchy | Modular dashboard: weather hero, contextual quick actions with live counts, mixed card sizes |

## 4. Screens added because the original flow needed them

OTP verification · Log in mode · My Bookings list, booking detail and new-booking flow · Add land · Lands list · Crop add/edit · My profile edit · Change language · Display settings (text size, theme, motion) · Change password · Farm machinery · Help & FAQs · Contact · About / Privacy / Terms · Weather details · Order and booking success · Loading skeletons, offline and error states for every data screen · Prototype controls for demoing states.

## 5. Information architecture

**Original:** Home · Bookings · (+) · My Orders · Account. News, videos, articles, events and forms are reachable only from Home sections or Account.

**Redesign:** a floating bottom bar with **Home · Learn · (+ Create) · Orders · Account**.

- **Learn** gathers News, Videos and Articles (one segmented control, shared search, categories and date filter). Before, this content was only reachable from Home carousels.
- **Orders** holds *FOM orders* and *Bookings* as two segments, so both transactional flows live together and the bar keeps one-hand reach.
- **(+ Create)** keeps the original quick-create menu: New FOM order, New booking, Add land.
- Events, My forms and Lands get quick-action tiles with live context on Home ("3 of 8 steps", "Next: Thu 6 Nov"), so they are one tap away.

## 6. Assumptions (flag to the product owner)

- **FOM** = *Fermented Organic Manure*. Price ₹100/kg and shipping ₹100 are kept from the designs (`lib/pricing.ts`).
- **Bookings** are field-service requests (field, crop, area, date, time) that need team approval and get an operator assigned. This is inferred from the notification copy.
- **Machinery details** is the farmer's own machinery inventory, so it lives under Account → Farm machinery.
- **Form cycles** are filled by the Kisani Didi. Farmers view them, and pending steps say who will fill them.
- Language options other than English are shown as "coming soon" until translations exist.

## 7. Build-environment constraints

The build environment could not reach image or animation hosts (Unsplash, Wikimedia, Pexels, LottieFiles) or the weather API. So:

- **Imagery:** an original procedural landscape system (`src/scenes`) draws Indian field scenes (paddy, wheat, mustard, cotton, harvest with straw bales, village, workshop, canal, monsoon). Every image slot accepts a real photo `src`, so licensed photography can be swapped in without layout changes.
- **Lottie:** animations are authored in code (`src/lottie`) in the brand palette, so they never depend on a network fetch.
- **Weather:** the app calls Open-Meteo at runtime and falls back to a clearly labelled sample forecast when offline or blocked.
