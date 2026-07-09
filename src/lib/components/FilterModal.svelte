<script>
  import {
    session,
    toggleGenerationFilter,
    toggleTypeFilter,
    resetFilters,
    ALL_GENERATIONS,
    ALL_TYPES,
  } from "../state/session.svelte.js";
  import Icon from "./Icon.svelte";
  import IconButton from "./IconButton.svelte";

  let open = $state(false);
  let dialog = $state(null);

  function show() {
    open = true;
  }

  function close() {
    open = false;
  }

  $effect(() => {
    if (open) {
      dialog?.showModal();
    } else {
      dialog?.close();
    }
  });

  function handleBackdrop(event) {
    if (event.target === dialog) {
      close();
    }
  }

  function handleReset() {
    resetFilters();
  }
</script>

<IconButton onclick={show} title="Filters" ariaLabel="Filters" disabled={session.mode === "binder"}>
  <div class="relative">
    <Icon name="filter" />
    {#if session.filterCount > 0}
      <span
        class="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white"
      >
        {session.filterCount}
      </span>
    {/if}
  </div>
</IconButton>

<dialog
  bind:this={dialog}
  class="m-auto w-full max-w-sm rounded-lg border border-slate-300 bg-white p-0 shadow-xl backdrop:bg-slate-900/80 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
  onclick={handleBackdrop}
  onclose={() => (open = false)}
>
  <div class="flex max-h-[80vh] flex-col">
    <div class="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
      <h2 class="text-lg font-bold">Filters</h2>
      <div class="flex items-center gap-1">
        <button
          class="px-2 py-1 text-sm font-medium text-red-600 transition hover:text-red-700 disabled:opacity-35 dark:text-red-400 dark:hover:text-red-300"
          disabled={session.filterCount === 0}
          onclick={handleReset}
        >
          Clear all
        </button>
        <button
          class="p-1 transition hover:text-red-600 dark:hover:text-red-400"
          onclick={close}
          aria-label="Close filters"
        >
          <Icon name="x" />
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-4">
      <div class="mb-4">
        <h3 class="mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
          Collected status
        </h3>
        <div class="grid grid-cols-3 gap-2">
          {#each ["all", "collected", "missing"] as status}
            <button
              class={`border px-2 py-1.5 text-sm font-bold transition ${
                session.collectedStatus === status
                  ? "border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-500"
                  : "border-slate-300 hover:border-red-500 hover:text-red-700 dark:border-slate-700 dark:hover:border-red-400 dark:hover:text-red-400"
              }`}
              onclick={() => (session.collectedStatus = status)}
            >
              {status[0].toUpperCase()}{status.slice(1)}
            </button>
          {/each}
        </div>
      </div>

      <div class="mb-4">
        <h3 class="mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
          Generations
        </h3>
        <div class="grid grid-cols-5 gap-2">
          {#each ALL_GENERATIONS as generation}
            <label
              class={`flex cursor-pointer items-center justify-center border p-2 text-sm font-bold transition ${
                session.selectedGenerations.has(generation)
                  ? "border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-500"
                  : "border-slate-300 text-slate-700 hover:border-red-500 hover:text-red-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-400 dark:hover:text-red-400"
              }`}
            >
              <input
                type="checkbox"
                class="sr-only"
                checked={session.selectedGenerations.has(generation)}
                onchange={() => toggleGenerationFilter(generation)}
              />
              {generation}
            </label>
          {/each}
        </div>
      </div>

      <div>
        <h3 class="mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
          Types
        </h3>
        <div class="grid grid-cols-3 gap-2">
          {#each ALL_TYPES as type}
            <label
              class={`flex cursor-pointer items-center justify-center border px-2 py-1.5 text-xs font-bold transition ${
                session.selectedTypes.has(type)
                  ? "border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-500"
                  : "border-slate-300 text-slate-700 hover:border-red-500 hover:text-red-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-400 dark:hover:text-red-400"
              }`}
            >
              <input
                type="checkbox"
                class="sr-only"
                checked={session.selectedTypes.has(type)}
                onchange={() => toggleTypeFilter(type)}
              />
              {type}
            </label>
          {/each}
        </div>
      </div>
    </div>
  </div>
</dialog>
