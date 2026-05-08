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
      posts: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          content: string;
          media: Json;
          visibility: Database["public"]["Enums"]["post_visibility"];
          status: Database["public"]["Enums"]["post_status"];
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          title?: string;
          content?: string;
          media?: Json;
          visibility?: Database["public"]["Enums"]["post_visibility"];
          status?: Database["public"]["Enums"]["post_status"];
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          creator_id?: string;
          title?: string;
          content?: string;
          media?: Json;
          visibility?: Database["public"]["Enums"]["post_visibility"];
          status?: Database["public"]["Enums"]["post_status"];
          published_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          parent_id: string | null;
          content: string;
          attachments: Json;
          is_hidden: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          parent_id?: string | null;
          content?: string;
          attachments?: Json;
          is_hidden?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          parent_id?: string | null;
          content?: string;
          attachments?: Json;
          is_hidden?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
        ];
      };
      reactions: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          type: Database["public"]["Enums"]["reaction_type"];
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          type?: Database["public"]["Enums"]["reaction_type"];
          created_at?: string;
        };
        Update: {
          type?: Database["public"]["Enums"]["reaction_type"];
        };
        Relationships: [
          {
            foreignKeyName: "reactions_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      points_ledger: {
        Row: {
          id: string;
          user_id: string;
          event_type: Database["public"]["Enums"]["point_event_type"];
          points: number;
          source_table: string | null;
          source_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: Database["public"]["Enums"]["point_event_type"];
          points: number;
          source_table?: string | null;
          source_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          metadata?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "points_ledger_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      claim_daily_checkin: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
    };
    Enums: {
      membership_tier: "free" | "premium";
      point_event_type:
        | "daily_checkin"
        | "comment_created"
        | "reaction_created"
        | "admin_adjustment";
      post_status: "draft" | "published" | "archived";
      post_visibility: "public" | "members" | "premium";
      profile_role: "owner" | "moderator" | "member";
      reaction_type: "like";
      theme_mode: "nox" | "sol";
    };
    CompositeTypes: Record<string, never>;
  };
};
