import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

let cachedClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local."
    );
  }

  cachedClient ??= createClient<Database>(supabaseUrl, supabaseKey);
  return cachedClient;
}
