<script>
  import { session } from "../state/session.svelte.js";
  import {
    cardStateClass,
    isCollected,
  } from "../utils/card-class.js";

  let { pageNumber, slots, onToggle, directory } = $props();
</script>

<section
  class="flex min-h-0 flex-col bg-white/75 p-2 shadow-pocket ring-1 ring-slate-300 dark:bg-slate-800/75 dark:ring-slate-700"
>
  <div class="mb-2 flex h-7 shrink-0 items-center justify-between gap-3">
    <h3 class="text-base font-black text-slate-950 dark:text-slate-50">
      Page {pageNumber}
    </h3>
  </div>

  <div class="grid min-h-0 flex-1 grid-cols-4 grid-rows-4 gap-2">
    {#if slots}
      {#each slots as slot}
        <button
          class={`min-h-0 overflow-hidden border p-2 text-left transition focus:outline-none focus:ring-2 focus:ring-red-600 ${cardStateClass(slot)}`}
          aria-pressed={isCollected(slot)}
          disabled={!slot.pokemon}
          onclick={() => onToggle(slot)}
        >
          {#if slot.pokemon}
            <div class="flex h-full min-h-0 flex-col justify-between gap-1">
              <div>
                <div class="flex items-start justify-between gap-2">
                  <span
                    class="text-xs font-black text-slate-500 dark:text-slate-400"
                    >#{String(slot.pocketNumber).padStart(4, "0")}</span
                  >
                </div>
                <p
                  class="mt-1 whitespace-normal break-words text-[clamp(0.68rem,1.1vw,0.95rem)] font-black leading-[1.08] text-slate-950 dark:text-slate-50"
                >
                  {slot.pokemon.name}
                </p>
              </div>

              <div class="flex flex-1 items-center justify-center">
                <img
                  src={`${directory}${slot.pokemon.id}.png`}
                  class={isCollected(slot) ? "grayscale blur-[1px]" : ""}
                  alt="pokemon sprite"
                />
              </div>
            </div>
          {:else}
            <div class="flex h-full flex-col justify-between">
              <span class="text-xs font-black"
                >#{String(slot.pocketNumber).padStart(4, "0")}</span
              >
              <span class="text-xs font-bold uppercase tracking-normal"
                >Reserved</span
              >
            </div>
          {/if}
        </button>
      {/each}
    {/if}
  </div>
</section>