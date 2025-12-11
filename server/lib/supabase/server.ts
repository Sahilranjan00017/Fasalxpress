import { createClient } from "@supabase/supabase-js";

// Server-side supabase client (simple anon key client for now)

// Use service role key for admin operations
export function createSupabaseServer() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  return createClient(url, key);
}

export default createSupabaseServer;
