# Complete Pokédex Binder

A single-page app that turns the National Pokédex into a virtual binder of trading-card pockets. Every Pokémon gets a slot; you click a slot to mark it "collected," and your binder tells you how far along you are and which pocket to fill next.

Built with **Svelte**, **Vite**, and **Tailwind CSS**. All progress is stored locally in the browser.

Pokemon sprites are downloaded from the PokeAPI repo [here](https://github.com/PokeAPI/sprites)

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

## Getting started

**Prerequisites:** Node.js and npm.

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