<script>
  import { STORAGE_KEY, THEME_STORAGE_KEY } from "./lib/utils/constants.js";
  import { collection } from "./lib/state/collection.svelte.js";
  import { theme } from "./lib/state/theme.svelte.js";
  import { session, handleWheel, handleGlobalShortcuts } from "./lib/state/session.svelte.js";
  import Toolbar from "./lib/components/Toolbar.svelte";
  import BinderView from "./lib/components/BinderView.svelte";
  import ListView from "./lib/components/ListView.svelte";

  $effect(() => {
    if (typeof localStorage === "undefined") return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        updatedAt: new Date().toISOString(),
        collectedIds: [...collection.collectedIds].sort(
          (left, right) => left - right,
        ),
      }),
    );
  });

  $effect(() => {
    if (typeof document === "undefined") return;

    document.documentElement.classList.toggle("dark", theme.current === "dark");

    if (typeof localStorage !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, theme.current);
    }
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

  if (typeof window !== "undefined") {
    window.addEventListener("wheel", handleWheel, { passive: false });
  }
</script>

<svelte:head>
  <title>Complete Pokedex Binder</title>
</svelte:head>

<main
  class="h-screen overflow-hidden bg-[#f7f5ef] text-slate-900 dark:bg-slate-900 dark:text-slate-100"
>
  <section class="flex h-full w-full flex-col gap-2 px-2 py-2">
    <Toolbar />

    {#if session.mode === "binder"}
      <BinderView />
    {:else}
      <ListView />
    {/if}
  </section>
</main>

<svelte:window onkeydown={handleGlobalShortcuts} />