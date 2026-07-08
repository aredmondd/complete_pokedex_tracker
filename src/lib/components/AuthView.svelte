<script>
  import { signInWithEmail, signUpWithEmail } from "../state/auth.svelte.js";
  import Icon from "./Icon.svelte";

  let mode = $state("signin");
  let email = $state("");
  let password = $state("");
  let error = $state("");
  let info = $state("");
  let submitting = $state(false);

  async function handleSubmit(event) {
    event.preventDefault();
    error = "";
    info = "";
    submitting = true;

    if (mode === "signin") {
      const { error: signInError } = await signInWithEmail(
        email.trim(),
        password,
      );
      if (signInError) error = signInError.message;
    } else {
      const { data, error: signUpError } = await signUpWithEmail(
        email.trim(),
        password,
      );
      if (signUpError) {
        error = signUpError.message;
      } else if (data.session) {
        // signed in immediately
      } else if (data.user) {
        info = "Check your email to confirm your account.";
        mode = "signin";
        password = "";
      }
    }

    submitting = false;
  }

  function setMode(next) {
    mode = next;
    error = "";
    info = "";
  }
</script>

<main
  class="h-screen overflow-hidden bg-[#f7f5ef] text-slate-900 dark:bg-slate-900 dark:text-slate-100"
>
  <div class="mx-auto flex h-full max-w-sm flex-col justify-center px-4">
    <div
      class="rounded-lg border border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="mb-6 flex items-center gap-2">
        <Icon name="book-open" class="" size={28} />
        <h1 class="text-xl font-bold">Complete Pokédex Binder</h1>
      </div>

      <div class="mb-4 flex border border-slate-300 dark:border-slate-700">
        <button
          class={`flex-1 px-3 py-2 font-bold transition ${
            mode === "signin"
              ? "bg-slate-200 dark:bg-slate-700"
              : "bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/60"
          }`}
          onclick={() => setMode("signin")}
        >
          Sign in
        </button>
        <button
          class={`flex-1 px-3 py-2 font-bold transition ${
            mode === "signup"
              ? "bg-slate-200 dark:bg-slate-700"
              : "bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/60"
          }`}
          onclick={() => setMode("signup")}
        >
          Sign up
        </button>
      </div>

      <form class="flex flex-col gap-3" onsubmit={handleSubmit}>
        <label class="flex flex-col gap-1 text-sm">
          <span class="font-medium">Email</span>
          <input
            type="email"
            required
            autocomplete="email"
            bind:value={email}
            class="rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span class="font-medium">Password</span>
          <input
            type="password"
            required
            minlength="6"
            autocomplete={mode === "signin"
              ? "current-password"
              : "new-password"}
            bind:value={password}
            class="rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>

        {#if error}
          <p class="text-sm text-red-600 dark:text-red-400">{error}</p>
        {/if}
        {#if info}
          <p class="text-sm text-sky-600 dark:text-sky-400">{info}</p>
        {/if}

        <button
          type="submit"
          disabled={submitting}
          class="mt-2 rounded border border-slate-300 bg-white px-3 py-2 font-bold transition hover:border-red-500 hover:text-red-700 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-red-400 dark:hover:text-red-400"
        >
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
    <p class="text-sm text-center pt-4 italic">
      Don't want to make an account? <br />Learn how to self host
      <a
        href="https://github.com/aredmondd/complete_pokedex_tracker"
        target="_blank"
        class="text-blue-400 underline">here</a
      >
    </p>
  </div>
</main>

