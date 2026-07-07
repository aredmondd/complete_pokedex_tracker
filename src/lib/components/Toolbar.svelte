<script>
  import pokedex from "../../data/pokemon.json";
  import {
    session,
    toggleMode,
    toggleHidden,
    toggleShiny,
    jumpToNextMissing,
    randomPokemon,
  } from "../state/session.svelte.js";
  import {
    collection,
    exportCollection,
    importCollection,
  } from "../state/collection.svelte.js";
  import { theme, toggleTheme } from "../state/theme.svelte.js";
  import {
    TOTAL_POCKETS,
    POCKETS_PER_PAGE,
    POCKETS_PER_SPREAD,
  } from "../utils/constants.js";
  import Icon from "./Icon.svelte";
  import IconButton from "./IconButton.svelte";
  import StatBadge from "./StatBadge.svelte";
  import SearchBar from "./SearchBar.svelte";
  import SpreadNav from "./SpreadNav.svelte";

  let importInput = $state(null);
</script>

<header
  class="shrink-0 border-b border-slate-300/80 pb-2 dark:border-slate-700/80"
>
  <div class="flex min-w-0 items-center gap-2 text-sm">
    <button
      class="border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
      onclick={toggleMode}
      aria-label="Toggle binder and list mode"
    >
      <Icon name={session.mode === "list" ? "book-open" : "list"} class="" />
    </button>

    <StatBadge label="Collected" value={`${collection.collectedCount}/${pokedex.count}`} colorClass="border-green-500" />
    <StatBadge label="Missing" value={pokedex.count - collection.collectedCount} colorClass="border-red-500" />
    <StatBadge label="Progress" value={`${collection.progressPercent}%`} colorClass="border-sky-500" />

    <button
      class="h-10 max-w-[220px] shrink truncate border border-slate-300 bg-white px-2 text-left font-bold transition hover:border-red-500 hover:text-red-700 disabled:opacity-35 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-red-400 dark:hover:text-red-400"
      disabled={!collection.nextMissing}
      onclick={jumpToNextMissing}
      title={collection.nextMissing
        ? `Next Missing: #${collection.nextMissing.id} ${collection.nextMissing.name}`
        : "Complete"}
    >
      {collection.nextMissing
        ? `Missing #${collection.nextMissing.id} ${collection.nextMissing.name}`
        : "Complete"}
    </button>

    <SearchBar />
    <SpreadNav />

    <IconButton onclick={() => exportCollection({
      totalPockets: TOTAL_POCKETS,
      pocketsPerPage: POCKETS_PER_PAGE,
      pocketsPerSpread: POCKETS_PER_SPREAD,
    })}><Icon name="download" class="" /></IconButton>

    <IconButton onclick={() => importInput?.click()}><Icon name="upload" class="" /></IconButton>
    <input
      class="hidden"
      bind:this={importInput}
      type="file"
      accept="application/json"
      onchange={importCollection}
    />

    <IconButton ariaLabel="Toggle light and dark mode" onclick={toggleTheme}>
      <Icon name={theme.current === "dark" ? "sun" : "moon"} class="" />
    </IconButton>

    <div class={session.mode === "binder" ? "opacity-35" : ""}>
      <IconButton
        onclick={toggleHidden}
        title="Toggle Collected Pokemon (List View)"
      >
        <Icon name={session.hidden ? "eye" : "eye-off"} class="" />
      </IconButton>
    </div>

    <IconButton onclick={toggleShiny} title="Toggle Shiny Versions">
      <Icon name="sparkles" class="" />
    </IconButton>

    <IconButton onclick={randomPokemon} title="Random Pokemon you have not collected">
      <Icon name="circle-question-mark" class="" />
    </IconButton>
  </div>
</header>