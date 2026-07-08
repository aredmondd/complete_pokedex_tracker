import pokedex from "../../data/pokemon.json";
import { TOTAL_POCKETS } from "../utils/constants.js";
import { findNextMissing } from "../utils/filter.js";
import { supabase } from "../supabase/client.js";
import { auth } from "./auth.svelte.js";

let collectedIds = $state(new Set());

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

export async function loadCollection() {
  const userId = auth.current?.id;
  if (!userId) {
    collectedIds = new Set();
    return;
  }

  const { data, error } = await supabase
    .from("collected_pokemon")
    .select("pokemon_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to load collection:", error.message);
    return;
  }

  collectedIds = new Set(data.map((row) => row.pokemon_id));
}

export function reset() {
  collectedIds = new Set();
}

export async function toggleCollectedId(id) {
  const previous = collectedIds;
  const next = new Set(previous);
  const isCollected = next.has(id);

  if (isCollected) {
    next.delete(id);
  } else {
    next.add(id);
  }
  collectedIds = next;

  const userId = auth.current?.id;
  if (!userId) return;

  let error;
  if (isCollected) {
    ({ error } = await supabase
      .from("collected_pokemon")
      .delete()
      .eq("user_id", userId)
      .eq("pokemon_id", id));
  } else {
    const now = new Date().toISOString();
    ({ error } = await supabase
      .from("collected_pokemon")
      .insert({ user_id: userId, pokemon_id: id, collected_at: now }));
  }

  if (error) {
    console.error("Failed to toggle collected state:", error.message);
    collectedIds = previous;
  }
}

export async function setCollectedIds(ids) {
  const userId = auth.current?.id;
  if (!userId) {
    collectedIds = new Set(ids);
    return;
  }

  const previous = collectedIds;
  const nextSet = new Set(ids);
  collectedIds = nextSet;

  const { error: delError } = await supabase
    .from("collected_pokemon")
    .delete()
    .eq("user_id", userId);

  if (delError) {
    console.error(
      "Failed to clear collection before import:",
      delError.message,
    );
    collectedIds = previous;
    return;
  }

  if (nextSet.size === 0) return;

  const now = new Date().toISOString();
  const rows = [...nextSet].map((pokemon_id) => ({
    user_id: userId,
    pokemon_id,
    collected_at: now,
  }));

  const { error: insError } = await supabase
    .from("collected_pokemon")
    .insert(rows);

  if (insError) {
    console.error("Failed to import collection:", insError.message);
    await loadCollection();
  }
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

export async function importCollection(event) {
  const file = event.target.files?.[0];

  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const ids = Array.isArray(parsed.collectedIds) ? parsed.collectedIds : [];
    const valid = ids
      .map(Number)
      .filter((id) => Number.isInteger(id) && id >= 1 && id <= pokedex.count);
    await setCollectedIds(valid);
  } catch {
    window.alert(
      "That JSON file does not look like a Pokedex collection export.",
    );
  } finally {
    event.target.value = "";
  }
}

export { TOTAL_POCKETS };