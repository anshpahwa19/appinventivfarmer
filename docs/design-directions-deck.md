# Design directions deck

A 20-slide deck that presents Direction 01 · Illustrated and Direction 02 · Field Journal side by side. It is published as a private claude.ai artifact: https://claude.ai/artifact/EgzJWxqgCmDnebYgDbCibq

Its structure follows the reference deck in `docs/reference/Bloom_Visual_DNA_V3.html`. The deck uses only Kisani Urjaa branding, and the reference file is not part of it.

## What was taken from the reference

The reference is a 6-slide, 1920×1080 deck. Its 22 embedded `data:` images were stripped before it was read.

| Aspect | Reference pattern | Used here |
|---|---|---|
| Sequence | Principles → colour → type → shape → UI style → directions, then a closing "one decision" slide | Overview → shared → colour (per direction) → type → radius → imagery → navigation → components → motion → screens → states → light/dark → decision |
| Grid | Canvas 1920×1080, padding 64 / 96, logo at top left, 40px gap, then a text column (600–660px) beside a 72px gap and a content area. Card rows use 24px gaps | Same margins and gaps. Comparison slides place two 28px-radius panels side by side |
| Kicker | `01` (28 / 700, accent, 3px tracking), a 44×2 rule, then an uppercase label (24 / 500, 6px tracking) | Same, numbered 01–19 |
| Type scale | 88 headline in two weights (700, then 300; −2.5px), 46 card titles, 32 / 26 subheads, 24–30 body | Same scale, in Plus Jakarta Sans |
| Colour | One dark ground, cards one step lighter with a 1px border, accent used only for kickers and tags | A warm charcoal ground for shared slides. Direction slides use that direction's own palette: cream and forest for 01, ivory and clay for 02 |
| Imagery | Screens and photos inside 16–28px rounded frames. Skeleton diagrams are contained on a contrasting panel | Real phone captures with 24–40px radius, and crops from each design-system screen |
| Navigation | Vertical scroll-snap, arrows, PageUp/PageDown, Home/End, space, `#hash` per slide, pager | Provided by the Slides runtime: keyboard, progress and counter, and `#slide-N` links |

## Screenshots

`scripts/deck/capture.cjs` captures every screen with the pre-installed Playwright, at 393×852 and deviceScaleFactor 2. Before each load it seeds `kisani-urjaa:state`, which sets the session, `prefs.theme` and `demo.network` / `demo.emptyData` for the loading, empty and offline states.

```
npx vite --port 5173
node scripts/deck/capture.cjs <out-dir>          # all shots, both directions
ONLY=splash,home node scripts/deck/capture.cjs <out-dir>
```

The Direction 02 photographs are AI concept images. The deck labels them as such wherever they appear.
