# Meridiana

A calm, customizable screensaver PWA for desktop, mobile and tablet.

Meridiana keeps your screen awake and turns it into a soft, elegant
dashboard: clock, weather, calendar and other widgets laid out over a static
background, an image gallery, or a looping video — inspired by
[clockie.app](https://clockie.app) and Android's _StandBy Mode_, but with a
more refined aesthetic: clean typography, soft surfaces, rounded corners, a
warm neutral palette and generous whitespace.

> **Status:** early development (Phase 0 — project setup). Not yet usable.

## Screenshots

_Coming soon._

## Features (planned)

- **Wake Lock** — keeps the screen on using the native Screen Wake Lock API,
  with a fallback for browsers that don't support it.
- **Modular widgets** — clock, date/calendar, world clock, weather, checklist,
  and more to come, each independently registered.
- **Grid layout editor** — add, remove, resize, move and configure widgets;
  jump any widget to fullscreen.
- **Background system** — single image, rotating gallery, or looping video,
  with an optional dim/blur/gradient overlay for readability.
- **Installable PWA** — works offline, installable on desktop and mobile.
- **Everything local** — no backend, no account; layout and preferences are
  stored in your browser (`localStorage` / `IndexedDB`).

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
  assets/css/         -> Tailwind entry point & design tokens (@theme)
  components/
    widgets/           -> ClockWidget/, WeatherWidget/, ... (one folder per widget)
    grid/               -> WidgetGrid.vue, WidgetPicker.vue, GridEditor.vue
    background/         -> BackgroundManager.vue, GalleryPicker.vue
  composables/          -> useWidgetRegistry, useWakeLock, useBackground, useLayout
  stores/               -> Pinia stores (layout, background, settings)
  app.vue
lib/
  widgets/              -> registry.ts, types.ts (widget registry, framework-agnostic)
public/
```

This mostly follows Nuxt 4's default `app/` source directory convention (for
auto-imports of composables, components and stores), with `lib/widgets`
living at the project root since it's plain TypeScript, imported explicitly
rather than auto-imported.

## Architecture

The core idea is that **widgets are pluggable**: new widgets can be added
without touching the grid, the layout system or any other widget.

- **Widget Registry** (`lib/widgets/registry.ts`) — every widget self-registers
  with an `id`, `name`, `description`, Vue `component`, `defaultSize` /
  `minSize` / `maxSize` (grid units), a `settingsSchema`, and a `category`.
- **Grid Layout System** — an editable grid where widgets can be added,
  resized, repositioned, configured, or expanded to fullscreen.
- **Layout persistence** — the grid layout (widget ids, positions, sizes,
  per-widget config) is serialized as JSON in `localStorage`, and can be
  exported/imported to share presets.
- **Theme/Background system** — decoupled from widgets: single image,
  rotating gallery, or looping video, with curated presets and an optional
  readability overlay. Binary assets (images/videos) are stored in
  IndexedDB; only preferences/metadata go in `localStorage`.
- **Design tokens** — colors, fonts, radii and shadows are centralized in the
  Tailwind 4 `@theme` block in `app/assets/css/main.css`, so background/theme
  presets can restyle the app consistently.

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for how to add a new widget.

## Roadmap

- [x] Phase 0 — Project setup (Nuxt, Tailwind, Pinia, PWA, tooling)
- [x] Phase 1 — Wake Lock, widget registry, empty grid
- [ ] Phase 2 — Clock widget (flip / minimal / analog)
- [ ] Phase 3 — Background system
- [ ] Phase 4 — Date/Calendar, World Clock, Weather (mock), Checklist widgets
- [ ] Phase 5 — Grid editor UI (add/remove/resize/configure widgets)
- [ ] Phase 6 — PWA finalization (icons, offline)
- [ ] Phase 7 — Polish & `v0.1.0` release

Widgets planned beyond the MVP: news, photo slideshow, pomodoro/focus timer,
calendar agenda, quotes, and a real weather provider
([Open-Meteo](https://open-meteo.com), no API key required).

## Contributing

Contributions are welcome! Please read
[`CONTRIBUTING.md`](./CONTRIBUTING.md) for the branching strategy, commit
conventions, and a guide to registering new widgets.

## License

[MIT](./LICENSE)
