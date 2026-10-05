# Meridiana

A calm, customizable screensaver PWA for desktop, mobile and tablet.

Meridiana keeps your screen awake and turns it into a calm, elegant
dashboard: clock, weather, calendar and other widgets laid out over a static
background, an image gallery, or a looping video — inspired by
[clockie.app](https://clockie.app) and Android's _StandBy Mode_, but with a
more refined aesthetic: clean typography, soft surfaces with crisp modern
corners, a coastal blue-and-tangerine palette and generous whitespace.

> **Status:** `v0.1.0` — MVP complete. Wake Lock, five widgets, background
> system, a full grid editor, and PWA installability all work; see
> [Known limitations](#known-limitations) for what's still rough.

## Screenshots

_Coming soon._

## Features

- **Wake Lock** — keeps the screen on using the native Screen Wake Lock API,
  with a canvas-stream video fallback for browsers that don't support it.
- **Modular widgets** — clock (minimal / bold / stacked / condensed / flip /
  analog), monthly calendar, date, world clock (list / tiles / analog dials /
  dotted map with live day-night shading), weather, and a checklist, each
  independently registered. More widgets can be added without touching the
  grid or any other widget — see [`CONTRIBUTING.md`](./CONTRIBUTING.md).
- **Uniform look** — every widget sits on the same card (dark or light,
  glass or solid) and shares one accent color, all switchable at runtime; any
  widget can also go transparent, straight on the background.
- **Screensaver-friendly chrome** — a single floating dock that fades out,
  together with the cursor, after a few idle seconds.
- **Grid layout editor** — add, remove, drag, resize (snapped to the grid)
  and configure widgets from a settings drawer generated from each widget's
  schema; expand any widget to fullscreen; export, import or reset the
  whole layout. Moving a widget pushes down only the widgets it covers; on
  desktop, resizing stops at the nearest neighbour so nothing else moves.
  In the phone/tablet stack, dragging a widget lower swaps it with the ones
  it passes. Works with mouse, pen and touch.
- **Responsive grid** — three breakpoints, each with its own maximum size:
  phone (< 640 px, 4 columns), tablet (640–899 px, 8) and desktop (≥ 900 px,
  12 × 8, filling the screen up to 1760×1120 px). Grid units are half a
  block: the smallest widget is 2×2, but widgets move and resize in 1-unit
  steps (so a 2×2 can sit dead-center). In edit mode the grid shows crosses
  at block intersections and dots at the half steps. Phone and tablet scroll vertically with fixed-ratio rows.
  Each breakpoint keeps its own arrangement, derived from the desktop one
  until you rearrange it.
- **Background system** — curated presets (the _Waves_ image by default), a single image, a rotating
  gallery, or a looping video, with a dim/blur/gradient overlay for
  readability.
- **Installable PWA** — manifest and icon set generated at build time;
  offline support via a generated service worker (see
  [Known limitations](#known-limitations)).
- **Everything local** — no backend, no account; layout and preferences are
  stored in your browser's `localStorage`, binary background assets in
  `IndexedDB`.

## Tech stack

- [Nuxt 4.4](https://nuxt.com) (Vue 3, TypeScript, Composition API)
- [Tailwind CSS 4.3](https://tailwindcss.com) — design tokens defined in CSS
  via `@theme`
- Self-hosted variable fonts via Fontsource: Inter (UI), Outfit (display
  numerals), Oswald (condensed clock)
- [Pinia](https://pinia.vuejs.org) + `pinia-plugin-persistedstate` for
  state persisted to `localStorage`
- [`@vite-pwa/nuxt`](https://vite-pwa-org.netlify.app/frameworks/nuxt) for
  manifest, service worker and installability
- Screen Wake Lock API, native, with fallback strategies

## Getting started

Requirements: Node.js `24.18.x` (see [`.nvmrc`](./.nvmrc)) and npm.

```bash
nvm use
npm install
npm run dev
```

Then open <http://localhost:3000>.

Other useful scripts:

| Script                 | Description                      |
| ---------------------- | -------------------------------- |
| `npm run build`        | Production build                 |
| `npm run preview`      | Preview the production build     |
| `npm run generate`     | Static site generation           |
| `npm run lint`         | Lint with ESLint                 |
| `npm run lint:fix`     | Lint and auto-fix                |
| `npm run format`       | Format with Prettier             |
| `npm run format:check` | Check formatting without writing |
| `npm run typecheck`    | Type-check with `vue-tsc`        |
| `npm test`             | Unit tests (Vitest) for `lib/`   |

## Project structure

```
app/
  assets/css/     -> Tailwind entry point & design tokens (@theme)
  assets/images/  -> waves_bg.jpg (default background)
  components/
    widgets/       -> Clock/, Calendar/, Date/, WorldClock/, Weather/,
                      Checklist/ (one folder per widget, <Name>Widget.vue is
                      the registered entry component)
    grid/          -> WidgetGrid, WidgetCard, GridItemChrome,
                      WidgetSettingsPanel, WidgetPlaceholder
    chrome/        -> AppDock, WidgetPicker, SettingsPanel,
                      AppearanceSettings, LayoutSettings
    background/    -> BackgroundManager, BackgroundSettings, GalleryPicker
    ui/            -> AppIcon, UiSegmented, UiSwitch, UiRow, MultiSelectField
  composables/    -> useWidgetRegistry, useWakeLock, useNow, useBackground,
                      useWeather, useIdle, useBreakpoint
  stores/         -> Pinia stores: layout, background, appearance, editor
  plugins/        -> widgets.ts (registers every widget on app startup),
                      00.storage-migration.client.ts
  app.vue
lib/
  widgets/        -> registry.ts, types.ts (widget registry, framework-agnostic)
  grid/           -> config.ts (breakpoints), placement.ts, layout.ts
                      (defaults, validation), responsive.ts (per-breakpoint
                      arrangement, push-to-make-room)
  time/           -> format.ts, calendar.ts, sun.ts, cities.ts
  geo/            -> worldDots.ts (generated land mask for the map)
  theme/          -> accents.ts
  backgrounds/    -> presets.ts (curated background presets)
  storage/        -> idb.ts (IndexedDB blob storage for background assets)
  weather/        -> types.ts (WeatherProvider interface), openMeteo.ts
scripts/          -> generate-world-dots.mjs
test/             -> Vitest unit tests for lib/
public/
```

This mostly follows Nuxt 4's default `app/` source directory convention (for
auto-imports of composables, components and stores), with `lib/*` living at
the project root since it's plain TypeScript, imported explicitly rather
than auto-imported. The `editor` store is intentionally not persisted — edit
mode, the fullscreen widget and the open panel are session-only UI state.

The app runs as a client-only SPA (`ssr: false`): all state lives in the
browser and every widget depends on the local clock, so server rendering
only produced empty shells and hydration mismatches.

## Architecture

The core idea is that **widgets are pluggable**: new widgets can be added
without touching the grid, the layout system or any other widget.

- **Widget Registry** (`lib/widgets/registry.ts`) — every widget self-registers
  with an `id`, `name`, `description`, Vue `component`, `defaultSize` /
  `minSize` / `maxSize` (grid units), a `settingsSchema`, and a `category`.
- **Responsive layouts** — `lib/grid/config.ts` defines the phone / tablet
  / desktop breakpoints (columns, max size, gap, padding, row ratio). The
  item's own `x/y/w/h` are the desktop layout; `layouts.phone` /
  `layouts.tablet` hold the arrangement made on those screens.
  `resolveLayout` fills in any breakpoint that has none by packing items
  in desktop reading order, and a drop saves the whole breakpoint at once.
- **Grid layout & editor** — `WidgetGrid` renders the layout as a CSS grid;
  in edit mode (`stores/editor.ts`), `GridItemChrome` overlays each widget
  with drag/resize handles (pointer-based, snapped to grid cells, reverted
  on drop if the result would collide — `lib/grid/placement.ts`), plus
  fullscreen/settings/remove actions. `WidgetPicker` adds new widgets into
  the first free slot; `WidgetSettingsPanel` renders a form from the
  selected widget's `settingsSchema` and writes changes back through the
  same `update:config` event any widget can emit to persist its own data
  (e.g. the Checklist widget's todo items) without a bespoke store.
- **Layout persistence** — the grid layout (widget ids, positions, sizes,
  frame, per-widget config) is serialized as JSON and persisted to
  `localStorage` via `pinia-plugin-persistedstate`. It can be exported,
  imported (validated by `lib/grid/layout.ts`) or reset from the settings
  panel. Data saved by v0.1 in cookies is migrated automatically.
- **Theme/Background system** — decoupled from widgets: curated CSS
  presets, a single image, a rotating gallery, or a looping video, with an
  optional dim/blur/gradient overlay for widget legibility. Binary assets
  (images/video) are stored as Blobs in IndexedDB; only the active mode,
  asset ids and overlay settings are persisted as preferences/metadata.
- **Design tokens** — fonts, radii and _semantic_ colors are centralized in
  `app/assets/css/main.css`. Widgets paint only with tone-aware utilities
  (`text-ink`, `text-ink-muted`, `bg-tint`, `border-line`, `bg-accent`…)
  whose values switch with `data-tone` (dark/light), `data-material`
  (glass/solid) and the runtime `--accent`, so the appearance settings
  restyle every widget consistently.
- **Time** — a single shared ticker (`useNow`) aligned to the wall-clock
  second drives every clock; `useNow('minute')` for widgets that don't need
  per-second updates.

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for how to add a new widget.

## Known limitations

- **Offline support is unconfirmed.** The manifest, icons and generated
  service worker (with a full precache list) are all in place and verified
  correct in a production build (`npm run build && npm run preview`), and
  the service worker reliably reaches an "activated" state. Whether a
  genuinely offline reload serves from cache hasn't been confirmed
  hands-on — please check yourself (Chrome DevTools β†’ Application β†’
  Service Workers β†’ Offline β†’ reload) before relying on it.
- **Weather needs a connection.** Data comes from
  [Open-Meteo](https://open-meteo.com) (no API key) and refreshes every
  15 minutes; offline, the widget keeps showing the last reading, marked
  "offline". "Use my location" needs the browser's location permission and
  is labelled "My location" (Open-Meteo has no reverse geocoding).

## Roadmap

- [x] Phase 0 — Project setup (Nuxt, Tailwind, Pinia, PWA, tooling)
- [x] Phase 1 — Wake Lock, widget registry, empty grid
- [x] Phase 2 — Clock widget (flip / minimal / analog)
- [x] Phase 3 — Background system
- [x] Phase 4 — Date/Calendar, World Clock, Weather (mock), Checklist widgets
- [x] Phase 5 — Grid editor UI (add/remove/resize/configure widgets)
- [x] Phase 6 — PWA finalization (icons, offline — see known limitations)
- [x] Phase 7 — Polish & `v0.1.0` release

Widgets planned beyond the MVP: news, photo slideshow, pomodoro/focus timer,
calendar agenda (events), quotes, and a multi-day weather forecast.

## Contributing

Contributions are welcome! Please read
[`CONTRIBUTING.md`](./CONTRIBUTING.md) for the branching strategy, commit
conventions, and a guide to registering new widgets.

## License

[MIT](./LICENSE)
