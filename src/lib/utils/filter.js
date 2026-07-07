import pokedex from "../../data/pokemon.json";

export function filterPokemon(rawQuery, { collectedIds, hidden, mode }) {
  const trimmed = rawQuery.trim().toLowerCase();
  const numericQuery = Number(trimmed.replace(/^#/, ""));

  const isNumericQuery = Number.isInteger(numericQuery) && numericQuery > 0;

  return pokedex.pokemon.filter((pokemon) => {
    const isCollected = collectedIds.has(pokemon.id);

    const hiddenRule = !(hidden && mode === "list" && isCollected);

    if (isNumericQuery) {
      return (
        (pokemon.id === numericQuery ||
          pokemon.name.toLowerCase().includes(trimmed)) &&
        hiddenRule
      );
    }

    const matchesSearch =
      !trimmed || pokemon.name.toLowerCase().includes(trimmed);

    return matchesSearch && hiddenRule;
  });
}

export function findNextMissing(collectedIds) {
  return pokedex.pokemon.find((pokemon) => !collectedIds.has(pokemon.id));
}