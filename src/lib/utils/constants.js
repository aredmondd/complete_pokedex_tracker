export const TOTAL_POCKETS = 1088;
export const POCKETS_PER_PAGE = 16;
export const PAGES_PER_SPREAD = 2;
export const POCKETS_PER_SPREAD = POCKETS_PER_PAGE * PAGES_PER_SPREAD;
export const TOTAL_SPREADS =
  1 + Math.ceil((TOTAL_POCKETS - POCKETS_PER_PAGE) / POCKETS_PER_SPREAD);
export const STORAGE_KEY = "complete-pokedex.collection.v1";
export const THEME_STORAGE_KEY = "complete-pokedex.theme.v1";
export const SPRITE_DIRECTORY = "/sprites/pokemon/";
export const SHINY_DIRECTORY = "/sprites/pokemon/shiny/";