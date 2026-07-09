<script>
  import {
    session,
    handleSearchInput,
    handleSearchSubmit,
    setSearchInput,
  } from "../state/session.svelte.js";
  import Icon from "./Icon.svelte";

  let el = $state(null);
  $effect(() => {
    setSearchInput(el);
  });

  function clear() {
    session.query = "";
    el?.focus();
  }
</script>

<form class="flex h-10 min-w-0 flex-1 gap-1" onsubmit={handleSearchSubmit}>
  <div class="relative flex flex-1">
    <input
      class="min-w-0 flex-1 border border-slate-300 bg-white px-2 pr-9 text-sm outline-none ring-red-600 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
      bind:value={session.query}
      bind:this={el}
      oninput={handleSearchInput}
      placeholder={"Filter by name or number"}
    />
    {#if session.query}
      <button
        type="button"
        class="absolute right-0 top-0 flex h-10 w-9 items-center justify-center text-slate-500 transition hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
        onclick={clear}
        aria-label="Clear search"
      >
        <Icon name="x" size={16} />
      </button>
    {/if}
  </div>
</form>