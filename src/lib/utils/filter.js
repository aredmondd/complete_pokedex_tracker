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

export function filterPokemon(
  rawQuery,
  { collectedIds, mode, selectedGenerations, selectedTypes, collectedStatus },
) {
  const trimmed = rawQuery.trim().toLowerCase();
  const numericQuery = Number(trimmed.replace(/^#/, ""));

  const isNumericQuery = Number.isInteger(numericQuery) && numericQuery > 0;
  const hasActiveListFilters =
    mode === "list" &&
    (selectedGenerations.size !== ALL_GENERATIONS.length ||
      selectedTypes.size !== ALL_TYPES.length ||
      collectedStatus !== "all");

  if (!trimmed && !hasActiveListFilters) {
    return pokemon;
  }

  return searchIndex.filter((pokemon) => {
    const isCollected = collectedIds.has(pokemon.id);

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

      if (collectedStatus === "collected" && !isCollected) {
        return false;
      }

      if (collectedStatus === "missing" && isCollected) {
        return false;
      }
    }

    if (isNumericQuery) {
      return (
        pokemon.id === numericQuery || pokemon.lowerName.includes(trimmed)
      );
    }

    return pokemon.lowerName.includes(trimmed);
  });
}

export function findNextMissing(collectedIds) {
  return pokedex.pokemon.find((pokemon) => !collectedIds.has(pokemon.id));
}
