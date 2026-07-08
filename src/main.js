import "./app.css";
import App from "./App.svelte";
import { mount } from "svelte";
import pokedex from "./data/pokemon.json";
import { SPRITE_DIRECTORY } from "./lib/utils/constants.js";

const app = mount(App, {
  target: document.getElementById("app")
});

const preloadSprites = () => {
  for (const pokemon of pokedex.pokemon) {
    new Image().src = `${SPRITE_DIRECTORY}${pokemon.id}.png`;
  }
};

if ("requestIdleCallback" in window) {
  requestIdleCallback(preloadSprites, { timeout: 3000 });
} else {
  setTimeout(preloadSprites, 2000);
}

export default app;
