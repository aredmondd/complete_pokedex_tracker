<script>
  import pokedex from "../../data/pokemon.json";
  import { session, toggleMode, jumpToNextMissing } from "../state/session.svelte.js";
  import { collection } from "../state/collection.svelte.js";
  import Icon from "./Icon.svelte";
  import StatBadge from "./StatBadge.svelte";
  import SearchBar from "./SearchBar.svelte";
  import SpreadNav from "./SpreadNav.svelte";
  import SettingsModal from "./SettingsModal.svelte";
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

    <SettingsModal />
  </div>
</header>