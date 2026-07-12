import pokedex from "../../data/pokemon.json";
import { supabase } from "../supabase/client.js";
import { auth } from "./auth.svelte.js";
import { collection } from "./collection.svelte.js";

let users = $state([]);
let usersLoading = $state(false);
let usersError = $state(null);

let selectedUserId = $state(null);
let otherCollectedIds = $state(new Set());
let collectionLoading = $state(false);
let collectionError = $state(null);

const _bothMissing = $derived(
  pokedex.pokemon.filter(
    (pokemon) =>
      !collection.collectedIds.has(pokemon.id) &&
      !otherCollectedIds.has(pokemon.id),
  ),
);

const _onlyMine = $derived(
  pokedex.pokemon.filter(
    (pokemon) =>
      collection.collectedIds.has(pokemon.id) &&
      !otherCollectedIds.has(pokemon.id),
  ),
);

const _onlyTheirs = $derived(
  pokedex.pokemon.filter(
    (pokemon) =>
      !collection.collectedIds.has(pokemon.id) &&
      otherCollectedIds.has(pokemon.id),
  ),
);

const _bothHave = $derived(
  pokedex.pokemon.filter(
    (pokemon) =>
      collection.collectedIds.has(pokemon.id) &&
      otherCollectedIds.has(pokemon.id),
  ),
);

export const compare = {
  get users() {
    return users;
  },
  get usersLoading() {
    return usersLoading;
  },
  get usersError() {
    return usersError;
  },
  get selectedUserId() {
    return selectedUserId;
  },
  get otherCollectedIds() {
    return otherCollectedIds;
  },
  get collectionLoading() {
    return collectionLoading;
  },
  get collectionError() {
    return collectionError;
  },
  get bothMissing() {
    return _bothMissing;
  },
  get onlyMine() {
    return _onlyMine;
  },
  get onlyTheirs() {
    return _onlyTheirs;
  },
  get bothHave() {
    return _bothHave;
  },
};

export async function loadCompareUsers() {
  const currentUserId = auth.current?.id;
  if (!currentUserId) {
    usersError = "Not signed in";
    return;
  }

  usersLoading = true;
  usersError = null;

  try {
    const { data: collectedData, error: collectedError } = await supabase
      .from("collected_pokemon")
      .select("user_id")
      .neq("user_id", currentUserId);

    if (collectedError) {
      usersError = collectedError.message;
      return;
    }

    const userIds = [
      ...new Set(collectedData.map((row) => row.user_id)),
    ];

    if (userIds.length === 0) {
      users = [];
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", userIds);

    const emailById = new Map();
    if (!profileError && profileData) {
      for (const profile of profileData) {
        emailById.set(profile.id, profile.email);
      }
    }

    users = userIds.map((id) => ({
      id,
      email: emailById.get(id) ?? id,
    }));

    if (users.length === 1) {
      await selectCompareUser(users[0].id);
    }
  } finally {
    usersLoading = false;
  }
}

export async function selectCompareUser(userId) {
  selectedUserId = userId;
  otherCollectedIds = new Set();
  collectionError = null;

  if (!userId) {
    collectionLoading = false;
    return;
  }

  collectionLoading = true;

  try {
    const { data, error: supaError } = await supabase
      .from("collected_pokemon")
      .select("pokemon_id")
      .eq("user_id", userId);

    if (supaError) {
      collectionError = supaError.message;
      return;
    }

    otherCollectedIds = new Set(data.map((row) => row.pokemon_id));
  } finally {
    collectionLoading = false;
  }
}

function csvCell(value) {
  const string = String(value);
  if (/[",\n]/.test(string)) {
    return `"${string.replace(/"/g, '""')}"`;
  }
  return string;
}

export function exportComparisonCsv() {
  const headers = [
    "number",
    "name",
    "both_missing",
    "only_me",
    "only_them",
    "both_have",
  ];
  const rows = pokedex.pokemon.map((pokemon) => {
    const mine = collection.collectedIds.has(pokemon.id);
    const theirs = otherCollectedIds.has(pokemon.id);
    return {
      number: pokemon.id,
      name: pokemon.name,
      both_missing: !mine && !theirs,
      only_me: mine && !theirs,
      only_them: !mine && theirs,
      both_have: mine && theirs,
    };
  });

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((key) => csvCell(row[key])).join(","),
    ),
  ];

  const blob = new Blob([`${lines.join("\n")}\n`], {
    type: "text/csv",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "pokedex-comparison.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
