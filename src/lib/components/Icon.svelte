<script>
  import icons from "./icons.js";

  let { name, size = 24, class: className = "hover:text-blue-500" } = $props();

  const paths = $derived(icons[name]);
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  class={className}
  aria-hidden="true"
>
  {@html paths}
</svg>