import { THEME_STORAGE_KEY } from "../utils/constants.js";

function loadInitialTheme() {
  if (typeof localStorage !== "undefined") {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  }

  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
}

let current = $state(loadInitialTheme());

export const theme = {
  get current() {
    return current;
  },
  set current(value) {
    current = value;
  },
};

export function toggleTheme() {
  current = current === "dark" ? "light" : "dark";
}