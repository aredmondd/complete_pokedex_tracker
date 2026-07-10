<script>
  import { THEME_STORAGE_KEY, FILTER_STORAGE_KEY } from "./lib/utils/constants.js";
  import { collection, loadCollection, reset } from "./lib/state/collection.svelte.js";
  import { auth, initAuth } from "./lib/state/auth.svelte.js";
  import { theme } from "./lib/state/theme.svelte.js";
  import { session, handleWheel, handleGlobalShortcuts, loadFilters, serializeFilters, initMobileDetection } from "./lib/state/session.svelte.js";

  import Toolbar from "./lib/components/Toolbar.svelte";
  import BinderView from "./lib/components/BinderView.svelte";
  import ListView from "./lib/components/ListView.svelte";
  import SpreadNav from "./lib/components/SpreadNav.svelte";
  import AuthView from "./lib/components/AuthView.svelte";

  let didInit = false;
  let searchDebounceTimer = null;

  $effect(() => {
    if (didInit) return;
    didInit = true;
    initAuth();
    initMobileDetection();
  });

  $effect(() => {
    const user = auth.current;
    if (user) {
      loadCollection();
    } else {
      reset();
    }
  });

  $effect(() => {
    if (typeof document === "undefined") return;

    document.documentElement.classList.toggle("dark", theme.current === "dark");

    if (typeof localStorage !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, theme.current);
    }
  });

  $effect(() => {
    if (typeof localStorage === "undefined") return;
    loadFilters(localStorage.getItem(FILTER_STORAGE_KEY));
  });

  $effect(() => {
    if (typeof localStorage === "undefined") return;

    session.selectedGenerations;
    session.selectedTypes;
    session.collectedStatus;

    localStorage.setItem(FILTER_STORAGE_KEY, serializeFilters());
  });

  $effect(() => {
    if (session.mode !== "list" || session.highlightedId === null) return;

    const id = session.highlightedId;

    queueMicrotask(() => {
      if (typeof document === "undefined") return;

      document
        .querySelector(`[data-pokemon-id="${id}"]`)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  });

  $effect(() => {
    const current = session.query;
    const delay = session.isMobile ? 120 : 60;

    clearTimeout(searchDebounceTimer);

    searchDebounceTimer = setTimeout(() => {
      if (session.filterQuery !== current) {
        session.filterQuery = current;
      }
    }, delay);

    return () => clearTimeout(searchDebounceTimer);
  });

  if (typeof window !== "undefined") {
    window.addEventListener("wheel", handleWheel, { passive: false });
  }
</script>

<svelte:head>
  <title>Complete Pokedex Binder</title>
</svelte:head>

{#if auth.loading}
  <main
    class="h-screen bg-[#f7f5ef] text-slate-900 dark:bg-slate-900 dark:text-slate-100"
  >
    <div class="flex h-full items-center justify-center text-sm font-medium">
      Loading…
    </div>
  </main>
{:else if !auth.current}
  <AuthView />
{:else}
  <main
    class="h-screen overflow-hidden bg-[#f7f5ef] text-slate-900 dark:bg-slate-900 dark:text-slate-100"
  >
    <section class="flex h-full w-full flex-col gap-2 px-2 py-2">
      <Toolbar />

      {#if session.mode === "binder"}
        <BinderView />
        <SpreadNav />
      {:else}
        <ListView />
      {/if}
    </section>
  </main>
{/if}

<svelte:window onkeydown={handleGlobalShortcuts} />