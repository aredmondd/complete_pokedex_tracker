<script>
  import { session } from "../state/session.svelte.js";

  let { title, count, colorClass, pokemon, collapsed = false } = $props();

  let isOpen = $state(true);
  let initialized = false;

  $effect.pre(() => {
    if (!initialized && collapsed) {
      initialized = true;
      isOpen = false;
    }
  });
</script>

<div
  class={`border-l-4 ${colorClass} bg-white/75 p-3 shadow-sm dark:bg-slate-800/75`}
>
  <button
    class="flex w-full items-center justify-between"
    onclick={() => (isOpen = !isOpen)}
  >
    <h3 class="text-base font-black text-slate-950 dark:text-slate-50">
      {title}
      <span
        class="ml-2 text-sm font-semibold text-slate-500 dark:text-slate-400"
        >{count}</span
      >
    </h3>
    <span class="text-lg font-black text-slate-500 dark:text-slate-400">
      {isOpen ? "−" : "+"}
    </span>
  </button>

  {#if isOpen}
    {#if pokemon.length === 0}
      <p
        class="py-4 text-center text-sm font-bold text-slate-500 dark:text-slate-400"
      >
        None
      </p>
    {:else}
      <div
        class="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 md:gap-2 lg:grid-cols-6 xl:grid-cols-6"
      >
        {#each pokemon as pokemon (pokemon.id)}
          <div
            class="flex items-center gap-1.5 overflow-hidden border border-slate-300 bg-white p-1.5 dark:border-slate-700 dark:bg-slate-800"
          >
            <img
              src={`${session.directory}${pokemon.id}.png`}
              loading="lazy"
              decoding="async"
              class="h-10 w-10 shrink-0 md:h-14 md:w-14"
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
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>
