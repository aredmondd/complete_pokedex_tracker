import pokedex from "../../data/pokemon.json";

const pokemon = pokedex.pokemon;

const searchIndex = pokemon.map((pokemon) => ({
  ...pokemon,
  lowerName: pokemon.name.toLowerCase(),
}));

const ALL_GENERATIONS = Array.from(
  new Set(pokemon.map((pokemon) => pokemon.generation)),
).sort((left, right) => left - right);

const ALL_TYPES = [
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

function parseNumericQuery(trimmed) {
  if (trimmed.length === 0) return null;

  const first = trimmed.charCodeAt(0);
  const maybeNumber =
    first === 35 || (first >= 48 && first <= 57);
  if (!maybeNumber) return null;

  const numericPart = first === 35 ? trimmed.slice(1) : trimmed;
  if (numericPart.length === 0) return null;

  const value = Number(numericPart);
  if (Number.isInteger(value) && value > 0) {
    return value;
  }

  return null;
}

export function filterPokemon(
  rawQuery,
  { collectedIds, mode, selectedGenerations, selectedTypes, collectedStatus },
) {
  const trimmed = rawQuery.trim();
  const lower = trimmed.toLowerCase();
  const numericQuery = parseNumericQuery(trimmed);
  const isNumericQuery = numericQuery !== null;
  const hasActiveListFilters =
    mode === "list" &&
    (selectedGenerations.size !== ALL_GENERATIONS.length ||
      selectedTypes.size !== ALL_TYPES.length ||
      collectedStatus !== "all");

  if (!lower && !hasActiveListFilters) {
    return pokemon;
  }

  const needsCollectedCheck = mode === "list" && collectedStatus !== "all";

  return searchIndex.filter((pokemon) => {
    if (mode === "list") {
      if (!selectedGenerations.has(pokemon.generation)) {
        return false;
      }

      const hasSelectedType = pokemon.types.some((type) =>
        selectedTypes.has(type),
      );
      if (!hasSelectedType) {
        return false;
      }

      if (needsCollectedCheck) {
        const isCollected = collectedIds.has(pokemon.id);
        if (collectedStatus === "collected" && !isCollected) {
          return false;
        }
        if (collectedStatus === "missing" && isCollected) {
          return false;
        }
      }
    }

    if (isNumericQuery && pokemon.id === numericQuery) {
      return true;
    }

    return pokemon.lowerName.includes(lower);
  });
}

export function findNextMissing(collectedIds) {
  return pokedex.pokemon.find((pokemon) => !collectedIds.has(pokemon.id));
}
