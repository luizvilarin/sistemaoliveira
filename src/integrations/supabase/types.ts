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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      arquivos_mensagem: {
        Row: {
          created_at: string
          id: string
          mensagem_id: string
          nome_arquivo: string
          tamanho: number
          tipo_arquivo: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          mensagem_id: string
          nome_arquivo: string
          tamanho: number
          tipo_arquivo: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          mensagem_id?: string
          nome_arquivo?: string
          tamanho?: number
          tipo_arquivo?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "arquivos_mensagem_mensagem_id_fkey"
            columns: ["mensagem_id"]
            isOneToOne: false
            referencedRelation: "mensagens"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          resource: string
          resource_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource: string
          resource_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource?: string
          resource_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      boletos: {
        Row: {
          canal_envio: string | null
          cliente_id: string
          cor_status: string | null
          created_at: string
          cuidadoras: string[]
          data_confirmacao_pago: string | null
          data_envio: string | null
          data_envio_boleto: string | null
          data_pagamento: string | null
          data_solicitacao: string | null
          dia_cobranca_secundario: number | null
          dia_vencimento: number
          frequencia_recorrencia: string | null
          historico_ciclos: Json | null
          historico_lembretes: Json | null
          id: string
          notificacao_dias_antes: number | null
          observacoes: string | null
          proxima_data_cobranca: string | null
          recorrente: boolean | null
          status: string
          tipo_plantao: string
          updated_at: string
          valor: number
          valor_personalizado: number | null
        }
        Insert: {
          canal_envio?: string | null
          cliente_id: string
          cor_status?: string | null
          created_at?: string
          cuidadoras?: string[]
          data_confirmacao_pago?: string | null
          data_envio?: string | null
          data_envio_boleto?: string | null
          data_pagamento?: string | null
          data_solicitacao?: string | null
          dia_cobranca_secundario?: number | null
          dia_vencimento: number
          frequencia_recorrencia?: string | null
          historico_ciclos?: Json | null
          historico_lembretes?: Json | null
          id?: string
          notificacao_dias_antes?: number | null
          observacoes?: string | null
          proxima_data_cobranca?: string | null
          recorrente?: boolean | null
          status?: string
          tipo_plantao: string
          updated_at?: string
          valor: number
          valor_personalizado?: number | null
        }
        Update: {
          canal_envio?: string | null
          cliente_id?: string
          cor_status?: string | null
          created_at?: string
          cuidadoras?: string[]
          data_confirmacao_pago?: string | null
          data_envio?: string | null
          data_envio_boleto?: string | null
          data_pagamento?: string | null
          data_solicitacao?: string | null
          dia_cobranca_secundario?: number | null
          dia_vencimento?: number
          frequencia_recorrencia?: string | null
          historico_ciclos?: Json | null
          historico_lembretes?: Json | null
          id?: string
          notificacao_dias_antes?: number | null
          observacoes?: string | null
          proxima_data_cobranca?: string | null
          recorrente?: boolean | null
          status?: string
          tipo_plantao?: string
          updated_at?: string
          valor?: number
          valor_personalizado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "boletos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          contato: string
          contrato_ativo: boolean | null
          cpf: string | null
          cpf_completo: string | null
          created_at: string
          endereco: string | null
          id: string
          nome: string
          nome_completo: string | null
          nome_completo_cliente: string | null
          status: string
          status_pagamento: string | null
          tipo: string
          updated_at: string
          valor_contrato: number | null
        }
        Insert: {
          contato: string
          contrato_ativo?: boolean | null
          cpf?: string | null
          cpf_completo?: string | null
          created_at?: string
          endereco?: string | null
          id?: string
          nome: string
          nome_completo?: string | null
          nome_completo_cliente?: string | null
          status: string
          status_pagamento?: string | null
          tipo: string
          updated_at?: string
          valor_contrato?: number | null
        }
        Update: {
          contato?: string
          contrato_ativo?: boolean | null
          cpf?: string | null
          cpf_completo?: string | null
          created_at?: string
          endereco?: string | null
          id?: string
          nome?: string
          nome_completo?: string | null
          nome_completo_cliente?: string | null
          status?: string
          status_pagamento?: string | null
          tipo?: string
          updated_at?: string
          valor_contrato?: number | null
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
      financeiro: {
        Row: {
          aprovado_por: string | null
          categoria: string
          centro_custo: string | null
          created_at: string
          created_by: string | null
          data_aprovacao: string | null
          data_transacao: string
          descricao: string
          id: string
          referencia_id: string | null
          referencia_tipo: string | null
          subcategoria: string | null
          tags: string[] | null
          tipo: string
          updated_at: string
          valor: number
        }
        Insert: {
          aprovado_por?: string | null
          categoria: string
          centro_custo?: string | null
          created_at?: string
          created_by?: string | null
          data_aprovacao?: string | null
          data_transacao: string
          descricao: string
          id?: string
          referencia_id?: string | null
          referencia_tipo?: string | null
          subcategoria?: string | null
          tags?: string[] | null
          tipo: string
          updated_at?: string
          valor: number
        }
        Update: {
          aprovado_por?: string | null
          categoria?: string
          centro_custo?: string | null
          created_at?: string
          created_by?: string | null
          data_aprovacao?: string | null
          data_transacao?: string
          descricao?: string
          id?: string
          referencia_id?: string | null
          referencia_tipo?: string | null
          subcategoria?: string | null
          tags?: string[] | null
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      grupos_chat: {
        Row: {
          created_at: string
          criado_por: string
          descricao: string | null
          id: string
          imagem_url: string | null
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criado_por: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criado_por?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      lembretes: {
        Row: {
          cliente_id: string | null
          created_at: string
          cuidador_id: string | null
          descricao: string | null
          dia: string
          hora: string | null
          id: string
          residencia: string
          responsavel_id: string
          status: string | null
          tags: string[] | null
          tempo_antecedencia: number | null
          tipo: string | null
          titulo: string
          urgente: boolean | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          cuidador_id?: string | null
          descricao?: string | null
          dia: string
          hora?: string | null
          id?: string
          residencia: string
          responsavel_id: string
          status?: string | null
          tags?: string[] | null
          tempo_antecedencia?: number | null
          tipo?: string | null
          titulo: string
          urgente?: boolean | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          cuidador_id?: string | null
          descricao?: string | null
          dia?: string
          hora?: string | null
          id?: string
          residencia?: string
          responsavel_id?: string
          status?: string | null
          tags?: string[] | null
          tempo_antecedencia?: number | null
          tipo?: string | null
          titulo?: string
          urgente?: boolean | null
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
      membros_grupo: {
        Row: {
          adicionado_em: string
          grupo_id: string
          id: string
          papel: string
          usuario_id: string
        }
        Insert: {
          adicionado_em?: string
          grupo_id: string
          id?: string
          papel?: string
          usuario_id: string
        }
        Update: {
          adicionado_em?: string
          grupo_id?: string
          id?: string
          papel?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membros_grupo_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos_chat"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens: {
        Row: {
          arquivo_nome: string | null
          arquivo_url: string | null
          assunto: string
          conteudo: string
          created_at: string
          data_entrega: string | null
          data_visualizacao: string | null
          destinatario_id: string | null
          duracao_audio: number | null
          emoji_reacoes: Json | null
          entregue: boolean | null
          grupo_id: string | null
          id: string
          lida: boolean | null
          mencoes: string[] | null
          remetente_id: string
          tipo_mensagem: string
          visualizada: boolean | null
        }
        Insert: {
          arquivo_nome?: string | null
          arquivo_url?: string | null
          assunto: string
          conteudo: string
          created_at?: string
          data_entrega?: string | null
          data_visualizacao?: string | null
          destinatario_id?: string | null
          duracao_audio?: number | null
          emoji_reacoes?: Json | null
          entregue?: boolean | null
          grupo_id?: string | null
          id?: string
          lida?: boolean | null
          mencoes?: string[] | null
          remetente_id: string
          tipo_mensagem?: string
          visualizada?: boolean | null
        }
        Update: {
          arquivo_nome?: string | null
          arquivo_url?: string | null
          assunto?: string
          conteudo?: string
          created_at?: string
          data_entrega?: string | null
          data_visualizacao?: string | null
          destinatario_id?: string | null
          duracao_audio?: number | null
          emoji_reacoes?: Json | null
          entregue?: boolean | null
          grupo_id?: string | null
          id?: string
          lida?: boolean | null
          mencoes?: string[] | null
          remetente_id?: string
          tipo_mensagem?: string
          visualizada?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos_chat"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_fiscais: {
        Row: {
          cliente_id: string
          cpf_tomador: string
          created_at: string
          data_emissao: string | null
          emissor_nf: string
          id: string
          observacoes: string | null
          periodo: string
          responsavel_pagador: string
          status_envio: string
          updated_at: string
          valor_nf: number
        }
        Insert: {
          cliente_id: string
          cpf_tomador: string
          created_at?: string
          data_emissao?: string | null
          emissor_nf: string
          id?: string
          observacoes?: string | null
          periodo: string
          responsavel_pagador: string
          status_envio?: string
          updated_at?: string
          valor_nf: number
        }
        Update: {
          cliente_id?: string
          cpf_tomador?: string
          created_at?: string
          data_emissao?: string | null
          emissor_nf?: string
          id?: string
          observacoes?: string | null
          periodo?: string
          responsavel_pagador?: string
          status_envio?: string
          updated_at?: string
          valor_nf?: number
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
      notificacoes_sistema: {
        Row: {
          acao_url: string | null
          created_at: string | null
          data_criacao: string | null
          data_vencimento: string | null
          grupo_id: string | null
          id: string
          lida: boolean | null
          mensagem: string
          mensagem_id: string | null
          metadados: Json | null
          tipo: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          acao_url?: string | null
          created_at?: string | null
          data_criacao?: string | null
          data_vencimento?: string | null
          grupo_id?: string | null
          id?: string
          lida?: boolean | null
          mensagem: string
          mensagem_id?: string | null
          metadados?: Json | null
          tipo: string
          titulo: string
          usuario_id: string
        }
        Update: {
          acao_url?: string | null
          created_at?: string | null
          data_criacao?: string | null
          data_vencimento?: string | null
          grupo_id?: string | null
          id?: string
          lida?: boolean | null
          mensagem?: string
          mensagem_id?: string | null
          metadados?: Json | null
          tipo?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_sistema_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos_chat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_sistema_mensagem_id_fkey"
            columns: ["mensagem_id"]
            isOneToOne: false
            referencedRelation: "mensagens"
            referencedColumns: ["id"]
          },
        ]
      }
      pacientes: {
        Row: {
          cliente_id: string
          created_at: string
          cuidador_id: string | null
          historico_medico: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          cuidador_id?: string | null
          historico_medico?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          cuidador_id?: string | null
          historico_medico?: string | null
          id?: string
          nome?: string
          updated_at?: string
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
      pagamentos_funcionarios: {
        Row: {
          cargo: string | null
          comprovante_url: string | null
          created_at: string
          created_by: string | null
          cuidador_id: string | null
          data_pagamento: string
          descricao: string | null
          id: string
          metodo_pagamento: string | null
          nome_funcionario: string | null
          periodo_competencia: string | null
          referencia: string
          status: string
          tipo_pagamento: string
          updated_at: string
          valor: number
        }
        Insert: {
          cargo?: string | null
          comprovante_url?: string | null
          created_at?: string
          created_by?: string | null
          cuidador_id?: string | null
          data_pagamento: string
          descricao?: string | null
          id?: string
          metodo_pagamento?: string | null
          nome_funcionario?: string | null
          periodo_competencia?: string | null
          referencia: string
          status?: string
          tipo_pagamento?: string
          updated_at?: string
          valor: number
        }
        Update: {
          cargo?: string | null
          comprovante_url?: string | null
          created_at?: string
          created_by?: string | null
          cuidador_id?: string | null
          data_pagamento?: string
          descricao?: string | null
          id?: string
          metodo_pagamento?: string | null
          nome_funcionario?: string | null
          periodo_competencia?: string | null
          referencia?: string
          status?: string
          tipo_pagamento?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_funcionarios_cuidador_id_fkey"
            columns: ["cuidador_id"]
            isOneToOne: false
            referencedRelation: "cuidadores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean | null
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          nome: string
          perfil: string
          senha_hash: string | null
          status_online: string | null
          ultima_atividade: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          nome: string
          perfil: string
          senha_hash?: string | null
          status_online?: string | null
          ultima_atividade?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          perfil?: string
          senha_hash?: string | null
          status_online?: string | null
          ultima_atividade?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      support_requests: {
        Row: {
          assunto: string
          created_at: string | null
          email: string
          id: string
          mensagem: string
          nome: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assunto: string
          created_at?: string | null
          email: string
          id?: string
          mensagem: string
          nome: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assunto?: string
          created_at?: string | null
          email?: string
          id?: string
          mensagem?: string
          nome?: string
          status?: string | null
          updated_at?: string | null
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
      user_invites: {
        Row: {
          accepted: boolean | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string | null
          nome: string
          perfil: string
        }
        Insert: {
          accepted?: boolean | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          nome: string
          perfil: string
        }
        Update: {
          accepted?: boolean | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          nome?: string
          perfil?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_delete_user: {
        Args: { user_id_to_delete: string }
        Returns: boolean
      }
      cleanup_old_audit_logs: { Args: never; Returns: undefined }
      criar_lembretes_boletos: { Args: never; Returns: undefined }
      criar_lembretes_boletos_automaticos: { Args: never; Returns: undefined }
      criar_notificacoes_boletos: { Args: never; Returns: undefined }
      executar_automacao_boletos: { Args: never; Returns: undefined }
      gerar_lembretes_boletos_recorrentes: { Args: never; Returns: undefined }
      get_current_user_role: { Args: never; Returns: string }
      is_current_user_admin: { Args: never; Returns: boolean }
      is_current_user_admin_plus: { Args: never; Returns: boolean }
      is_group_admin: {
        Args: { group_id: string; user_id: string }
        Returns: boolean
      }
      is_group_creator: {
        Args: { group_id: string; user_id: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { group_id: string; user_id: string }
        Returns: boolean
      }
      notificar_tarefas_pendentes: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
