import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// Type definitions based on Supabase schema
export type Cliente = Tables<'clientes'>;
export type Cuidador = Tables<'cuidadores'> & {
  cliente?: Cliente | null;
};
export type Paciente = Tables<'pacientes'> & {
  cliente?: Cliente | null;
  cuidador?: Cuidador | null;
};
export type Transacao = Tables<'transacoes'> & {
  cliente?: Cliente | null;
};
export type Tarefa = Tables<'tarefas'>;
export type Lembrete = Tables<'lembretes'> & {
  cliente?: Cliente | null;
  cuidador?: Cuidador | null;
};
export type Mensagem = Tables<'mensagens'>;
export type Notificacao = Tables<'notificacoes'>;
export type NotificacaoSistema = Tables<'notificacoes_sistema'>;
export type UserInvite = Tables<'user_invites'>;
export type Profile = Tables<'profiles'>;

export interface GrupoChat extends Tables<'grupos_chat'> { }
export interface MembroGrupo extends Tables<'membros_grupo'> { }

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  avatar_url?: string;
  perfil: 'admin' | 'gestor' | 'cuidador';
  status_online?: 'online' | 'offline' | 'ausente' | 'ocupado' | 'invisivel';
  ultima_atividade?: string;
  created_at: string;
  ativo?: boolean;
}

export interface MensagensAvancada {
  id: string;
  conteudo: string;
  remetente_id: string;
  destinatario_id?: string;
  grupo_id?: string;
  created_at: string;
  tipo_mensagem: 'texto' | 'imagem' | 'video' | 'audio' | 'arquivo';
  arquivo_url?: string;
  arquivo_nome?: string;
  lida?: boolean;
  entregue?: boolean;
  visualizada?: boolean;
  data_entrega?: string;
  data_visualizacao?: string;
  emoji_reacoes?: Record<string, string[]>;
  mencoes?: string[];
  duracao_audio?: number;
}
