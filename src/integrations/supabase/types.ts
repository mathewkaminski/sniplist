export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      favorite_sniplists: {
        Row: {
          created_at: string
          id: string
          sniplist_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sniplist_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sniplist_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_sniplists_sniplist_id_fkey"
            columns: ["sniplist_id"]
            isOneToOne: false
            referencedRelation: "sniplist_stats"
            referencedColumns: ["sniplist_id"]
          },
          {
            foreignKeyName: "favorite_sniplists_sniplist_id_fkey"
            columns: ["sniplist_id"]
            isOneToOne: false
            referencedRelation: "sniplists"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_snippets: {
        Row: {
          created_at: string
          id: string
          snippet_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          snippet_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          snippet_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_snippets_snippet_id_fkey"
            columns: ["snippet_id"]
            isOneToOne: false
            referencedRelation: "snippets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_login: boolean
          id: string
          is_public: boolean
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_login?: boolean
          id: string
          is_public?: boolean
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_login?: boolean
          id?: string
          is_public?: boolean
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      sniplist_items: {
        Row: {
          created_at: string
          id: string
          position: number
          sniplist_id: string
          snippet_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          position: number
          sniplist_id: string
          snippet_id: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          sniplist_id?: string
          snippet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sniplist_items_sniplist_id_fkey"
            columns: ["sniplist_id"]
            isOneToOne: false
            referencedRelation: "sniplist_stats"
            referencedColumns: ["sniplist_id"]
          },
          {
            foreignKeyName: "sniplist_items_sniplist_id_fkey"
            columns: ["sniplist_id"]
            isOneToOne: false
            referencedRelation: "sniplists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sniplist_items_snippet_id_fkey"
            columns: ["snippet_id"]
            isOneToOne: false
            referencedRelation: "snippets"
            referencedColumns: ["id"]
          },
        ]
      }
      sniplist_plays: {
        Row: {
          completed_songs: number
          id: string
          played_at: string | null
          sniplist_id: string | null
          user_id: string | null
        }
        Insert: {
          completed_songs?: number
          id?: string
          played_at?: string | null
          sniplist_id?: string | null
          user_id?: string | null
        }
        Update: {
          completed_songs?: number
          id?: string
          played_at?: string | null
          sniplist_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sniplist_plays_sniplist_id_fkey"
            columns: ["sniplist_id"]
            isOneToOne: false
            referencedRelation: "sniplist_stats"
            referencedColumns: ["sniplist_id"]
          },
          {
            foreignKeyName: "sniplist_plays_sniplist_id_fkey"
            columns: ["sniplist_id"]
            isOneToOne: false
            referencedRelation: "sniplists"
            referencedColumns: ["id"]
          },
        ]
      }
      sniplists: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      snippets: {
        Row: {
          comments: string | null
          created_at: string
          end_time: number
          id: string
          start_time: number
          title: string
          user_id: string
          video_id: string
        }
        Insert: {
          comments?: string | null
          created_at?: string
          end_time: number
          id?: string
          start_time: number
          title: string
          user_id: string
          video_id: string
        }
        Update: {
          comments?: string | null
          created_at?: string
          end_time?: number
          id?: string
          start_time?: number
          title?: string
          user_id?: string
          video_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      search_results: {
        Row: {
          created_at: string | null
          id: string | null
          title: string | null
          type: string | null
        }
        Relationships: []
      }
      sniplist_stats: {
        Row: {
          plays_with_two_songs: number | null
          sniplist_id: string | null
          title: string | null
          total_plays: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_top_users: {
        Args: { limit_count: number }
        Returns: {
          user_id: string
          username: string
          total_plays: number
          plays_with_two_plus_songs: number
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      search_profiles_and_sniplists: {
        Args: { search_term: string }
        Returns: {
          id: string
          title: string
          type: string
          created_at: string
        }[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
