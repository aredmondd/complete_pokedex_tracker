import pokedex from "../../data/pokemon.json";
import {
  TOTAL_POCKETS,
  TOTAL_SPREADS,
  SPRITE_DIRECTORY,
  SHINY_DIRECTORY,
} from "../utils/constants.js";
import { computeSpreadSlots, spreadForId } from "../utils/slots.js";
import { filterPokemon } from "../utils/filter.js";
import { collection } from "./collection.svelte.js";

export const ALL_GENERATIONS = Array.from(
  new Set(pokedex.pokemon.map((pokemon) => pokemon.generation)),
).sort((left, right) => left - right);

export const ALL_TYPES = [
  "Bug",
  "Dark",
  "Dragon",
  "Electric",
  "Fairy",
  "Fighting",
  "Fire",
  "Flying",
  "Ghost",
  "Grass",
  "Ground",
  "Ice",
  "Normal",
  "Poison",
  "Psychic",
  "Rock",
  "Steel",
  "Water",
];

let currentSpread = $state(1);
let highlightedId = $state(null);
let query = $state("");
let mode = $state("binder");
let directory = $state(SPRITE_DIRECTORY);
let selectedGenerations = $state(new Set(ALL_GENERATIONS));
let selectedTypes = $state(new Set(ALL_TYPES));
let collectedStatus = $state("all");

let searchInputEl = $state(null);

export const session = {
  get currentSpread() {
    return currentSpread;
  },
  set currentSpread(value) {
    currentSpread = value;
  },
  get highlightedId() {
    return highlightedId;
  },
  set highlightedId(value) {
    highlightedId = value;
  },
  get query() {
    return query;
  },
  set query(value) {
    query = value;
  },
  get mode() {
    return mode;
  },
  set mode(value) {
    mode = value;
  },
  get directory() {
    return directory;
  },
  get selectedGenerations() {
    return selectedGenerations;
  },
  set selectedGenerations(value) {
    selectedGenerations = value;
  },
  get selectedTypes() {
    return selectedTypes;
  },
  set selectedTypes(value) {
    selectedTypes = value;
  },
  get collectedStatus() {
    return collectedStatus;
  },
  set collectedStatus(value) {
    collectedStatus = value;
  },
};

export function setSearchInput(el) {
  searchInputEl = el;
}

export function setSpread(spread) {
  currentSpread = Math.min(TOTAL_SPREADS, Math.max(1, Number(spread) || 1));
}

export function jumpToId(id) {
  const parsed = Number(id);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > TOTAL_POCKETS) {
    return;
  }

  highlightedId = parsed;
  currentSpread = spreadForId(parsed);
}

export function submitSearch() {
  const trimmed = query.trim();

  if (!trimmed) {
    highlightedId = null;
    return;
  }

  const numericQuery = Number(trimmed.replace(/^#/, ""));

  if (Number.isInteger(numericQuery) && numericQuery > 0) {
    jumpToId(numericQuery);
    return;
  }

  const lowerQuery = trimmed.toLowerCase();
  const match =
    pokedex.pokemon.find((pokemon) =>
      pokemon.name.toLowerCase().startsWith(lowerQuery),
    ) ??
    pokedex.pokemon.find((pokemon) =>
      pokemon.name.toLowerCase().includes(lowerQuery),
    );

  if (match) {
    jumpToId(match.id);
  }
}

export function toggleMode() {
  const nextMode = mode === "binder" ? "list" : "binder";

  if (nextMode === "binder" && highlightedId !== null) {
    currentSpread = spreadForId(highlightedId);
  }

  mode = nextMode;
}

export function toggleShiny() {
  directory =
    directory === SPRITE_DIRECTORY ? SHINY_DIRECTORY : SPRITE_DIRECTORY;
}

export function jumpToNextMissing() {
  const missing = collection.nextMissing;
  if (missing) {
    mode = "binder";
    jumpToId(missing.id);
  }
}

export function randomPokemon() {
  const ids = collection.collectedIds;
  const missingList = pokedex.pokemon.filter(
    (pokemon) => !ids.has(pokemon.id),
  );

  if (missingList.length === 0) return;

  const picked = missingList[Math.floor(Math.random() * missingList.length)];

  highlightedId = picked.id;
  query = "";

  if (mode === "binder") {
    currentSpread = spreadForId(picked.id);
  }
}

export function handleSearchInput() {
  if (mode === "binder") {
    submitSearch();
  }
}

export function handleSearchSubmit(event) {
  event.preventDefault();

  if (mode === "binder") {
    submitSearch();
  }
}

export function handleWheel(event) {
  if (mode === "binder") {
    event.preventDefault();

    if (event.deltaY < 0) {
      currentSpread += 1;
    } else {
      currentSpread -= 1;
    }

    currentSpread = Math.max(1, currentSpread);
    currentSpread = Math.min(currentSpread, TOTAL_SPREADS);
  }
}

export function handleGlobalShortcuts(event) {
  const isSearchShortcut =
    (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";

  const isDeleteKey = event.key === "Delete" || event.key === "Backspace";

  if (isSearchShortcut) {
    event.preventDefault();
    query = "";
    searchInputEl?.focus();
    searchInputEl?.select();
    return;
  }

  if (isDeleteKey && document.activeElement !== searchInputEl) {
    searchInputEl?.focus();
  }
}

export function toggleGenerationFilter(generation) {
  const next = new Set(selectedGenerations);

  if (next.has(generation)) {
    next.delete(generation);
  } else {
    next.add(generation);
  }

  selectedGenerations = next;
}

export function toggleTypeFilter(type) {
  const next = new Set(selectedTypes);

  if (next.has(type)) {
    next.delete(type);
  } else {
    next.add(type);
  }

  selectedTypes = next;
}

export function resetFilters() {
  selectedGenerations = new Set(ALL_GENERATIONS);
  selectedTypes = new Set(ALL_TYPES);
  collectedStatus = "all";
}

export function loadFilters(serialized) {
  if (!serialized) return;

  try {
    const parsed = JSON.parse(serialized);

    if (Array.isArray(parsed.generations)) {
      selectedGenerations = new Set(
        parsed.generations.filter((generation) =>
          ALL_GENERATIONS.includes(generation),
        ),
      );
    }

    if (Array.isArray(parsed.types)) {
      selectedTypes = new Set(
        parsed.types.filter((type) => ALL_TYPES.includes(type)),
      );
    }

    if (["all", "collected", "missing"].includes(parsed.status)) {
      collectedStatus = parsed.status;
    }
  } catch {
    // Ignore corrupted storage.
  }
}

export function serializeFilters() {
  return JSON.stringify({
    generations: [...selectedGenerations].sort((left, right) => left - right),
    types: [...selectedTypes].sort(),
    status: collectedStatus,
  });
}

const _spread = $derived(
  computeSpreadSlots(currentSpread, collection.collectedIds, highlightedId),
);
const _filteredPokemon = $derived(
  filterPokemon(query, {
    collectedIds: collection.collectedIds,
    mode,
    selectedGenerations,
    selectedTypes,
    collectedStatus,
  }),
);
const _filterCount = $derived(
  Number(selectedGenerations.size !== ALL_GENERATIONS.length) +
    Number(selectedTypes.size !== ALL_TYPES.length) +
    Number(collectedStatus !== "all"),
);

Object.defineProperty(session, "spreadSlots", {
  get() {
    return _spread.slots;
  },
});
Object.defineProperty(session, "leftPageSlots", {
  get() {
    return _spread.leftPageSlots;
  },
});
Object.defineProperty(session, "rightPageSlots", {
  get() {
    return _spread.rightPageSlots;
  },
});
Object.defineProperty(session, "leftPageNumber", {
  get() {
    return _spread.leftPageNumber;
  },
});
Object.defineProperty(session, "rightPageNumber", {
  get() {
    return _spread.rightPageNumber;
  },
});
Object.defineProperty(session, "filteredPokemon", {
  get() {
    return _filteredPokemon;
  },
});
Object.defineProperty(session, "filterCount", {
  get() {
    return _filterCount;
  },
});
