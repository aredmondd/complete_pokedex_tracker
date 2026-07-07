<script>
  import {
    session,
    handleSearchInput,
    handleSearchSubmit,
    setSearchInput,
  } from "../state/session.svelte.js";

  let el = $state(null);
  $effect(() => {
    setSearchInput(el);
  });
</script>

<form class="flex h-10 min-w-[180px] flex-1 gap-1" onsubmit={handleSearchSubmit}>
  <input
    class="min-w-0 flex-1 border border-slate-300 bg-white px-2 text-sm outline-none ring-red-600 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
    bind:value={session.query}
    bind:this={el}
    oninput={handleSearchInput}
    placeholder={"Filter by name or number"}
  />
</form>