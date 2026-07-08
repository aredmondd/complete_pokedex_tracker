<script>
  import {
    session,
    toggleHidden,
    toggleShiny,
  } from "../state/session.svelte.js";
  import {
    collection,
    exportCollection,
    importCollection,
  } from "../state/collection.svelte.js";
  import { theme, toggleTheme } from "../state/theme.svelte.js";
  import { signOut } from "../state/auth.svelte.js";
  import {
    TOTAL_POCKETS,
    POCKETS_PER_PAGE,
    POCKETS_PER_SPREAD,
    SHINY_DIRECTORY,
  } from "../utils/constants.js";
  import Icon from "./Icon.svelte";
  import IconButton from "./IconButton.svelte";

  let open = $state(false);
  let dialog = $state(null);
  let importInput = $state(null);
  let creditsOpen = $state(false);
  let creditsDialog = $state(null);
  let tipsOpen = $state(false);
  let tipsDialog = $state(null);

  function show() {
    open = true;
  }

  function close() {
    open = false;
  }

  function showCredits() {
    creditsOpen = true;
  }

  function closeCredits() {
    creditsOpen = false;
  }

  function showTips() {
    tipsOpen = true;
  }

  function closeTips() {
    tipsOpen = false;
  }

  $effect(() => {
    if (open) {
      dialog?.showModal();
    } else {
      dialog?.close();
    }
  });

  $effect(() => {
    if (creditsOpen) {
      creditsDialog?.showModal();
    } else {
      creditsDialog?.close();
    }
  });

  $effect(() => {
    if (tipsOpen) {
      tipsDialog?.showModal();
    } else {
      tipsDialog?.close();
    }
  });

  function handleBackdrop(event) {
    if (event.target === dialog) {
      close();
    }
  }

  function handleCreditsBackdrop(event) {
    if (event.target === creditsDialog) {
      closeCredits();
    }
  }

  function handleTipsBackdrop(event) {
    if (event.target === tipsDialog) {
      closeTips();
    }
  }

  function handleExport() {
    exportCollection({
      totalPockets: TOTAL_POCKETS,
      pocketsPerPage: POCKETS_PER_PAGE,
      pocketsPerSpread: POCKETS_PER_SPREAD,
    });
  }

  </script>

<IconButton onclick={show} title="Settings" ariaLabel="Settings">
  <Icon name="settings" />
</IconButton>

<dialog
  bind:this={dialog}
  class="m-auto w-full max-w-sm rounded-lg border border-slate-300 bg-white p-0 shadow-xl backdrop:bg-slate-900/80 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
  onclick={handleBackdrop}
  onclose={() => (open = false)}
>
  <div class="p-4">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-bold">Settings</h2>
      <button
        class="p-1 transition hover:text-red-600 dark:hover:text-red-400"
        onclick={close}
        aria-label="Close settings"
      >
        <Icon name="x" />
      </button>
    </div>

    <div class="flex flex-col gap-2">
      <button
        class="flex items-center gap-3 border border-slate-300 px-3 py-2 text-left font-medium transition hover:border-red-500 hover:text-red-700 dark:border-slate-700 dark:hover:border-red-400 dark:hover:text-red-400"
        onclick={handleExport}
      >
        <Icon name="download" />
        Export collection
      </button>

      <button
        class="flex items-center gap-3 border border-slate-300 px-3 py-2 text-left font-medium transition hover:border-red-500 hover:text-red-700 dark:border-slate-700 dark:hover:border-red-400 dark:hover:text-red-400"
        onclick={() => importInput?.click()}
      >
        <Icon name="upload" />
        Import collection
      </button>
      <input
        class="hidden"
        bind:this={importInput}
        type="file"
        accept="application/json"
        onchange={importCollection}
      />

      <button
        class="flex items-center gap-3 border border-slate-300 px-3 py-2 text-left font-medium transition hover:border-red-500 hover:text-red-700 dark:border-slate-700 dark:hover:border-red-400 dark:hover:text-red-400"
        onclick={toggleTheme}
      >
        <Icon name={theme.current === "dark" ? "sun" : "moon"} />
        {theme.current === "dark" ? "Light mode" : "Dark mode"}
      </button>

      <button
        class="flex items-center gap-3 border border-slate-300 px-3 py-2 text-left font-medium transition hover:border-red-500 hover:text-red-700 disabled:opacity-35 dark:border-slate-700 dark:hover:border-red-400 dark:hover:text-red-400"
        disabled={session.mode === "binder"}
        onclick={toggleHidden}
      >
        <Icon name={session.hidden ? "eye" : "eye-off"} />
        {session.hidden
          ? "Show collected (list view)"
          : "Hide collected (list view)"}
      </button>

      <button
        class="flex items-center gap-3 border border-slate-300 px-3 py-2 text-left font-medium transition hover:border-red-500 hover:text-red-700 dark:border-slate-700 dark:hover:border-red-400 dark:hover:text-red-400"
        onclick={toggleShiny}
      >
        <Icon name="sparkles" />
        {session.directory === SHINY_DIRECTORY
          ? "Normal sprites"
          : "Shiny sprites"}
      </button>

<button
        class="flex items-center gap-3 border border-slate-300 px-3 py-2 text-left font-medium transition hover:border-red-500 hover:text-red-700 dark:border-slate-700 dark:hover:border-red-400 dark:hover:text-red-400"
        onclick={showCredits}
      >
        <Icon name="scroll" />
        Credits
      </button>

      <button
        class="flex items-center gap-3 border border-slate-300 px-3 py-2 text-left font-medium transition hover:border-red-500 hover:text-red-700 dark:border-slate-700 dark:hover:border-red-400 dark:hover:text-red-400"
        onclick={showTips}
      >
        <Icon name="info" />
        Tips
      </button>

      <button
        class="flex items-center gap-3 border border-slate-300 px-3 py-2 text-left font-medium transition hover:border-red-500 hover:text-red-700 dark:border-slate-700 dark:hover:border-red-400 dark:hover:text-red-400"
        onclick={signOut}
      >
        <Icon name="log-out" />
        Sign out
      </button>
     </div>
   </div>
</dialog>

<dialog
  bind:this={creditsDialog}
  class="m-auto w-full max-w-md rounded-lg border border-slate-300 bg-white p-0 shadow-xl backdrop:bg-slate-900/80 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
  onclick={handleCreditsBackdrop}
  onclose={() => (creditsOpen = false)}
>
  <div class="p-4">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-bold">Credits</h2>
      <button
        class="p-1 transition hover:text-red-600 dark:hover:text-red-400"
        onclick={closeCredits}
        aria-label="Close credits"
      >
        <Icon name="x" />
      </button>
    </div>

    <div class="min-h-[200px]">
    </div>
  </div>
</dialog>

<dialog
  bind:this={tipsDialog}
  class="m-auto w-full max-w-md rounded-lg border border-slate-300 bg-white p-0 shadow-xl backdrop:bg-slate-900/80 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
  onclick={handleTipsBackdrop}
  onclose={() => (tipsOpen = false)}
>
  <div class="p-4">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-bold">Tips</h2>
      <button
        class="p-1 transition hover:text-red-600 dark:hover:text-red-400"
        onclick={closeTips}
        aria-label="Close tips"
      >
        <Icon name="x" />
      </button>
    </div>

    <div class="min-h-[200px]">
    </div>
  </div>
</dialog>
