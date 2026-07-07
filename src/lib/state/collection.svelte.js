import pokedex from "../../data/pokemon.json";
import { STORAGE_KEY, TOTAL_POCKETS } from "../utils/constants.js";
import { findNextMissing } from "../utils/filter.js";

function loadInitialCollection() {
  if (typeof localStorage === "undefined") return new Set();

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return new Set();

  try {
    const parsed = JSON.parse(saved);
    return new Set(parsed.collectedIds ?? []);
  } catch {
    return new Set();
  }
}

let collectedIds = $state(loadInitialCollection());

const _collectedCount = $derived(collectedIds.size);
const _progressPercent = $derived(
  Math.round((collectedIds.size / pokedex.count) * 100),
);
const _nextMissing = $derived(findNextMissing(collectedIds));

export const collection = {
  get collectedIds() {
    return collectedIds;
  },
  set collectedIds(value) {
    collectedIds = value;
  },
  get collectedCount() {
    return _collectedCount;
  },
  get progressPercent() {
    return _progressPercent;
  },
  get nextMissing() {
    return _nextMissing;
  },
};

export function toggleCollectedId(id) {
  const next = new Set(collectedIds);

  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }

  collectedIds = next;
}

export function setCollectedIds(ids) {
  collectedIds = new Set(ids);
}

export function exportCollection({
  totalPockets,
  pocketsPerPage,
  pocketsPerSpread,
}) {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    binder: {
      totalPockets,
      pocketsPerPage,
      pocketsPerSpread,
    },
    collectedIds: [...collectedIds].sort((left, right) => left - right),
  };
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "pokedex-collection.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function importCollection(event) {
  const file = event.target.files?.[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const ids = Array.isArray(parsed.collectedIds) ? parsed.collectedIds : [];
      collectedIds = new Set(
        ids
          .map(Number)
          .filter(
            (id) =>
              Number.isInteger(id) && id >= 1 && id <= pokedex.count,
          ),
      );
    } catch {
      window.alert(
        "That JSON file does not look like a Pokedex collection export.",
      );
    } finally {
      event.target.value = "";
    }
  };

  reader.readAsText(file);
}

export { TOTAL_POCKETS };