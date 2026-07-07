export function isCollected(slot) {
  return slot.collected;
}

export function isHighlighted(slot) {
  return slot.highlighted;
}

export function cardStateClass(slot) {
  if (!slot.pokemon) {
    return "border-dashed border-slate-300 bg-slate-100/70 text-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-600";
  }

  if (isHighlighted(slot) && isCollected(slot)) {
    return "border-blue-500 border-4 bg-gray-200/80 opacity-70 dark:bg-slate-700/80 dark:border-blue-400";
  }

  if (isHighlighted(slot)) {
    return "bg-yellow-300/50 shadow-sm";
  }

  if (isCollected(slot)) {
    return "border-gray-300 bg-gray-200/80 opacity-70 dark:border-slate-600 dark:bg-slate-700/80";
  }

  return "border-slate-300 bg-white hover:border-red-500 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-red-400";
}

export function listCardStateClass(pokemon, { collectedIds, highlightedId }) {
  const collected = collectedIds.has(pokemon.id);
  const highlighted = highlightedId === pokemon.id;

  if (highlighted && collected) {
    return "border-blue-500 border-4 bg-gray-200/80 opacity-70 dark:bg-slate-700/80 dark:border-blue-400";
  }

  if (highlighted) {
    return "border-slate-300 bg-yellow-300/50 shadow-sm dark:border-slate-700";
  }

  if (collected) {
    return "border-gray-300 bg-gray-200/80 opacity-70 dark:border-slate-600 dark:bg-slate-700/80";
  }

  return "border-slate-300 bg-white hover:border-red-500 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-red-400";
}