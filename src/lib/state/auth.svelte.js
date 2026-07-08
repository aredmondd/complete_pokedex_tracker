import { supabase } from "../supabase/client.js";

let user = $state(null);
let loading = $state(true);
let initialized = false;

export const auth = {
  get current() {
    return user;
  },
  get loading() {
    return loading;
  },
};

export function initAuth() {
  if (initialized) return;
  initialized = true;

  supabase.auth.getSession().then(({ data }) => {
    user = data.session?.user ?? null;
    loading = false;
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    user = session?.user ?? null;
    loading = false;
  });
}

export async function signInWithEmail(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error };
}

export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
}

export async function signOut() {
  await supabase.auth.signOut();
}