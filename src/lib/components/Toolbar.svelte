<script>
  import pokedex from "../../data/pokemon.json";
  import {
    session,
    toggleMode,
    toggleCompareMode,
    jumpToNextMissing,
    randomPokemon,
  } from "../state/session.svelte.js";
  import { collection } from "../state/collection.svelte.js";
  import Icon from "./Icon.svelte";
  import IconButton from "./IconButton.svelte";
  import StatBadge from "./StatBadge.svelte";
  import SearchBar from "./SearchBar.svelte";
  import FilterModal from "./FilterModal.svelte";
  import SettingsModal from "./SettingsModal.svelte";
</script>

<header class="shrink-0 pb-2">
  <div class="flex flex-col gap-2 md:flex-row md:items-center">
    <div class="order-2 flex min-w-0 items-center gap-2 text-sm md:order-1">
      {#if !session.isMobile}
        <button
          class="h-11 shrink-0 border border-slate-300 p-2 md:h-10 dark:border-slate-700 dark:bg-slate-800"
          onclick={toggleMode}
          aria-label="Toggle binder and list mode"
        >
          <Icon name={session.mode === "list" ? "book-open" : "list"} class="" />
        </button>
      {/if}

      <button
        class={`h-11 shrink-0 border p-2 md:h-10 ${session.mode === "compare" ? "border-red-500 text-red-700 dark:border-red-400 dark:text-red-400" : "border-slate-300 dark:border-slate-700 dark:bg-slate-800"}`}
        onclick={toggleCompareMode}
        aria-label="Toggle compare view"
        title="Compare collections"
      >
        <Icon name="compare" class="" />
      </button>

      <StatBadge
        label="Collected"
        value={`${collection.collectedCount}/${pokedex.count}`}
        colorClass="border-green-500"
        showLabel={!session.isMobile}
      />
      <StatBadge
        label="Missing"
        value={pokedex.count - collection.collectedCount}
        colorClass="border-red-500"
        showLabel={!session.isMobile}
      />
      <StatBadge
        label="Progress"
        value={`${collection.progressPercent}%`}
        colorClass="border-sky-500"
        showLabel={!session.isMobile}
      />

      <button
        class="h-10 min-w-0 flex-1 shrink truncate border border-slate-300 bg-white px-2 text-left font-bold transition hover:border-red-500 hover:text-red-700 disabled:opacity-35 md:max-w-[220px] md:flex-none dark:border-slate-700 dark:bg-slate-800 dark:hover:border-red-400 dark:hover:text-red-400"
        disabled={!collection.nextMissing}
        onclick={jumpToNextMissing}
      >
        {collection.nextMissing
          ? `Missing #${collection.nextMissing.id} ${collection.nextMissing.name}`
          : "Complete"}
      </button>
    </div>

    <div class="order-1 flex min-w-0 items-center gap-2 md:flex-1 md:order-2">
      <SearchBar />

      <FilterModal />

      {#if !session.isMobile}
        <IconButton onclick={randomPokemon} title="Random missing Pokémon" ariaLabel="Random missing Pokémon">
          <Icon name="circle-question-mark" />
        </IconButton>
      {/if}

      <SettingsModal />
    </div>
  </div>
</header>

