<script>
  let { label, value, colorClass, showLabel = true } = $props();
</script>

<div
  class={`flex h-10 shrink-0 items-center gap-2 border-l-4 ${colorClass} bg-white/75 px-2 shadow-sm dark:bg-slate-800/75`}
>
  {#if showLabel}
    <span class="font-semibold text-slate-500 dark:text-slate-400">{label}</span>
  {/if}
  <span class="font-black">{value}</span>
</div>