# Contributing to Meridiana

Thanks for your interest in contributing! This project is developed in
phases (see the roadmap in [`README.md`](./README.md)); some of the
guidelines below (in particular the widget registry) describe the intended
architecture and will apply from Phase 1 onward.

## Branching strategy

- **`main`** — always stable and releasable. Only receives merges from
  `develop` (or hotfix branches) for a release.
- **`develop`** — integration branch. Feature branches are merged here.
- **`feature/<short-description>`** — one branch per feature or fix, created
  from `develop` (e.g. `feature/clock-widget`, `feature/wake-lock`).

Typical flow:

```bash
git checkout develop
git checkout -b feature/my-feature
# ...work, commit...
git push -u origin feature/my-feature
# open a PR into develop
```

When `develop` is stable and ready to ship, it's merged into `main` and
tagged with a version (see below).

## Commit messages

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <description>

[optional body]
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`,
`chore`. Examples:

```
feat(widgets): add flip-clock style to Clock widget
fix(wake-lock): re-request lock on visibility change
docs(readme): document background presets
```

## Versioning & changelog

The project uses [Semantic Versioning](https://semver.org/), starting at
`0.1.0`. Every user-facing change belongs in
[`CHANGELOG.md`](./CHANGELOG.md), under an `[Unreleased]` section, following
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). When a release is
cut, `[Unreleased]` is renamed to the new version number and dated.

## Adding a new widget

Widgets are self-contained and self-registering — adding one should never
require editing the grid, layout, or other widgets. A widget lives at
`app/components/widgets/<WidgetName>/` and registers itself in
`lib/widgets/registry.ts` with an entry shaped like:

```ts
// lib/widgets/types.ts
export interface WidgetDefinition {
  id: string // unique, kebab-case, e.g. "clock"
  name: string // display name for the widget picker UI
  description: string
  component: Component // the Vue component to render
  category: 'time' | 'weather' | 'info' | 'productivity' // extend as needed
  defaultSize: { w: number; h: number } // grid units
  minSize: { w: number; h: number }
  maxSize: { w: number; h: number }
  settingsSchema: WidgetSettingsSchema // per-widget configurable options
}
```

Register it in [`app/plugins/widgets.ts`](./app/plugins/widgets.ts), which
runs once at app startup and imports every widget's component:

```ts
// app/plugins/widgets.ts
import { registerWidget } from '~~/lib/widgets/registry'
import ClockWidget from '~/components/widgets/Clock/ClockWidget.vue'

export default defineNuxtPlugin(() => {
  registerWidget({
    id: 'clock',
    name: 'Clock',
    description: 'Displays the current time in flip, minimal or analog style.',
    component: ClockWidget,
    category: 'time',
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 1, h: 1 },
    maxSize: { w: 3, h: 3 },
    settingsSchema: [/* ... */],
  })
})
```

Guidelines for the widget component itself:

- Adapt its internal layout to the size it's given (container queries or a
  `size` prop), not just global media queries — a widget must look good both
  in a small grid cell and in fullscreen.
- Read/write its own settings through the schema declared at registration;
  don't reach into other widgets' state or the grid store directly.
- Keep any external data fetching (e.g. a weather provider) behind a small,
  swappable module so it can be mocked or replaced later.

## Code style

- Run `npm run lint` and `npm run format` before opening a PR.
- Run `npm run typecheck` — the project is strict TypeScript.

## Pull requests

- Target `develop`, not `main`.
- Describe what changed and why; link related issues if any.
- Keep PRs focused — one feature or fix per PR.
