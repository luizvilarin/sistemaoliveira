
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

// Usuario type combining profile with auth info
export type Usuario = Profile & {
  canDelete?: boolean;
  status_online?: 'online' | 'offline' | 'ausente' | 'ocupado';
  ultima_atividade?: string;
};
