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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          cliente_id: string | null
          cliente_nome: string
          cliente_telefone: string
          created_at: string
          data_hora_fim: string
          data_hora_inicio: string
          id: string
          observacoes: string | null
          status: Database["public"]["Enums"]["agendamento_status"]
          updated_at: string
          user_id: string
          webhook_disparado: boolean
        }
        Insert: {
          cliente_id?: string | null
          cliente_nome: string
          cliente_telefone: string
          created_at?: string
          data_hora_fim: string
          data_hora_inicio: string
          id?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["agendamento_status"]
          updated_at?: string
          user_id: string
          webhook_disparado?: boolean
        }
        Update: {
          cliente_id?: string | null
          cliente_nome?: string
          cliente_telefone?: string
          created_at?: string
          data_hora_fim?: string
          data_hora_inicio?: string
          id?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["agendamento_status"]
          updated_at?: string
          user_id?: string
          webhook_disparado?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      anamneses: {
        Row: {
          alergias: string | null
          cliente_id: string
          created_at: string
          doencas_cronicas: string | null
          id: string
          medicamentos: string | null
          observacoes: string | null
          queixa_principal: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alergias?: string | null
          cliente_id: string
          created_at?: string
          doencas_cronicas?: string | null
          id?: string
          medicamentos?: string | null
          observacoes?: string | null
          queixa_principal?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alergias?: string | null
          cliente_id?: string
          created_at?: string
          doencas_cronicas?: string | null
          id?: string
          medicamentos?: string | null
          observacoes?: string | null
          queixa_principal?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anamneses_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: true
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anamneses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "prestadores"
            referencedColumns: ["id"]
          },
        ]
      }
      anamneses_podologia: {
        Row: {
          cliente_id: string
          created_at: string
          dados: Json
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          dados?: Json
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          dados?: Json
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anamneses_podologia_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: true
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anamneses_podologia_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "prestadores"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_history: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          created_at: string
          data_nascimento: string | null
          email: string | null
          id: string
          nome: string
          telefone: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          id?: string
          nome: string
          telefone: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          id?: string
          nome?: string
          telefone?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "prestadores"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_servicos: {
        Row: {
          cliente_id: string
          created_at: string
          data_servico: string
          descricao: string
          id: string
          observacoes: string | null
          user_id: string
          valor: number | null
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_servico?: string
          descricao: string
          id?: string
          observacoes?: string | null
          user_id: string
          valor?: number | null
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_servico?: string
          descricao?: string
          id?: string
          observacoes?: string | null
          user_id?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_servicos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_servicos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "prestadores"
            referencedColumns: ["id"]
          },
        ]
      }
      prestadores: {
        Row: {
          configuracao_assistente: Json | null
          created_at: string
          id: string
          nicho: string | null
          nome_completo: string
          nome_negocio: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_ends_at: string | null
          subscription_status: string | null
          subscription_tier: string | null
          telefone: string | null
          timezone: string
          trial_ends_at: string | null
          whatsapp_instance_name: string | null
          whatsapp_numero: string | null
          whatsapp_status: string | null
        }
        Insert: {
          configuracao_assistente?: Json | null
          created_at?: string
          id: string
          nicho?: string | null
          nome_completo: string
          nome_negocio: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_ends_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          telefone?: string | null
          timezone?: string
          trial_ends_at?: string | null
          whatsapp_instance_name?: string | null
          whatsapp_numero?: string | null
          whatsapp_status?: string | null
        }
        Update: {
          configuracao_assistente?: Json | null
          created_at?: string
          id?: string
          nicho?: string | null
          nome_completo?: string
          nome_negocio?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_ends_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          telefone?: string | null
          timezone?: string
          trial_ends_at?: string | null
          whatsapp_instance_name?: string | null
          whatsapp_numero?: string | null
          whatsapp_status?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          compact_density: boolean | null
          created_at: string
          email_digests: boolean | null
          full_name: string | null
          id: string
          marketing_updates: boolean | null
          push_alerts: boolean | null
          role: string
          theme: string | null
          webhook_url: string | null
        }
        Insert: {
          compact_density?: boolean | null
          created_at?: string
          email_digests?: boolean | null
          full_name?: string | null
          id: string
          marketing_updates?: boolean | null
          push_alerts?: boolean | null
          role?: string
          theme?: string | null
          webhook_url?: string | null
        }
        Update: {
          compact_density?: boolean | null
          created_at?: string
          email_digests?: boolean | null
          full_name?: string | null
          id?: string
          marketing_updates?: boolean | null
          push_alerts?: boolean | null
          role?: string
          theme?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      service_orders: {
        Row: {
          address: string | null
          address_complement: string | null
          address_number: string | null
          assigned_to: string | null
          cep: string | null
          city: string | null
          client_name: string | null
          client_phone: string | null
          client_signature_url: string | null
          created_at: string
          description: string | null
          id: string
          neighborhood: string | null
          notes: string | null
          scheduled_date: string | null
          state: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          address_complement?: string | null
          address_number?: string | null
          assigned_to?: string | null
          cep?: string | null
          city?: string | null
          client_name?: string | null
          client_phone?: string | null
          client_signature_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          neighborhood?: string | null
          notes?: string | null
          scheduled_date?: string | null
          state?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          address_complement?: string | null
          address_number?: string | null
          assigned_to?: string | null
          cep?: string | null
          city?: string | null
          client_name?: string | null
          client_phone?: string | null
          client_signature_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          neighborhood?: string | null
          notes?: string | null
          scheduled_date?: string | null
          state?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          agendamento_id: string | null
          criado_em: string
          erro_msg: string | null
          id: string
          payload: Json
          status_http: number | null
          sucesso: boolean
          tentativas: number
          tipo_evento: string
        }
        Insert: {
          agendamento_id?: string | null
          criado_em?: string
          erro_msg?: string | null
          id?: string
          payload: Json
          status_http?: number | null
          sucesso?: boolean
          tentativas?: number
          tipo_evento: string
        }
        Update: {
          agendamento_id?: string | null
          criado_em?: string
          erro_msg?: string | null
          id?: string
          payload?: Json
          status_http?: number | null
          sucesso?: boolean
          tentativas?: number
          tipo_evento?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_gestor: { Args: never; Returns: boolean }
      match_documents: {
        Args: { filter: Json; match_count: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      match_documentssn: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
    }
    Enums: {
      agendamento_status:
        | "pendente"
        | "confirmado"
        | "cancelado"
        | "remarcado"
        | "concluido"
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
      agendamento_status: [
        "pendente",
        "confirmado",
        "cancelado",
        "remarcado",
        "concluido",
      ],
    },
  },
} as const

// Tipos auxiliares personalizados exportados diretamente
export type Agendamento = Database['public']['Tables']['agendamentos']['Row'];
export type AnamnesePodologia = Database['public']['Tables']['anamneses_podologia']['Row'];
export type Prestador = Database['public']['Tables']['prestadores']['Row'];
export type Cliente = Database['public']['Tables']['clientes']['Row'];
