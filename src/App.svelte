<script>
  import pokedex from "./data/pokemon.json";

  const TOTAL_POCKETS = 1088;
  const POCKETS_PER_PAGE = 16;
  const PAGES_PER_SPREAD = 2;
  const POCKETS_PER_SPREAD = POCKETS_PER_PAGE * PAGES_PER_SPREAD;
  const TOTAL_SPREADS =
    1 + Math.ceil((TOTAL_POCKETS - POCKETS_PER_PAGE) / POCKETS_PER_SPREAD);
  const STORAGE_KEY = "complete-pokedex.collection.v1";
  // change this to be "/sprites/pokemon/shiny/" to use shiny versions for your art!
  const SPRITE_DIRECTORY = "/sprites/pokemon/";

  const pokemonById = new Map(
    pokedex.pokemon.map((pokemon) => [pokemon.id, pokemon]),
  );

  const typeStyles = {
    Normal: "bg-stone-200 text-stone-800",
    Fire: "bg-red-100 text-red-800",
    Water: "bg-sky-100 text-sky-800",
    Electric: "bg-yellow-100 text-yellow-900",
    Grass: "bg-emerald-100 text-emerald-800",
    Ice: "bg-cyan-100 text-cyan-800",
    Fighting: "bg-orange-100 text-orange-800",
    Poison: "bg-fuchsia-100 text-fuchsia-800",
    Ground: "bg-amber-100 text-amber-900",
    Flying: "bg-indigo-100 text-indigo-800",
    Psychic: "bg-pink-100 text-pink-800",
    Bug: "bg-lime-100 text-lime-800",
    Rock: "bg-yellow-200 text-yellow-950",
    Ghost: "bg-violet-100 text-violet-800",
    Dragon: "bg-blue-100 text-blue-800",
    Dark: "bg-zinc-300 text-zinc-900",
    Steel: "bg-slate-200 text-slate-800",
    Fairy: "bg-rose-100 text-rose-800",
  };

  // --- reactive state (runes) ---
  let currentSpread = $state(1);
  let collectedIds = $state(loadInitialCollection());
  let highlightedId = $state(null);
  let query = $state("");

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

  // --- persistence effect (replaces the old `$: if (...)` reactive block) ---
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
    // nextMissing is $derived now, so it recomputes on its own —
    // no manual reassignment needed here anymore.
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

    const match = pokedex.pokemon.find((pokemon) =>
      pokemon.name.toLowerCase().includes(trimmed.toLowerCase()),
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
      return "border-dashed border-slate-300 bg-slate-100/70 text-slate-400";
    }

    if (isHighlighted(slot) && isCollected(slot)) {
      return "border-blue-500 border-4 bg-gray-200/80 opacity-70";
    }

    if (isHighlighted(slot)) {
      return "bg-yellow-200 shadow-sm";
    }

    if (isCollected(slot)) {
      return "border-gray-300 bg-gray-200/80 opacity-70";
    }

    return "border-slate-300 bg-white hover:border-red-500 hover:shadow-sm";
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

<main class="h-screen overflow-hidden bg-[#f7f5ef] text-slate-900">
  <section class="flex h-full w-full flex-col gap-2 px-2 py-2">
    <header class="shrink-0 border-b border-slate-300/80 pb-2">
      <div class="flex min-w-0 items-center gap-2 text-sm">
        <div
          class="flex h-10 shrink-0 items-center gap-2 border-l-4 border-red-500 bg-white/75 px-2 shadow-sm"
        >
          <span class="font-semibold text-slate-500">Collected</span>
          <span class="font-black">{collectedCount}/{pokedex.count}</span>
        </div>
        <div
          class="flex h-10 shrink-0 items-center gap-2 border-l-4 border-sky-500 bg-white/75 px-2 shadow-sm"
        >
          <span class="font-semibold text-slate-500">Progress</span>
          <span class="font-black">{progressPercent}%</span>
        </div>
        <div
          class="flex h-10 shrink-0 items-center gap-2 border-l-4 border-emerald-500 bg-white/75 px-2 shadow-sm"
        >
          <span class="font-semibold text-slate-500">Spread</span>
          <span class="font-black">{currentSpread}/{TOTAL_SPREADS}</span>
        </div>
        <button
          class="h-10 max-w-[220px] shrink truncate border border-slate-300 bg-white px-2 text-left font-bold transition hover:border-red-500 hover:text-red-700 disabled:opacity-35"
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
            class="min-w-0 flex-1 border border-slate-300 bg-white px-2 text-sm outline-none ring-red-600 transition focus:ring-2"
            bind:value={query}
            bind:this={searchInput}
            onchange={submitSearch}
            placeholder="Name or #"
          />
        </form>

        <button
          class="h-10 w-10 shrink-0 bg-white text-2xl font-black shadow-sm ring-1 ring-slate-300 transition hover:bg-slate-100 disabled:opacity-35"
          aria-label="Previous spread"
          disabled={currentSpread === 1}
          onclick={() => setSpread(currentSpread - 1)}
        >
          ‹
        </button>
        <label class="min-w-[120px] max-w-[180px] flex-1">
          <span class="sr-only">Spread</span>
          <input
            class="w-full accent-red-600"
            type="range"
            min="1"
            max={TOTAL_SPREADS}
            bind:value={currentSpread}
          />
        </label>
        <button
          class="h-10 w-10 shrink-0 bg-white text-2xl font-black shadow-sm ring-1 ring-slate-300 transition hover:bg-slate-100 disabled:opacity-35"
          aria-label="Next spread"
          disabled={currentSpread === TOTAL_SPREADS}
          onclick={() => setSpread(currentSpread + 1)}
        >
          ›
        </button>

        <button
          class="h-10 shrink-0 border border-slate-300 bg-white px-2 font-bold transition hover:border-red-500 hover:text-red-700"
          onclick={exportCollection}
        >
          Export
        </button>
        <button
          class="h-10 shrink-0 border border-slate-300 bg-white px-2 font-bold transition hover:border-red-500 hover:text-red-700"
          onclick={() => importInput.click()}
        >
          Import
        </button>
        <input
          class="hidden"
          bind:this={importInput}
          type="file"
          accept="application/json"
          onchange={importCollection}
        />
      </div>
    </header>

    <section class="min-h-0 min-w-0 flex-1">
      <div class={`grid h-full gap-3 xl:grid-cols-2`}>
        {#if rightPageSlots.length == 0 && !rightPageNumber}
          {@render BinderPage({
            pageNumber: 0,
            slots: null,
            typeStyles,
            onToggle: null,
          })}
        {/if}
        {@render BinderPage({
          pageNumber: leftPageNumber,
          slots: leftPageSlots,
          typeStyles,
          onToggle: toggleCollected,
        })}
        {#if rightPageSlots.length > 0 && rightPageNumber}
          {@render BinderPage({
            pageNumber: rightPageNumber,
            slots: rightPageSlots,
            typeStyles,
            onToggle: toggleCollected,
          })}
        {/if}
      </div>
    </section>
  </section>
</main>

{#snippet BinderPage({ pageNumber, slots, typeStyles, onToggle })}
  <section
    class="flex min-h-0 flex-col bg-white/75 p-2 shadow-pocket ring-1 ring-slate-300"
  >
    <div class="mb-2 flex h-7 shrink-0 items-center justify-between gap-3">
      <h3 class="text-base font-black text-slate-950">Page {pageNumber}</h3>
      <span class="text-xs font-bold text-slate-500">16 pockets</span>
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
                  <span class="text-xs font-black text-slate-500"
                    >#{String(slot.pocketNumber).padStart(4, "0")}</span
                  >
                </div>
                <p
                  class="mt-1 whitespace-normal break-words text-[clamp(0.68rem,1.1vw,0.95rem)] font-black leading-[1.08] text-slate-950"
                >
                  {slot.pokemon.name}
                </p>
              </div>

              <div class="flex flex-1 items-center justify-center">
                <img
                  src={`${SPRITE_DIRECTORY}${slot.pokemon.id}.png`}
                  class={isCollected(slot) ? "grayscale blur-[1px]" : ""}
                />
              </div>

              <!-- <div>
                <div class="flex flex-wrap gap-1">
                  {#each slot.pokemon.types as type}
                    <span class={`px-1 py-0.5 text-[9px] font-black ${typeStyles[type] ?? "bg-slate-200 text-slate-800"}`}>
                      {type}
                    </span>
                  {/each}
                </div>
              </div> -->
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
