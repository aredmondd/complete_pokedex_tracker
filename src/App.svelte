<script>
  import pokedex from "./data/pokemon.json";

  const TOTAL_POCKETS = 1088;
  const POCKETS_PER_PAGE = 16;
  const PAGES_PER_SPREAD = 2;
  const POCKETS_PER_SPREAD = POCKETS_PER_PAGE * PAGES_PER_SPREAD;
  const TOTAL_SPREADS =
    1 + Math.ceil((TOTAL_POCKETS - POCKETS_PER_PAGE) / POCKETS_PER_SPREAD);
  const STORAGE_KEY = "complete-pokedex.collection.v1";
  const THEME_STORAGE_KEY = "complete-pokedex.theme.v1";
  // change this to be "/sprites/pokemon/shiny/" to use shiny versions for your art!
  const SPRITE_DIRECTORY = "/sprites/pokemon/";

  const pokemonById = new Map(
    pokedex.pokemon.map((pokemon) => [pokemon.id, pokemon]),
  );

  // --- reactive state (runes) ---
  let currentSpread = $state(1);
  let collectedIds = $state(loadInitialCollection());
  let highlightedId = $state(null);
  let query = $state("");
  let theme = $state(loadInitialTheme());

  // plain refs, not reactive state — only ever used imperatively
  let importInput;
  let searchInput;

  // --- derived state ---
  let collectedCount = $derived(collectedIds.size);
  let progressPercent = $derived(
    Math.round((collectedCount / pokedex.count) * 100),
  );
  let spreadStartPocket = $derived(
    currentSpread === 1
      ? 1
      : POCKETS_PER_PAGE + (currentSpread - 2) * POCKETS_PER_SPREAD + 1,
  );
  let spreadPocketCount = $derived(
    currentSpread === 1 ? POCKETS_PER_PAGE : POCKETS_PER_SPREAD,
  );
  let spreadSlots = $derived(
    Array.from({ length: spreadPocketCount }, (_, index) => {
      const pocketNumber = spreadStartPocket + index;
      return pocketNumber <= TOTAL_POCKETS ? buildSlot(pocketNumber) : null;
    }).filter(Boolean),
  );
  let leftPageSlots = $derived(spreadSlots.slice(0, POCKETS_PER_PAGE));
  let rightPageSlots = $derived(
    spreadSlots.slice(POCKETS_PER_PAGE, POCKETS_PER_SPREAD),
  );
  let leftPageNumber = $derived(
    currentSpread === 1 ? 1 : (currentSpread - 2) * PAGES_PER_SPREAD + 2,
  );
  let rightPageNumber = $derived(
    currentSpread === 1 ? null : leftPageNumber + 1,
  );
  let nextMissing = $derived(findNextMissing());

  // --- persistence effects ---
  $effect(() => {
    if (typeof localStorage === "undefined") return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        updatedAt: new Date().toISOString(),
        collectedIds: [...collectedIds].sort((left, right) => left - right),
      }),
    );
  });

  $effect(() => {
    if (typeof document === "undefined") return;

    document.documentElement.classList.toggle("dark", theme === "dark");

    if (typeof localStorage !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  });

  function loadInitialCollection() {
    if (typeof localStorage === "undefined") return new Set();

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return new Set();

    try {
      const parsed = JSON.parse(saved);
      return new Set(parsed.collectedIds ?? []);
    } catch {
      return new Set();
    }
  }

  function loadInitialTheme() {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "light" || saved === "dark") return saved;
    }

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }

    return "light";
  }

  function toggleTheme() {
    theme = theme === "dark" ? "light" : "dark";
  }

  function buildSlot(pocketNumber) {
    const pokemon = pokemonById.get(pocketNumber);
    const pageNumber = Math.ceil(pocketNumber / POCKETS_PER_PAGE);
    const pocketOnPage = ((pocketNumber - 1) % POCKETS_PER_PAGE) + 1;

    return {
      pocketNumber,
      pageNumber,
      pocketOnPage,
      pokemon,
      collected: collectedIds.has(pocketNumber),
      highlighted: highlightedId === pocketNumber,
    };
  }

  function toggleCollected(slot) {
    if (!slot.pokemon) return;

    const next = new Set(collectedIds);

    if (next.has(slot.pocketNumber)) {
      next.delete(slot.pocketNumber);
    } else {
      next.add(slot.pocketNumber);
    }

    collectedIds = next;
  }

  function clampSpread(spread) {
    return Math.min(TOTAL_SPREADS, Math.max(1, Number(spread) || 1));
  }

  function setSpread(spread) {
    currentSpread = clampSpread(spread);
  }

  function jumpToId(id) {
    const parsed = Number(id);

    if (!Number.isInteger(parsed) || parsed < 1 || parsed > TOTAL_POCKETS) {
      return;
    }

    highlightedId = parsed;
    currentSpread =
      parsed <= POCKETS_PER_PAGE
        ? 1
        : 2 + Math.floor((parsed - POCKETS_PER_PAGE - 1) / POCKETS_PER_SPREAD);
  }

  function submitSearch() {
    const trimmed = query.trim();

    if (!trimmed) {
      highlightedId = null;
      return;
    }

    const numericQuery = Number(trimmed.replace(/^#/, ""));

    if (Number.isInteger(numericQuery) && numericQuery > 0) {
      jumpToId(numericQuery);
      return;
    }

    const lowerQuery = trimmed.toLowerCase();
    const match =
      pokedex.pokemon.find((pokemon) =>
        pokemon.name.toLowerCase().startsWith(lowerQuery),
      ) ??
      pokedex.pokemon.find((pokemon) =>
        pokemon.name.toLowerCase().includes(lowerQuery),
      );

    if (match) {
      jumpToId(match.id);
    }
  }

  function isCollected(slot) {
    return slot.collected;
  }

  function isHighlighted(slot) {
    return slot.highlighted;
  }

  function cardStateClass(slot) {
    if (!slot.pokemon) {
      return "border-dashed border-slate-300 bg-slate-100/70 text-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-600";
    }

    if (isHighlighted(slot) && isCollected(slot)) {
      return "border-blue-500 border-4 bg-gray-200/80 opacity-70 dark:bg-slate-700/80 dark:border-blue-400";
    }

    if (isHighlighted(slot)) {
      return "bg-yellow-200 shadow-sm dark:bg-yellow-900/50 dark:text-yellow-50";
    }

    if (isCollected(slot)) {
      return "border-gray-300 bg-gray-200/80 opacity-70 dark:border-slate-600 dark:bg-slate-700/80";
    }

    return "border-slate-300 bg-white hover:border-red-500 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-red-400";
  }

  function findNextMissing() {
    return pokedex.pokemon.find((pokemon) => !collectedIds.has(pokemon.id));
  }

  function jumpToNextMissing() {
    if (nextMissing) {
      jumpToId(nextMissing.id);
    }
  }

  function exportCollection() {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      binder: {
        totalPockets: TOTAL_POCKETS,
        pocketsPerPage: POCKETS_PER_PAGE,
        pocketsPerSpread: POCKETS_PER_SPREAD,
      },
      collectedIds: [...collectedIds].sort((left, right) => left - right),
    };
    const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "pokedex-collection.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function importCollection(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const ids = Array.isArray(parsed.collectedIds)
          ? parsed.collectedIds
          : [];
        collectedIds = new Set(
          ids
            .map(Number)
            .filter(
              (id) => Number.isInteger(id) && id >= 1 && id <= pokedex.count,
            ),
        );
      } catch {
        window.alert(
          "That JSON file does not look like a Pokedex collection export.",
        );
      } finally {
        event.target.value = "";
      }
    };

    reader.readAsText(file);
  }

  function handleGlobalShortcuts(event) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();

      query = "";

      searchInput?.focus();
      searchInput?.select();
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    submitSearch();
  }
</script>

<svelte:head>
  <title>Complete Pokedex Binder</title>
</svelte:head>

<main
  class="h-screen overflow-hidden bg-[#f7f5ef] text-slate-900 dark:bg-slate-900 dark:text-slate-100"
>
  <section class="flex h-full w-full flex-col gap-2 px-2 py-2">
    <header
      class="shrink-0 border-b border-slate-300/80 pb-2 dark:border-slate-700/80"
    >
      <div class="flex min-w-0 items-center gap-2 text-sm">
        <div
          class="flex h-10 shrink-0 items-center gap-2 border-l-4 border-red-500 bg-white/75 px-2 shadow-sm dark:bg-slate-800/75"
        >
          <span class="font-semibold text-slate-500 dark:text-slate-400"
            >Collected</span
          >
          <span class="font-black">{collectedCount}/{pokedex.count}</span>
        </div>
        <div
          class="flex h-10 shrink-0 items-center gap-2 border-l-4 border-sky-500 bg-white/75 px-2 shadow-sm dark:bg-slate-800/75"
        >
          <span class="font-semibold text-slate-500 dark:text-slate-400"
            >Progress</span
          >
          <span class="font-black">{progressPercent}%</span>
        </div>
        <button
          class="h-10 max-w-[220px] shrink truncate border border-slate-300 bg-white px-2 text-left font-bold transition hover:border-red-500 hover:text-red-700 disabled:opacity-35 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-red-400 dark:hover:text-red-400"
          disabled={!nextMissing}
          onclick={jumpToNextMissing}
          title={nextMissing
            ? `Next Missing: #${nextMissing.id} ${nextMissing.name}`
            : "Complete"}
        >
          {nextMissing
            ? `Missing #${nextMissing.id} ${nextMissing.name}`
            : "Complete"}
        </button>

        <form
          class="flex h-10 min-w-[180px] flex-1 gap-1"
          onsubmit={handleSearchSubmit}
        >
          <input
            class="min-w-0 flex-1 border border-slate-300 bg-white px-2 text-sm outline-none ring-red-600 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
            bind:value={query}
            bind:this={searchInput}
            oninput={submitSearch}
            placeholder="Name or #"
          />
        </form>

        <div class="flex gap-2 items-center justify-center">
          <button
            class="disabled:opacity-35 border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
            aria-label="Previous spread"
            disabled={currentSpread === 1}
            onclick={() => setSpread(currentSpread - 1)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-move-left-icon lucide-move-left hover:text-blue-500"
              ><path d="M6 8L2 12L6 16" /><path d="M2 12H22" /></svg
            >
          </button>
          <label class="min-w-[120px] max-w-[180px] flex-1">
            <span class="sr-only">Spread</span>
            <input
              class="w-full align-middle accent-red-600"
              type="range"
              min="1"
              max={TOTAL_SPREADS}
              bind:value={currentSpread}
            />
          </label>
          <button
            class="disabled:opacity-35 border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
            aria-label="Next spread"
            disabled={currentSpread === TOTAL_SPREADS}
            onclick={() => setSpread(currentSpread + 1)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-move-right-icon lucide-move-right"
              ><path d="M18 8L22 12L18 16" /><path d="M2 12H22" /></svg
            >
          </button>
        </div>

        <button
          class="h-10 shrink-0 border border-slate-300 bg-white px-2 font-bold transition hover:border-red-500 hover:text-red-700 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-red-400 dark:hover:text-red-400"
          onclick={exportCollection}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-download-icon lucide-download"
            ><path d="M12 15V3" /><path
              d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
            /><path d="m7 10 5 5 5-5" /></svg
          >
        </button>
        <button
          class="h-10 shrink-0 border border-slate-300 bg-white px-2 font-bold transition hover:border-red-500 hover:text-red-700 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-red-400 dark:hover:text-red-400"
          onclick={() => importInput.click()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-upload-icon lucide-upload"
            ><path d="M12 3v12" /><path d="m17 8-5-5-5 5" /><path
              d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
            /></svg
          >
        </button>
        <input
          class="hidden"
          bind:this={importInput}
          type="file"
          accept="application/json"
          onchange={importCollection}
        />

        <button
          class="h-10 shrink-0 border border-slate-300 bg-white px-2 font-bold transition hover:border-red-500 hover:text-red-700 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-red-400 dark:hover:text-red-400"
          aria-label="Toggle light and dark mode"
          onclick={toggleTheme}
        >
          {#if theme === "dark"}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-sun"
              ><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path
                d="M12 20v2"
              /><path d="m4.93 4.93 1.41 1.41" /><path
                d="m17.66 17.66 1.41 1.41"
              /><path d="M2 12h2" /><path d="M20 12h2" /><path
                d="m6.34 17.66-1.41 1.41"
              /><path d="m19.07 4.93-1.41 1.41" /></svg
            >
          {:else}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-moon"
              ><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg
            >
          {/if}
        </button>
      </div>
    </header>

    <section class="min-h-0 min-w-0 flex-1">
      <div class={`grid h-full gap-3 xl:grid-cols-2`}>
        {#if rightPageSlots.length == 0 && !rightPageNumber}
          {@render BinderPage({
            pageNumber: 0,
            slots: null,
            onToggle: null,
          })}
        {/if}
        {@render BinderPage({
          pageNumber: leftPageNumber,
          slots: leftPageSlots,
          onToggle: toggleCollected,
        })}
        {#if rightPageSlots.length > 0 && rightPageNumber}
          {@render BinderPage({
            pageNumber: rightPageNumber,
            slots: rightPageSlots,
            onToggle: toggleCollected,
          })}
        {/if}
      </div>
    </section>
  </section>
</main>

{#snippet BinderPage({ pageNumber, slots, onToggle })}
  <section
    class="flex min-h-0 flex-col bg-white/75 p-2 shadow-pocket ring-1 ring-slate-300 dark:bg-slate-800/75 dark:ring-slate-700"
  >
    <div class="mb-2 flex h-7 shrink-0 items-center justify-between gap-3">
      <h3 class="text-base font-black text-slate-950 dark:text-slate-50">
        Page {pageNumber}
      </h3>
    </div>

    <div class="grid min-h-0 flex-1 grid-cols-4 grid-rows-4 gap-2">
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
                  src={`${SPRITE_DIRECTORY}${slot.pokemon.id}.png`}
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
    </div>
  </section>
{/snippet}

<svelte:window onkeydown={handleGlobalShortcuts} />
