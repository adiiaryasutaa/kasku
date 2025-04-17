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
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      Approval: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: number
          reason: string | null
          status: number
          transaction_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: number
          reason?: string | null
          status: number
          transaction_id: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: number
          reason?: string | null
          status?: number
          transaction_id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      Category: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          id: number
          name: string
          organization_id: number
          type: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: number
          name: string
          organization_id: number
          type: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: number
          name?: string
          organization_id?: number
          type?: number
          updated_at?: string
        }
        Relationships: []
      }
      Organization: {
        Row: {
          avatar: string | null
          balance: number | null
          created_at: string
          currency: string | null
          deleted_at: string | null
          description: string | null
          id: number
          name: string
          permanent: boolean | null
          slug: string
          updated_at: string
          user_id: string
          year_start: string | null
        }
        Insert: {
          avatar?: string | null
          balance?: number | null
          created_at?: string
          currency?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: number
          name: string
          permanent?: boolean | null
          slug: string
          updated_at?: string
          user_id: string
          year_start?: string | null
        }
        Update: {
          avatar?: string | null
          balance?: number | null
          created_at?: string
          currency?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: number
          name?: string
          permanent?: boolean | null
          slug?: string
          updated_at?: string
          user_id?: string
          year_start?: string | null
        }
        Relationships: []
      }
      Role: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string
          id: number
          isDefault: boolean | null
          name: string
          organization_id: number
          permanent: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description: string
          id?: number
          isDefault?: boolean | null
          name: string
          organization_id: number
          permanent?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: number
          isDefault?: boolean | null
          name?: string
          organization_id?: number
          permanent?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      RolePermission: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: number
          permission: number
          role_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: number
          permission: number
          role_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: number
          permission?: number
          role_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      Transaction: {
        Row: {
          amount: number
          attachments: string[] | null
          category_id: number
          created_at: string
          date: string
          deleted_at: string | null
          description: string | null
          id: number
          name: string
          organization_id: number
          type: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          attachments?: string[] | null
          category_id: number
          created_at?: string
          date: string
          deleted_at?: string | null
          description?: string | null
          id?: number
          name: string
          organization_id: number
          type: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          attachments?: string[] | null
          category_id?: number
          created_at?: string
          date?: string
          deleted_at?: string | null
          description?: string | null
          id?: number
          name?: string
          organization_id?: number
          type?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      User: {
        Row: {
          avatar: string | null
          created_at: string
          deleted_at: string | null
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          deleted_at?: string | null
          email: string
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      UserOrganization: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: number
          organization_id: number
          role_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: number
          organization_id: number
          role_id: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: number
          organization_id?: number
          role_id?: number
          updated_at?: string
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
