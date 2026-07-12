<script>
  import { onMount } from "svelte";
  import {
    compare,
    loadCompareUsers,
    selectCompareUser,
    exportComparisonCsv,
  } from "../state/compare.svelte.js";
  import Icon from "./Icon.svelte";
  import IconButton from "./IconButton.svelte";
  import CompareSection from "./CompareSection.svelte";

  onMount(() => {
    if (compare.users.length === 0 && !compare.usersLoading && !compare.usersError) {
      loadCompareUsers();
    }
  });

  function handleSelect(event) {
    const userId = event.currentTarget.value;
    selectCompareUser(userId || null);
  }
</script>

<section
  class="min-h-0 min-w-0 flex-1 overflow-y-auto bg-white/75 p-3 shadow-pocket ring-1 ring-slate-300 dark:bg-slate-800/75 dark:ring-slate-700"
>
  <div
    class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
  >
    <div>
      <h2 class="text-base font-black text-slate-950 dark:text-slate-50">
        Collection Compare
      </h2>
      <p class="text-xs font-medium text-slate-500 dark:text-slate-400">
        Select another trainer to compare
      </p>
    </div>

    <div class="flex items-center gap-2">
      <select
        class="h-11 min-w-0 flex-1 truncate border border-slate-300 bg-white px-2 text-sm font-medium md:h-10 dark:border-slate-700 dark:bg-slate-800"
        value={compare.selectedUserId ?? ""}
        onchange={handleSelect}
        disabled={compare.usersLoading || compare.users.length === 0}
      >
        <option value="">Choose a user…</option>
        {#each compare.users as user (user.id)}
          <option value={user.id}>{user.email}</option>
        {/each}
      </select>

      <IconButton
        onclick={loadCompareUsers}
        title="Refresh user list"
        ariaLabel="Refresh user list"
      >
        <Icon name="refresh-cw" />
      </IconButton>
      <IconButton
        onclick={exportComparisonCsv}
        title="Export comparison CSV"
        ariaLabel="Export comparison CSV"
      >
        <Icon name="download" />
      </IconButton>
    </div>
  </div>

  {#if compare.usersLoading || compare.collectionLoading}
    <p
      class="p-6 text-center text-sm font-bold text-slate-500 dark:text-slate-400"
    >
      Loading…
    </p>
  {:else if compare.usersError}
    <p
      class="p-6 text-center text-sm font-bold text-red-600 dark:text-red-400"
    >
      Failed to load users: {compare.usersError}
    </p>
  {:else if compare.collectionError}
    <p
      class="p-6 text-center text-sm font-bold text-red-600 dark:text-red-400"
    >
      Failed to load collection: {compare.collectionError}
    </p>
  {:else if compare.users.length === 0}
    <p
      class="p-6 text-center text-sm font-bold text-slate-500 dark:text-slate-400"
    >
      No other users found.
    </p>
  {:else if !compare.selectedUserId}
    <p
      class="p-6 text-center text-sm font-bold text-slate-500 dark:text-slate-400"
    >
      Select a user above to see the comparison.
    </p>
  {:else}
    <div class="space-y-4">
      <CompareSection
        title="Both Missing"
        count={compare.bothMissing.length}
        colorClass="border-red-500"
        pokemon={compare.bothMissing}
      />
      <CompareSection
        title="Only You Have"
        count={compare.onlyMine.length}
        colorClass="border-green-500"
        pokemon={compare.onlyMine}
      />
      <CompareSection
        title="Only They Have"
        count={compare.onlyTheirs.length}
        colorClass="border-sky-500"
        pokemon={compare.onlyTheirs}
      />
      <CompareSection
        title="Both Have"
        count={compare.bothHave.length}
        colorClass="border-slate-400"
        pokemon={compare.bothHave}
        collapsed={true}
      />
    </div>
  {/if}
</section>
