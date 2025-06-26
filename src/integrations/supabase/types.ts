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
      clientes: {
        Row: {
          contato: string
          created_at: string
          endereco: string | null
          id: string
          nome: string
          status: string
          tipo: string
          updated_at: string
        }
        Insert: {
          contato: string
          created_at?: string
          endereco?: string | null
          id?: string
          nome: string
          status: string
          tipo: string
          updated_at?: string
        }
        Update: {
          contato?: string
          created_at?: string
          endereco?: string | null
          id?: string
          nome?: string
          status?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      cuidadores: {
        Row: {
          cliente_id: string | null
          created_at: string
          disponibilidade: Json | null
          email: string | null
          especializacao: string
          id: string
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          disponibilidade?: Json | null
          email?: string | null
          especializacao: string
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          disponibilidade?: Json | null
          email?: string | null
          especializacao?: string
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cuidadores_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      lembretes: {
        Row: {
          cliente_id: string | null
          created_at: string
          cuidador_id: string | null
          descricao: string | null
          dia: string
          id: string
          residencia: string
          responsavel_id: string
          titulo: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          cuidador_id?: string | null
          descricao?: string | null
          dia: string
          id?: string
          residencia: string
          responsavel_id: string
          titulo: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          cuidador_id?: string | null
          descricao?: string | null
          dia?: string
          id?: string
          residencia?: string
          responsavel_id?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "lembretes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lembretes_cuidador_id_fkey"
            columns: ["cuidador_id"]
            isOneToOne: false
            referencedRelation: "cuidadores"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens: {
        Row: {
          assunto: string
          conteudo: string
          created_at: string
          destinatario_id: string | null
          id: string
          lida: boolean | null
          remetente_id: string
        }
        Insert: {
          assunto: string
          conteudo: string
          created_at?: string
          destinatario_id?: string | null
          id?: string
          lida?: boolean | null
          remetente_id: string
        }
        Update: {
          assunto?: string
          conteudo?: string
          created_at?: string
          destinatario_id?: string | null
          id?: string
          lida?: boolean | null
          remetente_id?: string
        }
        Relationships: []
      }
      notificacoes: {
        Row: {
          created_at: string
          id: string
          lida: boolean | null
          mensagem: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lida?: boolean | null
          mensagem: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lida?: boolean | null
          mensagem?: string
          usuario_id?: string
        }
        Relationships: []
      }
      pacientes: {
        Row: {
          cliente_id: string
          contrato_ativo: boolean | null
          created_at: string
          cuidador_id: string | null
          historico_medico: string | null
          id: string
          nome: string
          updated_at: string
          valor_contrato: number | null
        }
        Insert: {
          cliente_id: string
          contrato_ativo?: boolean | null
          created_at?: string
          cuidador_id?: string | null
          historico_medico?: string | null
          id?: string
          nome: string
          updated_at?: string
          valor_contrato?: number | null
        }
        Update: {
          cliente_id?: string
          contrato_ativo?: boolean | null
          created_at?: string
          cuidador_id?: string | null
          historico_medico?: string | null
          id?: string
          nome?: string
          updated_at?: string
          valor_contrato?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pacientes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacientes_cuidador_id_fkey"
            columns: ["cuidador_id"]
            isOneToOne: false
            referencedRelation: "cuidadores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          nome: string
          perfil: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          nome: string
          perfil: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          perfil?: string
          updated_at?: string
        }
        Relationships: []
      }
      tarefas: {
        Row: {
          cliente_id: string
          created_at: string
          cuidador_id: string
          descricao: string | null
          id: string
          status: string
          titulo: string
          updated_at: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          cuidador_id: string
          descricao?: string | null
          id?: string
          status: string
          titulo: string
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          cuidador_id?: string
          descricao?: string | null
          id?: string
          status?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_cuidador_id_fkey"
            columns: ["cuidador_id"]
            isOneToOne: false
            referencedRelation: "cuidadores"
            referencedColumns: ["id"]
          },
        ]
      }
      transacoes: {
        Row: {
          cliente_id: string
          created_at: string
          data: string
          id: string
          status: string
          valor: number
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data?: string
          id?: string
          status: string
          valor: number
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data?: string
          id?: string
          status?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
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
