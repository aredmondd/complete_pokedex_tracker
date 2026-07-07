<script>
  import { session } from "../state/session.svelte.js";
  import { toggleCollectedId } from "../state/collection.svelte.js";
  import BinderPage from "./BinderPage.svelte";

  function toggleCollected(slot) {
    if (!slot.pokemon) return;
    toggleCollectedId(slot.pocketNumber);
  }
</script>

<section class="min-h-0 min-w-0 flex-1">
  <div class="grid h-full gap-3 xl:grid-cols-2">
    {#if session.rightPageSlots.length === 0 && !session.rightPageNumber}
      <BinderPage
        pageNumber={0}
        slots={null}
        onToggle={null}
        directory={session.directory}
      />
    {/if}
    <BinderPage
      pageNumber={session.leftPageNumber}
      slots={session.leftPageSlots}
      onToggle={toggleCollected}
      directory={session.directory}
    />
    {#if session.rightPageSlots.length > 0 && session.rightPageNumber}
      <BinderPage
        pageNumber={session.rightPageNumber}
        slots={session.rightPageSlots}
        onToggle={toggleCollected}
        directory={session.directory}
      />
    {/if}
  </div>
</section>