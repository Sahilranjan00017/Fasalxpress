import { createClient } from "@supabase/supabase-js";
import type { Database } from "@shared/types/supabase";

let supabase: ReturnType<typeof createClient<Database>> | null = null;

export function supabaseClient() {
  if (supabase) return supabase;

  const url = import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.VITE_APP_SUPABASE_URL ?? (window as any).__SUPABASE_URL__;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_APP_SUPABASE_ANON_KEY ?? (window as any).__SUPABASE_ANON_KEY__;

  if (!url || !key) {
    throw new Error("VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required");
  }

  supabase = createClient<Database>(url as string, key as string);
  return supabase;
}

export default supabaseClient;
