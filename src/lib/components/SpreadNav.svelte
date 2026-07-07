<script>
  import { session, setSpread } from "../state/session.svelte.js";
  import { TOTAL_SPREADS } from "../utils/constants.js";
  import Icon from "./Icon.svelte";
</script>

<div class="flex gap-2 items-center justify-center">
  <button
    class="disabled:opacity-35 border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
    aria-label="Previous spread"
    disabled={session.currentSpread === 1 || session.mode === "list"}
    onclick={() => setSpread(session.currentSpread - 1)}
  >
    <Icon name="move-left" />
  </button>
  <label class="min-w-[120px] max-w-[180px] flex-1">
    <span class="sr-only">Spread</span>
    <input
      class="w-full align-middle accent-red-600 disabled:opacity-35"
      type="range"
      min="1"
      max={TOTAL_SPREADS}
      disabled={session.mode === "list"}
      bind:value={session.currentSpread}
    />
  </label>
  <button
    class="disabled:opacity-35 border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
    aria-label="Next spread"
    disabled={session.currentSpread === TOTAL_SPREADS || session.mode === "list"}
    onclick={() => setSpread(session.currentSpread + 1)}
  >
    <Icon name="move-right" />
  </button>
</div>