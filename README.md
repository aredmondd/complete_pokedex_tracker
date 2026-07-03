# Complete Pokédex Binder

A single-page app that turns the National Pokédex into a virtual binder of trading-card pockets. Every Pokémon gets a slot; you click a slot to mark it "collected," and your binder tells you how far along you are and which pocket to fill next.

Built with **Svelte 5**, **Vite**, and **Tailwind CSS**. All progress is stored locally in the browser.

---

## How it works

The app models a physical binder based on [this binder](https://us.vaultx.com/products/16-pocket-exo-tec-zip-binder?variant=50783318475068)

- **1,088 total pockets**, laid out **16 per page** (a 4×4 grid) and **2 pages per spread** (32 pockets per spread).
- Pokémon are placed into pockets by **National Pokédex number**.
- Clicking a pocket toggles it between collected/uncollected.
- A **"Missing #___"** button jumps straight to the next pocket you haven't filled.
- The **search bar** (or `⌘K` / `Ctrl+K`) jumps to a Pokémon by name or by Pokédex number (with or without a `#` prefix), and highlights it in yellow.
- **Export** downloads your collection as a timestamped JSON file (`pokedex-collection.json`); **Import** loads one back in. This doubles as your backup/transfer mechanism since there's no server-side storage.
- Progress also auto-saves to `localStorage` on every change, so it persists across browser sessions on the same device.

---

## Repo structure

```
complete_pokedex_tracker/
├── Pokemon.csv                    # Source-of-truth stat/type/generation data for all Pokémon
├── scripts/
│   └── generate-pokemon-data.mjs  # Builds src/data/pokemon.json from Pokemon.csv
├── src/
│   ├── data/
│   │   └── pokemon.json           # Generated: one entry per National Dex number
│   ├── App.svelte                 # The entire app — binder layout, state, search, import/export
│   ├── app.css                    # Tailwind entrypoint + base styles
│   └── main.js                    # Svelte mount point
├── sprites/
│   └── pokemon/                   # Sprite images, one PNG per Pokédex number
│       └── shiny/                 # Shiny variants of the same sprites
├── index.html                     # Vite entry HTML
├── vite.config.js                 # Vite + Svelte plugin config
├── tailwind.config.js             # Tailwind theme (Inter font, custom "pocket" shadow)
├── postcss.config.cjs             # Tailwind/Autoprefixer wiring for PostCSS
├── package.json
└── package-lock.json
```

### The data pipeline

`Pokemon.csv` is a full stats table (ID, Name, Form, Type1, Type2, base stats, Generation) with **one row per form** — meaning some Pokédex numbers appear multiple times (regional forms, etc.).

`scripts/generate-pokemon-data.mjs` reduces this down to what the binder actually needs:

1. Parses the CSV by hand (custom quoted-field parser, no external CSV library).
2. Keeps only the **first row it encounters for each National Dex ID**, discarding alternate forms — the binder only has one pocket per number.
3. Writes out `src/data/pokemon.json`, a flat list of `{ id, name, types, generation }` objects plus some metadata about how it was generated.

If you edit `Pokemon.csv`, re-run `npm run generate:data` to regenerate the JSON the app actually reads.

Sprites are matched to Pokémon purely by filename convention: `sprites/pokemon/{id}.png`. The `SPRITE_DIRECTORY` constant at the top of `App.svelte` currently points at the regular sprite set; swapping it to `/sprites/pokemon/shiny/` switches the entire binder to shiny art.

---

## Getting started

**Prerequisites:** Node.js (any reasonably recent LTS version) and npm.

```bash
# 1. Clone the repo
git clone https://github.com/aredmondd/complete_pokedex_tracker.git
cd complete_pokedex_tracker

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

This runs Vite on `127.0.0.1` — open the URL it prints (typically `http://127.0.0.1:5173`) in your browser. Hot reload is on, so edits to `App.svelte` show up instantly.

### Other scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the local dev server |
| `npm run build` | Builds a production bundle into `dist/` |
| `npm run preview` | Serves the production build locally, for a final check before deploying |
| `npm run generate:data` | Rebuilds `src/data/pokemon.json` from `Pokemon.csv` |

---

## Customizing

- **Switch to shiny sprites:** change `SPRITE_DIRECTORY` in `src/App.svelte` from `/sprites/pokemon/` to `/sprites/pokemon/shiny/`.
- **Change binder layout:** `POCKETS_PER_PAGE` and `PAGES_PER_SPREAD` at the top of `App.svelte` control the grid — e.g. dropping to a 9-pocket page would mean changing the grid classes in the `BinderPage` snippet too, since the 4×4 grid is hardcoded in the markup.
- **Add more Pokémon (future generations):** update `Pokemon.csv`, re-run `npm run generate:data`, add matching sprite PNGs, and bump `TOTAL_POCKETS` in `App.svelte` if needed.
- **Type badges:** there's already a `typeStyles` color map and the rendering markup for type badges in `App.svelte` — it's currently commented out inside the `BinderPage` snippet if you want to re-enable per-Pokémon type tags on each card.

---