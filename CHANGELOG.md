# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

### Changed

- Disabled the PWA service worker in dev (`pwa.devOptions.enabled: false`)
  — it was caching the page shell and causing stale content / hydration
  mismatches while iterating. Will re-enable to test installability and
  offline behavior in the PWA finalization phase.
