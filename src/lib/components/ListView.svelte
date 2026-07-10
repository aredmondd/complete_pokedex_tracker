<script>
  import pokedex from "../../data/pokemon.json";
  import { session } from "../state/session.svelte.js";
  import { collection, toggleCollectedId } from "../state/collection.svelte.js";
  import { listCardStateClass } from "../utils/card-class.js";

  let LIST_LIMIT = $derived(session.isMobile ? 50 : 100);

  let displayedPokemon = $derived(session.filteredPokemon.slice(0, LIST_LIMIT));
  let hasMore = $derived(session.filteredPokemon.length > LIST_LIMIT);
</script>

<section
  class="min-h-0 min-w-0 flex-1 overflow-y-auto bg-white/75 p-3 shadow-pocket ring-1 ring-slate-300 dark:bg-slate-800/75 dark:ring-slate-700"
>
  <div class="mb-2 flex items-center justify-between gap-3">
    <h3 class="text-base font-black text-slate-950 dark:text-slate-50">
      {session.filterQuery.trim()
        ? `${session.filteredPokemon.length} match${session.filteredPokemon.length === 1 ? "" : "es"}`
        : `All ${pokedex.count} Pokemon`}
    </h3>
  </div>

  {#if session.filteredPokemon.length === 0}
    <p
      class="p-6 text-center text-sm font-bold text-slate-500 dark:text-slate-400"
    >
      No Pokémon match your filters
    </p>
  {:else}
    <div
      class="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 md:gap-2 lg:grid-cols-6 xl:grid-cols-6"
    >
      {#each displayedPokemon as pokemon (pokemon.id)}
        <button
          data-pokemon-id={pokemon.id}
          class={`flex items-center gap-1.5 overflow-hidden border p-1.5 text-left transition focus:outline-none focus:ring-2 focus:ring-red-600 md:gap-2 md:p-2 ${listCardStateClass(pokemon, {
            collectedIds: collection.collectedIds,
            highlightedId: session.highlightedId,
          })}`}
          style="contain: layout style paint;"
          aria-pressed={collection.collectedIds.has(pokemon.id)}
          onclick={() => toggleCollectedId(pokemon.id)}
        >
          <img
            src={`${session.directory}${pokemon.id}.png`}
            loading="lazy"
            decoding="async"
            class={`h-10 w-10 shrink-0 md:h-14 md:w-14 ${collection.collectedIds.has(pokemon.id) ? "grayscale blur-[1px]" : ""}`}
            alt="pokemon sprite"
          />
          <div class="min-w-0">
            <span
              class="block text-[10px] font-black text-slate-500 dark:text-slate-400 md:text-[12px]"
              >#{String(pokemon.id).padStart(4, "0")}</span
            >
            <span
              class="block truncate text-sm font-black text-slate-950 md:text-lg dark:text-slate-50"
              >{pokemon.name}</span
            >
          </div>
        </button>
      {/each}
    </div>

    {#if hasMore}
      <p
        class="p-4 text-center text-xs font-bold text-slate-500 dark:text-slate-400"
      >
        Showing the first {LIST_LIMIT} of {session.filteredPokemon.length} Pokémon.
        Type more to narrow results.
      </p>
    {/if}
  {/if}
</section>