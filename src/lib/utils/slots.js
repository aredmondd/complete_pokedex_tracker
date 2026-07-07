import pokedex from "../../data/pokemon.json";
import {
  TOTAL_POCKETS,
  POCKETS_PER_PAGE,
  POCKETS_PER_SPREAD,
  PAGES_PER_SPREAD,
} from "./constants.js";

const pokemonById = new Map(pokedex.pokemon.map((pokemon) => [pokemon.id, pokemon]));

export function spreadForId(id) {
  return id <= POCKETS_PER_PAGE
    ? 1
    : 2 + Math.floor((id - POCKETS_PER_PAGE - 1) / POCKETS_PER_SPREAD);
}

export function buildSlot(pocketNumber, { collectedIds, highlightedId }) {
  const pokemon = pokemonById.get(pocketNumber);
  const pageNumber = Math.ceil(pocketNumber / POCKETS_PER_PAGE);
  const pocketOnPage = ((pocketNumber - 1) % POCKETS_PER_PAGE) + 1;

  return {
    pocketNumber,
    pageNumber,
    pocketOnPage,
    pokemon,
    collected: collectedIds.has(pocketNumber),
    highlighted: highlightedId === pocketNumber,
  };
}

export function computeSpreadSlots(currentSpread, collectedIds, highlightedId) {
  const spreadStartPocket =
    currentSpread === 1
      ? 1
      : POCKETS_PER_PAGE + (currentSpread - 2) * POCKETS_PER_SPREAD + 1;
  const spreadPocketCount =
    currentSpread === 1 ? POCKETS_PER_PAGE : POCKETS_PER_SPREAD;

  const slots = Array.from({ length: spreadPocketCount }, (_, index) => {
    const pocketNumber = spreadStartPocket + index;
    return pocketNumber <= TOTAL_POCKETS
      ? buildSlot(pocketNumber, { collectedIds, highlightedId })
      : null;
  }).filter(Boolean);

  return {
    slots,
    leftPageSlots: slots.slice(0, POCKETS_PER_PAGE),
    rightPageSlots: slots.slice(POCKETS_PER_PAGE, POCKETS_PER_SPREAD),
    leftPageNumber:
      currentSpread === 1 ? 1 : (currentSpread - 2) * PAGES_PER_SPREAD + 2,
    rightPageNumber:
      currentSpread === 1
        ? null
        : (currentSpread - 2) * PAGES_PER_SPREAD + 2 + 1,
  };
}