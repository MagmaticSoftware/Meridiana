# Meridiana

A calm, customizable screensaver PWA for desktop, mobile and tablet.

Meridiana keeps your screen awake and turns it into a calm, elegant
dashboard: clock, weather, calendar and other widgets laid out over a static
background, an image gallery, or a looping video — inspired by
[clockie.app](https://clockie.app) and Android's _StandBy Mode_, but with a
more refined aesthetic: clean typography, soft surfaces with crisp modern
corners, a warm neutral palette and generous whitespace.

> **Status:** `v0.1.0` — MVP complete. Wake Lock, five widgets, background
> system, a full grid editor, and PWA installability all work; see
> [Known limitations](#known-limitations) for what's still rough.

## Screenshots

_Coming soon._

## Features

- **Wake Lock** — keeps the screen on using the native Screen Wake Lock API,
  with a canvas-stream video fallback for browsers that don't support it.
- **Modular widgets** — clock (minimal / flip / analog), date, world clock,
  weather, and a checklist, each independently registered. More widgets can
  be added without touching the grid or any other widget — see
  [`CONTRIBUTING.md`](./CONTRIBUTING.md).
- **Grid layout editor** — add, remove, drag, resize (snapped to the grid,
  reverts on collision) and configure widgets from a settings drawer
  generated from each widget's schema; expand any widget to fullscreen.
- **Background system** — curated presets, a single image, a rotating
  gallery, or a looping video, with a dim/blur/gradient overlay for
  readability.
- **Installable PWA** — manifest and icon set generated at build time;
  offline support via a generated service worker (see
  [Known limitations](#known-limitations)).
- **Everything local** — no backend, no account; layout and preferences are
  stored in your browser (`localStorage`/cookies), binary background assets
  in `IndexedDB`.

## Tech stack

- [Nuxt 4.4](https://nuxt.com) (Vue 3, TypeScript, Composition API)
- [Tailwind CSS 4.3](https://tailwindcss.com) — design tokens defined in CSS
  via `@theme`
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

## Project structure

```
app/
  assets/css/     -> Tailwind entry point & design tokens (@theme)
  components/
    widgets/       -> Clock/, Date/, WorldClock/, Weather/, Checklist/
                      (one folder per widget, <Name>Widget.vue is the
                      registered entry component)
    grid/          -> WidgetGrid, GridItemChrome, WidgetPicker,
                      WidgetSettingsPanel, EditModeToggle, WidgetPlaceholder
    background/    -> BackgroundManager, BackgroundSettings, GalleryPicker
    WakeLockBadge.vue
  composables/    -> useWidgetRegistry, useWakeLock, useNow, useBackground,
                      useWeather, useGridPlacement
  stores/         -> Pinia stores: layout, background, editor
  plugins/        -> widgets.ts (registers every widget on app startup)
  app.vue
lib/
  widgets/        -> registry.ts, types.ts (widget registry, framework-agnostic)
  backgrounds/    -> presets.ts (curated background presets)
  storage/        -> idb.ts (IndexedDB blob storage for background assets)
  weather/        -> types.ts, mockProvider.ts (WeatherProvider interface)
  grid/           -> config.ts (grid column/row constants)
public/
```

This mostly follows Nuxt 4's default `app/` source directory convention (for
auto-imports of composables, components and stores), with `lib/*` living at
the project root since it's plain TypeScript, imported explicitly rather
than auto-imported. The `editor` store is intentionally not persisted — edit
mode, the fullscreen widget and the open panel are session-only UI state.

## Architecture

The core idea is that **widgets are pluggable**: new widgets can be added
without touching the grid, the layout system or any other widget.

- **Widget Registry** (`lib/widgets/registry.ts`) — every widget self-registers
  with an `id`, `name`, `description`, Vue `component`, `defaultSize` /
  `minSize` / `maxSize` (grid units), a `settingsSchema`, and a `category`.
- **Grid layout & editor** — `WidgetGrid` renders the layout as a CSS grid;
  in edit mode (`stores/editor.ts`), `GridItemChrome` overlays each widget
  with drag/resize handles (pointer-based, snapped to grid cells, reverted
  on drop if the result would collide — `useGridPlacement`), plus
  fullscreen/settings/remove actions. `WidgetPicker` adds new widgets into
  the first free slot; `WidgetSettingsPanel` renders a form from the
  selected widget's `settingsSchema` and writes changes back through the
  same `update:config` event any widget can emit to persist its own data
  (e.g. the Checklist widget's todo items) without a bespoke store.
- **Layout persistence** — the grid layout (widget ids, positions, sizes,
  per-widget config) is serialized as JSON and persisted via
  `pinia-plugin-persistedstate`. The store already exposes
  `exportLayout`/`importLayout` for sharing presets as JSON; a UI for
  that is still to come.
- **Theme/Background system** — decoupled from widgets: curated CSS
  presets, a single image, a rotating gallery, or a looping video, with an
  optional dim/blur/gradient overlay for widget legibility. Binary assets
  (images/video) are stored as Blobs in IndexedDB; only the active mode,
  asset ids and overlay settings are persisted as preferences/metadata.
- **Design tokens** — colors, fonts, radii and shadows are centralized in the
  Tailwind 4 `@theme` block in `app/assets/css/main.css`, so background/theme
  presets can restyle the app consistently.

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for how to add a new widget.

## Known limitations

- **Offline support is unconfirmed.** The manifest, icons and generated
  service worker (with a full precache list) are all in place and verified
  correct in a production build (`npm run build && npm run preview`), and
  the service worker reliably reaches an "activated" state. Whether a
  genuinely offline reload serves from cache hasn't been confirmed
  hands-on — please check yourself (Chrome DevTools β†’ Application β†’
  Service Workers β†’ Offline β†’ reload) before relying on it.
- **Weather is mock data.** `lib/weather` defines a `WeatherProvider`
  interface so a real provider (planned: [Open-Meteo](https://open-meteo.com))
  can be swapped in without touching the widget; for now it returns a
  deterministic value derived from the location string.
- **No UI for layout export/import yet.** The layout store already exposes
  `exportLayout`/`importLayout`; wiring them to the editor is planned.
- **The grid doesn't reflow for small screens.** It's a fixed 6-column grid
  regardless of viewport width, so widget chrome (name label, action
  buttons) gets tight on phone-sized viewports. Everything stays usable,
  just visually cramped.

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
calendar agenda, quotes, and a real weather provider
([Open-Meteo](https://open-meteo.com), no API key required).

## Contributing

Contributions are welcome! Please read
[`CONTRIBUTING.md`](./CONTRIBUTING.md) for the branching strategy, commit
conventions, and a guide to registering new widgets.

## License

[MIT](./LICENSE)
