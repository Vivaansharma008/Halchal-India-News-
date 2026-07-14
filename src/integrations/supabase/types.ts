export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ads: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_enabled: boolean
          link_url: string
          position: Database["public"]["Enums"]["ad_position"]
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_enabled?: boolean
          link_url: string
          position: Database["public"]["Enums"]["ad_position"]
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_enabled?: boolean
          link_url?: string
          position?: Database["public"]["Enums"]["ad_position"]
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          author_id: string | null
          author_name: string | null
          category: Database["public"]["Enums"]["news_category"]
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_breaking: boolean
          is_published: boolean
          published_at: string
          slug: string
          source_id: string | null
          source_url: string | null
          summary: string
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          category: Database["public"]["Enums"]["news_category"]
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_breaking?: boolean
          is_published?: boolean
          published_at?: string
          slug: string
          source_id?: string | null
          source_url?: string | null
          summary: string
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          category?: Database["public"]["Enums"]["news_category"]
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_breaking?: boolean
          is_published?: boolean
          published_at?: string
          slug?: string
          source_id?: string | null
          source_url?: string | null
          summary?: string
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      news_views: {
        Row: {
          id: string
          news_id: string
          viewed_at: string
          visitor_hash: string
        }
        Insert: {
          id?: string
          news_id: string
          viewed_at?: string
          visitor_hash: string
        }
        Update: {
          id?: string
          news_id?: string
          viewed_at?: string
          visitor_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_views_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      slug_redirects: {
        Row: {
          created_at: string
          new_slug: string
          old_slug: string
        }
        Insert: {
          created_at?: string
          new_slug: string
          old_slug: string
        }
        Update: {
          created_at?: string
          new_slug?: string
          old_slug?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          category: Database["public"]["Enums"]["video_category"]
          created_at: string
          created_by: string | null
          description: string | null
          duration: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          published_at: string
          slug: string
          source: Database["public"]["Enums"]["video_source"]
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
          view_count: number
          youtube_id: string | null
          youtube_url: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["video_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          published_at?: string
          slug: string
          source: Database["public"]["Enums"]["video_source"]
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
          view_count?: number
          youtube_id?: string | null
          youtube_url?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["video_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          published_at?: string
          slug?: string
          source?: Database["public"]["Enums"]["video_source"]
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
          view_count?: number
          youtube_id?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      record_news_view: {
        Args: { _news_id: string; _visitor_hash: string }
        Returns: boolean
      }
    }
    Enums: {
      ad_position:
        | "header"
        | "between_sections"
        | "sidebar"
        | "in_article"
        | "above_footer"
      app_role: "admin"
      news_category:
        | "politics"
        | "sports"
        | "entertainment"
        | "technology"
        | "uttar-pradesh"
      video_category:
        | "politics"
        | "india"
        | "world"
        | "sports"
        | "entertainment"
        | "technology"
        | "business"
        | "health"
      video_source: "youtube" | "upload"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ad_position: [
        "header",
        "between_sections",
        "sidebar",
        "in_article",
        "above_footer",
      ],
      app_role: ["admin"],
      news_category: [
        "politics",
        "sports",
        "entertainment",
        "technology",
        "uttar-pradesh",
      ],
      video_category: [
        "politics",
        "india",
        "world",
        "sports",
        "entertainment",
        "technology",
        "business",
        "health",
      ],
      video_source: ["youtube", "upload"],
    },
  },
} as const
