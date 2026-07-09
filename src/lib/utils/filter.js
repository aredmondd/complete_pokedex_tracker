import pokedex from "../../data/pokemon.json";

export function filterPokemon(
  rawQuery,
  { collectedIds, mode, selectedGenerations, selectedTypes, collectedStatus },
) {
  const trimmed = rawQuery.trim().toLowerCase();
  const numericQuery = Number(trimmed.replace(/^#/, ""));

  const isNumericQuery = Number.isInteger(numericQuery) && numericQuery > 0;

  return pokedex.pokemon.filter((pokemon) => {
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
        pokemon.id === numericQuery ||
        pokemon.name.toLowerCase().includes(trimmed)
      );
    }

    return !trimmed || pokemon.name.toLowerCase().includes(trimmed);
  });
}

export function findNextMissing(collectedIds) {
  return pokedex.pokemon.find((pokemon) => !collectedIds.has(pokemon.id));
}
