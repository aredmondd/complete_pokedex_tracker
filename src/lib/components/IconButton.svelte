<script>
  let {
    onclick = null,
    title = "",
    ariaLabel = "",
    disabled = false,
    children,
  } = $props();
</script>

<button
  class="h-10 shrink-0 border border-slate-300 bg-white p-2 font-bold transition hover:border-red-500 hover:text-red-700 disabled:opacity-35 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-red-400 dark:hover:text-red-400"
  {title}
  {ariaLabel}
  {disabled}
  {onclick}
>
  {@render children()}
</button>