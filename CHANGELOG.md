# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Calendar widget: a month view with today highlighted in the accent color,
  previous/next navigation (snaps back to today after a minute), Monday or
  Sunday week start, optional ISO week numbers.
- Clock styles: _Bold_, _Stacked_ (hours over minutes) and _Condensed_,
  plus an optional date line; the analog dial now has numerals and a ticking
  accent second hand.
- World Clock styles: _List_, _Tiles_ (darker at night), _Analog_ dials
  (white by day, black by night) and a dotted world _Map_ with live
  day/night shading; cities are now selectable from a curated list, with
  relative day and offset ("Tomorrow, +7h").
- Appearance settings: dark/light cards, glass/solid material and seven
  accent colors, applied uniformly to every widget and panel; per-widget
  _Transparent_ frame.
- Floating dock replacing the scattered buttons; controls and cursor fade
  out after a few idle seconds (can be turned off).
- Layout export/import (JSON, validated) and reset to default.
- _Waves_ image background, used by default on first run, plus new
  _Dune_ and _Mist_ presets.
- Live weather from Open-Meteo (geocoded city or device location), with
  today's high/low, day/night icons, 15-minute refresh and an offline
  fallback to the last reading.
- Responsive grid with phone (2 columns), tablet (4) and desktop (6)
  breakpoints, each with its own maximum size, spacing and — once
  rearranged — its own saved arrangement; "Re-flow" rebuilds it from
  desktop.
- Drag & resize on touch screens via a grip handle (swiping the card still
  scrolls) and auto-scroll near the edges. Moving a widget pushes down only
  the widgets it covers (in the phone/tablet stack the others also close
  up, so dragging lower swaps); on desktop, resizing stops at the nearest
  neighbour instead of being refused or rearranging other widgets.
- In edit mode the grid leaves room for the dock, so bottom-row resize
  handles are reachable.
- 12-column grid (8 / 4 columns on tablet / phone) with half-block steps:
  every size doubled, 2×2 is the smallest widget, but widgets can move and
  resize by one unit (e.g. sit exactly centered). Saved layouts and v0.1
  exports are converted automatically; exports now include a format
  `version`.
- Edit-mode grid shown as a single overlay with crosses at block
  intersections and dots at half steps, in the theme's text color.
- Unit tests (Vitest) for calendar, time-zone, sun, grid, responsive and
  weather logic.

### Changed

- New design system: self-hosted Inter / Outfit / Oswald variable fonts
  (Inter was referenced but never loaded before), semantic tone-aware color
  tokens, card surfaces for every widget, restyled date, weather and
  checklist widgets, redesigned editor chrome and settings panels.
- Redesigned default layout.
- The app now runs client-side only (`ssr: false`), removing the
  `ClientOnly` wrappers and hydration mismatches.
- One shared, second-aligned clock ticker instead of one timer per widget.
- Pure helpers moved to `lib/` (`grid/placement.ts`, `grid/layout.ts`,
  `time/*`).

### Fixed

- Persisted state was stored in cookies (the plugin default), which broke
  past ~4 KB (e.g. a long checklist) and was sent with every request; it
  now uses `localStorage`, migrating existing cookie data once.
- The background resolver ran once per component using it, so gallery
  rotation timers and IndexedDB reads were duplicated; it is now split into
  a single source (`useBackgroundSource`) and stateless actions.
- Analog clock hands didn't animate (SVG line coordinates aren't
  transitionable) and would spin backwards at the top of the minute.
- The default layout array was shared and mutated in place.

## [0.1.0] - 2026-08-05

Initial MVP release: Wake Lock, a pluggable widget registry, five widgets
(clock, date, world clock, weather, checklist), a background system, a full
grid editor, and PWA installability.

### Added

- Project scaffolding with Nuxt 4.4, TypeScript, Tailwind CSS 4.3, Pinia
  (with `pinia-plugin-persistedstate`) and `@vite-pwa/nuxt`.
- ESLint (`@nuxt/eslint`) and Prettier configuration.
- Base project folder structure (`composables`, `components/widgets`,
  `components/grid`, `components/background`, `stores`, `lib/widgets`).
- Warm/neutral design tokens defined via Tailwind 4 `@theme`.
- Open source project files: `README.md`, `CONTRIBUTING.md`, `LICENSE` (MIT).
- Widget registry (`lib/widgets`) with typed widget definitions and a
  `useWidgetRegistry` composable for registering/looking up widgets.
- `useWakeLock` composable: requests the native Screen Wake Lock API,
  falls back to an invisible looping canvas-stream video when unsupported,
  and re-acquires the lock when the tab becomes visible again.
- Base `WidgetGrid` component rendering the persisted layout (Pinia
  `layout` store) as a CSS grid, with a dashed placeholder box for any
  layout item whose widget isn't registered yet.
- Clock widget (`app/components/widgets/Clock`) with three styles —
  minimal, flip and analog — registered via `app/plugins/widgets.ts` with
  a settings schema (`variant`, `hour12`, `showSeconds`). Sizes itself via
  CSS container queries (`[container-type:size]` + `cqw`/`cqh` units) so
  it adapts from a small grid cell up to fullscreen.
- `useNow` composable: a reactive `Date` updated on an interval, shared by
  all clock styles.
- Background system (`app/components/background`, `app/stores/background.ts`,
  `app/composables/useBackground.ts`): four modes — curated CSS presets
  (dark minimal, warm gradient, soft fade), a single image, a rotating
  gallery (configurable interval), and a looping muted video — plus an
  optional dim/blur/bottom-gradient overlay for widget legibility.
  Binary assets (images/video) are stored as Blobs in IndexedDB
  (`lib/storage/idb.ts`); only ids and settings are persisted via
  `pinia-plugin-persistedstate`. A minimal `BackgroundSettings` panel
  (gear icon, bottom-left) covers mode switching, uploads, gallery
  management (`GalleryPicker`) and the overlay controls.
- Date widget: "Today", localized weekday/date, and ISO week number.
- World Clock widget: current time for a configurable list of cities
  (defaults to New York, London, Tokyo, Sydney).
- Weather widget: mock data behind a `WeatherProvider` interface
  (`lib/weather`) so a real provider (e.g. Open-Meteo) can be swapped in
  later without touching the widget; simple inline SVG condition icons,
  Celsius/Fahrenheit unit setting.
- Checklist widget: add/toggle/remove todo items. No dedicated store —
  items are persisted as part of the widget's own layout `config` via a
  new generic `update:config` event that any widget can emit, handled
  once in `WidgetGrid`.
- Layout seed now showcases all seven registered widgets at once (3
  clock styles, date, world clock, weather, checklist) across the grid.
- Grid editor mode (`EditModeToggle`, `GridItemChrome`, `WidgetPicker`,
  `WidgetSettingsPanel`, `stores/editor.ts`): a top-right "Edit" toggle
  reveals per-widget chrome (drag anywhere on the item, resize via the
  bottom-right handle, both snapped to grid cells and reverted on drop if
  they'd collide with another widget) plus fullscreen/settings/remove
  actions. A floating "+" button opens a picker listing every registered
  widget, placed automatically in the first free slot
  (`useGridPlacement`'s `findFreeSlot`/`hasCollision`). The settings
  button opens a generic drawer rendered from the widget's
  `settingsSchema` (select/boolean/number/string fields), writing back
  through the existing `update:config` mechanism. Any widget can be
  expanded to fill the whole grid (its own fullscreen/expand icon while
  editing, or a double-click in normal mode); Escape backs out of
  fullscreen, then settings, then edit mode in turn.
- Design tokens tightened for a more contemporary look: the `@theme`
  radius scale went from a pillowy `0.5rem`–`3rem` down to a crisp
  `0.25rem`–`1.25rem`, and the shadow tokens are more defined (higher
  opacity, tighter blur). Both cascade through every `rounded-*` /
  `shadow-*` utility already in use, so the whole app picked up the
  change from one edit.
- PWA icon set: a source mark (`public/logo.svg`, a circle bisected by
  a line — echoing "meridian") feeds `@vite-pwa/assets-generator`
  (`pwaAssets` in `nuxt.config.ts`) to generate the favicon,
  apple-touch-icon, 192/512 and maskable icons at build time. The
  manifest's `theme_color`/`background_color` now match the app's
  actual `surface-950` token instead of a placeholder.

### Fixed

- Component auto-import: components nested under `components/<folder>/`
  were being registered with a folder-name prefix (e.g. `GridWidgetGrid`
  instead of `WidgetGrid`), so `<WidgetGrid />` failed to resolve. Set
  `pathPrefix: false` in `nuxt.config.ts`.
- `useWakeLock` kept showing a stale native-lock error message even after
  the fallback engaged successfully; the error is now cleared once the
  fallback starts.
- Live-clock text is now rendered inside `<ClientOnly>` to avoid an SSR
  hydration mismatch (the server- and client-rendered timestamps could
  land a second apart).
- `registerWidget` no longer warns on redundant re-registration of the
  exact same component (e.g. from Nuxt's dev-time SSR warmup) — only when
  an id is reused by a genuinely different component.
- `GalleryPicker`'s thumbnail loader used a non-deep `watch` on the gallery
  ids array, so pushing a new id (same array reference) never re-triggered
  it — new thumbnails silently never loaded. Added `deep: true`.
- `useBackground`'s reactive setup (gallery rotation timer, IndexedDB
  asset lookups) ran unguarded during SSR, throwing (`setInterval` is
  disallowed server-side, and `indexedDB` doesn't exist there). Guarded
  with `import.meta.server`.
- Nuxt's component auto-import scanned plain `.ts` helper files inside
  `components/widgets/**` (e.g. multiple `types.ts`) as components,
  producing name-collision warnings. Restricted the components scan to
  `.vue` files only (`extensions: ['vue']`).
- Weather widget rendered a mis-encoded degree sign ("11B°C" instead of
  "11°C") due to a bad UTF-8 byte in the source; fixed.
- `WidgetSettingsPanel` read `widget.settingsSchema` directly off the
  live `selectedItemId`-derived computed, which turns `undefined` the
  instant the drawer starts closing — while its leave transition was
  still animating, Vue re-rendered against `undefined` and threw. Now
  keeps the last non-null widget in a separate ref that only updates
  forward, so the drawer's content stays intact through the close
  animation.
- `GridItemChrome`'s name label and action buttons were both absolutely
  positioned from opposite corners with no shared width awareness, so
  they overlapped/garbled on narrow grid cells (e.g. mobile). Combined
  them into one flex row with a truncating label.
- The generated PWA icon/manifest `<link>` tags never reached the page
  `<head>` because nothing rendered `@vite-pwa/nuxt`'s `NuxtPwaAssets`
  component; added it to `app.vue`.

### Changed

- Disabled the PWA service worker in dev (`pwa.devOptions.enabled: false`)
  — it was caching the page shell and causing stale content / hydration
  mismatches while iterating. Will re-enable to test installability and
  offline behavior in the PWA finalization phase.
- Reworked `README.md` (accurate project structure, an honest
  "Known limitations" section, updated status/roadmap) and
  `CONTRIBUTING.md` (documented the `settingsSchema` β†’
  `WidgetSettingsPanel` auto-rendering and the `update:config`
  persistence pattern) to match what's actually built, rather than the
  Phase 0 aspirational versions.

### Known limitations

- PWA offline support is wired up (manifest, icons, and a generated
  service worker with an 18-entry precache list, all confirmed correct
  in a production build via `nuxt build && nuxt preview`), and the
  service worker reliably reaches an "activated" state. However, this
  session's automated browser tooling could not conclusively confirm
  that the precache actually populates Cache Storage, so a genuinely
  offline reload is unverified here. Please confirm manually (Chrome
  DevTools β†’ Application β†’ Service Workers β†’ Offline β†’ reload) before
  relying on offline behavior.
