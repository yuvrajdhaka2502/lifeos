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
      daily_logs: {
        Row: {
          created_at: string
          diary: string | null
          diet_satisfaction: number | null
          id: string
          log_date: string
          rating: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          diary?: string | null
          diet_satisfaction?: number | null
          id?: string
          log_date: string
          rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          diary?: string | null
          diet_satisfaction?: number | null
          id?: string
          log_date?: string
          rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      item_completions: {
        Row: {
          completed: boolean
          completed_at: string
          completed_count: number
          id: string
          item_id: string
          period_key: string
          phase_id: string
          track_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string
          completed_count?: number
          id?: string
          item_id: string
          period_key: string
          phase_id: string
          track_id: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          completed?: boolean
          completed_at?: string
          completed_count?: number
          id?: string
          item_id?: string
          period_key?: string
          phase_id?: string
          track_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_completions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "track_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_completions_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "track_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_completions_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_log: {
        Row: {
          channels: string[]
          id: string
          kind: string
          sent_at: string
          sent_for_date: string
          user_id: string
        }
        Insert: {
          channels?: string[]
          id?: string
          kind?: string
          sent_at?: string
          sent_for_date: string
          user_id?: string
        }
        Update: {
          channels?: string[]
          id?: string
          kind?: string
          sent_at?: string
          sent_for_date?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email_backup_enabled: boolean
          id: string
          reminder_enabled: boolean
          reminder_time: string
          timezone: string
          updated_at: string
          week_starts_on: number
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email_backup_enabled?: boolean
          id: string
          reminder_enabled?: boolean
          reminder_time?: string
          timezone?: string
          updated_at?: string
          week_starts_on?: number
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email_backup_enabled?: boolean
          id?: string
          reminder_enabled?: boolean
          reminder_time?: string
          timezone?: string
          updated_at?: string
          week_starts_on?: number
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          last_used_at: string
          p256dh: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          last_used_at?: string
          p256dh: string
          user_agent?: string | null
          user_id?: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          last_used_at?: string
          p256dh?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      todos: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          sort_order: number
          title: string
          urgency: Database["public"]["Enums"]["urgency_level"]
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          sort_order?: number
          title: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
          user_id?: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          sort_order?: number
          title?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
          user_id?: string
        }
        Relationships: []
      }
      track_hours: {
        Row: {
          created_at: string
          hours: number
          id: string
          log_date: string
          track_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hours?: number
          id?: string
          log_date: string
          track_id: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          hours?: number
          id?: string
          log_date?: string
          track_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "track_hours_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      track_items: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          note: string | null
          phase_id: string
          reps: number | null
          section_id: string | null
          sets: number | null
          sort_order: number
          title: string
          track_id: string
          user_id: string
          weekly_target: number
          weight: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          note?: string | null
          phase_id: string
          reps?: number | null
          section_id?: string | null
          sets?: number | null
          sort_order?: number
          title: string
          track_id: string
          user_id?: string
          weekly_target?: number
          weight?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          note?: string | null
          phase_id?: string
          reps?: number | null
          section_id?: string | null
          sets?: number | null
          sort_order?: number
          title?: string
          track_id?: string
          user_id?: string
          weekly_target?: number
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "track_items_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "track_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "track_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_items_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      track_phases: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          layout: Database["public"]["Enums"]["phase_layout"]
          period_scope: Database["public"]["Enums"]["period_scope"]
          sort_order: number
          subtitle: string | null
          title: string
          track_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          layout: Database["public"]["Enums"]["phase_layout"]
          period_scope: Database["public"]["Enums"]["period_scope"]
          sort_order?: number
          subtitle?: string | null
          title: string
          track_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          layout?: Database["public"]["Enums"]["phase_layout"]
          period_scope?: Database["public"]["Enums"]["period_scope"]
          sort_order?: number
          subtitle?: string | null
          title?: string
          track_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "track_phases_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      track_sections: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          phase_id: string
          sort_order: number
          title: string
          track_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          phase_id: string
          sort_order?: number
          title: string
          track_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          phase_id?: string
          sort_order?: number
          title?: string
          track_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "track_sections_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "track_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_sections_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      tracks: {
        Row: {
          accent: string | null
          color: string | null
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          layout: Database["public"]["Enums"]["track_layout"]
          name: string
          slug: string
          sort_order: number
          source_doc: string | null
          tracks_hours: boolean
          user_id: string
        }
        Insert: {
          accent?: string | null
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          layout: Database["public"]["Enums"]["track_layout"]
          name: string
          slug: string
          sort_order?: number
          source_doc?: string | null
          tracks_hours?: boolean
          user_id?: string
        }
        Update: {
          accent?: string | null
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          layout?: Database["public"]["Enums"]["track_layout"]
          name?: string
          slug?: string
          sort_order?: number
          source_doc?: string | null
          tracks_hours?: boolean
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      period_scope: "static" | "weekly" | "daily"
      phase_layout: "phase" | "pinned" | "panel"
      track_layout: "phased" | "panels"
      urgency_level: "low" | "medium" | "high" | "urgent"
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
      period_scope: ["static", "weekly", "daily"],
      phase_layout: ["phase", "pinned", "panel"],
      track_layout: ["phased", "panels"],
      urgency_level: ["low", "medium", "high", "urgent"],
    },
  },
} as const
