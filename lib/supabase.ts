import { createClient } from "@supabase/supabase-js";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          bio: string | null;
          status: string | null;
          social_handle: string | null;
          avatar_url: string | null;
          banner_url: string | null;
          role: "owner" | "moderator" | "member";
          membership_tier: "free" | "premium";
          theme_mode: "nox" | "sol";
          points: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          bio?: string | null;
          status?: string | null;
          social_handle?: string | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          role?: "owner" | "moderator" | "member";
          membership_tier?: "free" | "premium";
          theme_mode?: "nox" | "sol";
          points?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          username?: string;
          display_name?: string;
          bio?: string | null;
          status?: string | null;
          social_handle?: string | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          role?: "owner" | "moderator" | "member";
          membership_tier?: "free" | "premium";
          theme_mode?: "nox" | "sol";
          points?: number | null;
          updated_at?: string;
        };
      };
    };
  };
};

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
