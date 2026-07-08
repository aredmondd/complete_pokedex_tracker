# AGENTS.md

Guidance for AI agents (and humans) working on this codebase.

## Project

A "complete Pokédex binder" tracker. Single-page Svelte 5 app: navigate a
physical binder of numbered pockets, mark which Pokémon you've collected, filter
the full list, toggle shiny sprites, import/export your collection. State is
persisted to `localStorage`.

- **Runtime:** Svelte 5 (runes), Vite 8, Tailwind CSS 4 (via `@tailwindcss/vite`).
- **No TypeScript, no test framework, no linter.** Plain ES modules + JSDoc.
- **Data:** `src/data/pokemon.json` is generated from `Pokemon.csv` by
  `npm run generate:data` (see `scripts/generate-pokemon-data.mjs`). Do not edit
  by hand — regenerate instead.
- **Sprites:** `sprites/` is vendored from PokeAPI and served at
  `/sprites/pokemon/` (and `/sprites/pokemon/shiny/` for shinies).

## Commands

```bash
npm install                 # install deps
npm run dev                 # start vite dev server (127.0.0.1)
npm run build               # production build -> dist/
npm run preview             # preview the production build
npm run generate:data       # rebuild src/data/pokemon.json from Pokemon.csv
```

### Verification

There is no `lint` or `typecheck` script. After any change:

1. Run `npm run build` — it must complete cleanly. Svelte 5 compiles the
   `.svelte.js` state modules and surfaces runes/parsing errors at build time,
   so a green build is the primary correctness signal.
2. Optionally `npm run dev` and smoke-test the affected view in the browser.

If a `lint`/`typecheck` script is added later, update this section.

## Architecture

The app was split out of a single 944-line `App.svelte`. The layout below is
intentional — keep it.

```
src/
  App.svelte                root component: $effect side-effects + window
                            listeners + composition. No business logic.
  main.js                   mount entry
  app.css                   tailwind import + base styles
  data/pokemon.json         generated, read-only
  lib/
    utils/                  pure, side-effect-free helpers
      constants.js          pocket/spread math, storage keys, sprite dirs
      slots.js              spreadForId, buildSlot, computeSpreadSlots
      filter.js             filterPokemon, findNextMissing
      card-class.js         cardStateClass, listCardStateClass
    state/                  Svelte 5 runes modules (.svelte.js)
      theme.svelte.js       theme $state + toggleTheme
      collection.svelte.js  collectedIds $state + derived counts/nextMissing,
                            persistence, export/import, toggleCollectedId
      session.svelte.js     currentSpread/highlightedId/query/mode/hidden/
                            directory $state + derived spread slots/filtered
                            list + all nav/search/shortcut handlers
    components/             presentational Svelte components
      Icon.svelte + icons.js   lucide-style SVG by name
      IconButton.svelte        shared toolbar button wrapper
      StatBadge.svelte         repeated Collected/Missing/Progress badge
      SearchBar.svelte         search input; registers its DOM ref so the
                               global Cmd/Ctrl+K shortcut can focus it
      SpreadNav.svelte         prev/next + range slider
      Toolbar.svelte           the whole header
      BinderPage.svelte        one binder page (used twice per spread)
      BinderView.svelte        two-page spread
      ListView.svelte          filtered grid
```

### Conventions

- **Runes, not stores.** Use `$state`, `$derived`, `$effect`, `$props`.
  `$.legacy`/`writable`/`readable` are not used and should not be introduced
  unless there's a clear reason.
- **State lives in `.svelte.js` modules at module scope.** Each domain exports
  an object with getters/setters (e.g. `collection`, `session`, `theme`) that
  wraps the internal `$state`. Components import the module and read
  `collection.collectedIds`, `session.mode`, etc.
- **Never `export` a `$derived` binding directly** — the Svelte 5 compiler
  rejects it (`svelte.dev/e/derived_invalid_export`). Wrap derived values in a
  getter on the exported state object instead (see how `collection.nextMissing`
  and `session.spreadSlots` are done).
- **Effects live in a component.** `$effect` only runs inside a component
  context, so all cross-cutting effects (localStorage persistence, theme class
  toggling, scroll-on-highlight) live in `App.svelte` and read from the shared
  state modules for reactivity.
- **Pure logic goes in `utils/`.** Anything that doesn't need to be reactive
  (computation, class-string builders, filtering) takes its inputs as plain
  arguments and returns a plain result. Keep DOM/localStorage out of `utils/`.
- **Styling is Tailwind utility classes inline in markup.** Dark mode is
  class-based (`darkMode: 'class'` in `tailwind.config.js`); toggle the `dark`
  class on `<html>`. Repeated class strings (e.g. the toolbar button wrapper)
  are factored into a small presentational component rather than a CSS class.
- **No comments** unless something genuinely needs explaining — favor clear
  function/variable names.
- **Imports** use relative paths (`../state/session.svelte.js`), not path
  aliases; none are configured.
```