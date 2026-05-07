export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          bio: string;
          status: string;
          social_handle: string | null;
          social_links: Json;
          birthdate: string | null;
          show_birthdate: boolean;
          avatar_url: string;
          banner_url: string;
          role: Database["public"]["Enums"]["profile_role"];
          membership_tier: Database["public"]["Enums"]["membership_tier"];
          theme_mode: Database["public"]["Enums"]["theme_mode"];
          points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          bio?: string;
          status?: string;
          social_handle?: string | null;
          social_links?: Json;
          birthdate?: string | null;
          show_birthdate?: boolean;
          avatar_url?: string;
          banner_url?: string;
          role?: Database["public"]["Enums"]["profile_role"];
          membership_tier?: Database["public"]["Enums"]["membership_tier"];
          theme_mode?: Database["public"]["Enums"]["theme_mode"];
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          username?: string;
          display_name?: string;
          bio?: string;
          status?: string;
          social_handle?: string | null;
          social_links?: Json;
          birthdate?: string | null;
          show_birthdate?: boolean;
          avatar_url?: string;
          banner_url?: string;
          role?: Database["public"]["Enums"]["profile_role"];
          membership_tier?: Database["public"]["Enums"]["membership_tier"];
          theme_mode?: Database["public"]["Enums"]["theme_mode"];
          points?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      membership_tier: "free" | "premium";
      profile_role: "owner" | "moderator" | "member";
      theme_mode: "nox" | "sol";
    };
    CompositeTypes: Record<string, never>;
  };
};
