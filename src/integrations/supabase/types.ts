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
      content: {
        Row: {
          author_id: string
          content: string | null
          created_at: string | null
          description: string | null
          featured_image: string | null
          id: string
          page_id: string | null
          published_at: string | null
          status: string
          title: string
          type: string
        }
        Insert: {
          author_id: string
          content?: string | null
          created_at?: string | null
          description?: string | null
          featured_image?: string | null
          id?: string
          page_id?: string | null
          published_at?: string | null
          status?: string
          title: string
          type: string
        }
        Update: {
          author_id?: string
          content?: string | null
          created_at?: string | null
          description?: string | null
          featured_image?: string | null
          id?: string
          page_id?: string | null
          published_at?: string | null
          status?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_content: {
        Row: {
          content_id: string | null
          created_at: string | null
          id: string
          page_id: string | null
          position: number | null
        }
        Insert: {
          content_id?: string | null
          created_at?: string | null
          id?: string
          page_id?: string | null
          position?: number | null
        }
        Update: {
          content_id?: string | null
          created_at?: string | null
          id?: string
          page_id?: string | null
          position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "featured_content_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_content_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          order_index: number | null
          slug: string
          type: Database["public"]["Enums"]["menu_type"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          order_index?: number | null
          slug: string
          type?: Database["public"]["Enums"]["menu_type"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          order_index?: number | null
          slug?: string
          type?: Database["public"]["Enums"]["menu_type"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          order_index: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          order_index?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          order_index?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      page_content: {
        Row: {
          content_id: string
          created_at: string | null
          order_index: number | null
          page_id: string
        }
        Insert: {
          content_id: string
          created_at?: string | null
          order_index?: number | null
          page_id: string
        }
        Update: {
          content_id?: string
          created_at?: string | null
          order_index?: number | null
          page_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_content_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_content_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      page_hierarchy: {
        Row: {
          child_page_id: string | null
          created_at: string | null
          id: string
          parent_page_id: string | null
          position: number | null
        }
        Insert: {
          child_page_id?: string | null
          created_at?: string | null
          id?: string
          parent_page_id?: string | null
          position?: number | null
        }
        Update: {
          child_page_id?: string | null
          created_at?: string | null
          id?: string
          parent_page_id?: string | null
          position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "page_hierarchy_child_page_id_fkey"
            columns: ["child_page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_hierarchy_parent_page_id_fkey"
            columns: ["parent_page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          layout_settings: Json | null
          menu_category_id: string | null
          menu_item_id: string | null
          page_type: Database["public"]["Enums"]["page_type"] | null
          slug: string
          template_type: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          layout_settings?: Json | null
          menu_category_id?: string | null
          menu_item_id?: string | null
          page_type?: Database["public"]["Enums"]["page_type"] | null
          slug: string
          template_type?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          layout_settings?: Json | null
          menu_category_id?: string | null
          menu_item_id?: string | null
          page_type?: Database["public"]["Enums"]["page_type"] | null
          slug?: string
          template_type?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pages_menu_category_id_fkey"
            columns: ["menu_category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pages_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      rating_criteria: {
        Row: {
          id: string
          name: string
          review_id: string | null
          score: number | null
        }
        Insert: {
          id?: string
          name: string
          review_id?: string | null
          score?: number | null
        }
        Update: {
          id?: string
          name?: string
          review_id?: string | null
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rating_criteria_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "review_details"
            referencedColumns: ["id"]
          },
        ]
      }
      review_details: {
        Row: {
          content_id: string | null
          gallery: string[] | null
          id: string
          overall_score: number | null
          product_specs: Json | null
          youtube_url: string | null
        }
        Insert: {
          content_id?: string | null
          gallery?: string[] | null
          id?: string
          overall_score?: number | null
          product_specs?: Json | null
          youtube_url?: string | null
        }
        Update: {
          content_id?: string | null
          gallery?: string[] | null
          id?: string
          overall_score?: number | null
          product_specs?: Json | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_details_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      statistics: {
        Row: {
          count: number | null
          id: string
          last_updated: string | null
          type: string
        }
        Insert: {
          count?: number | null
          id?: string
          last_updated?: string | null
          type: string
        }
        Update: {
          count?: number | null
          id?: string
          last_updated?: string | null
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_if_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      menu_type: "standard" | "megamenu"
      page_type: "category" | "subcategory"
      user_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
