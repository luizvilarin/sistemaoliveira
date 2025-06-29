
import { supabase } from '@/integrations/supabase/client';
import { Usuario, UserInvite } from '@/types/data';

export const userService = {
  async sendInvite(email: string, nome: string, perfil: 'admin' | 'gestor' | 'cuidador', resend = false) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Não autenticado');

    console.log('Enviando convite via Edge Function...', resend ? '(reenvio)' : '');

    // Chamar a edge function
    const { data, error } = await supabase.functions.invoke('send-invite', {
      body: { email, nome, perfil, resend },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Erro da Edge Function:', error);
      throw new Error(error.message || 'Erro ao enviar convite');
    }

    if (data?.error) {
      console.error('Erro retornado pela função:', data.error);
      throw new Error(data.error);
    }

    console.log('Convite enviado com sucesso:', data);
    return data;
  },

  async deleteUser(userId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Não autenticado');

    console.log('Tentando deletar usuário:', userId);

    const { data, error } = await supabase.functions.invoke('delete-user', {
      body: { userId },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Erro ao chamar função de deletar:', error);
      throw new Error(error.message || 'Erro ao deletar usuário');
    }

    if (data?.error) {
      console.error('Erro retornado pela função:', data.error);
      throw new Error(data.error);
    }

    console.log('Usuário deletado com sucesso:', data);
    return data;
  },

  async deleteInvite(email: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Não autenticado');

    const { data, error } = await supabase.functions.invoke('delete-invite', {
      body: { email },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      throw error;
    }

    return data;
  },

  async updateUserRole(userId: string, newRole: 'admin' | 'gestor' | 'cuidador') {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Não autenticado');

    console.log('Atualizando cargo do usuário:', userId, 'para:', newRole);

    const { data, error } = await supabase
      .from('profiles')
      .update({ perfil: newRole })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar cargo:', error);
      throw error;
    }

    console.log('Cargo atualizado com sucesso:', data);
    return data;
  },

  async updateUserStatus(status: 'online' | 'offline' | 'ausente' | 'ocupado') {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Não autenticado');

    const { error } = await supabase
      .from('profiles')
      .update({ 
        status_online: status,
        ultima_atividade: new Date().toISOString()
      })
      .eq('id', session.user.id);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  },

  async getAllUsers(): Promise<Usuario[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Filtrar o usuário técnico e marcar quais usuários podem ser deletados
    const users = (data || [])
      .filter(user => user.email !== 'luizvilarinho.nave@gmail.com') // Ocultar usuário técnico
      .map(user => ({
        ...user,
        canDelete: user.email !== 'luizvilarinho.nave@gmail.com'
      }));

    return users;
  },

  async getInvites(): Promise<UserInvite[]> {
    const { data, error } = await supabase
      .from('user_invites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Função para verificar se um usuário pode ser deletado por um gestor
  canGestorDeleteUser(currentUserPerfil: string, targetUserPerfil: string): boolean {
    if (currentUserPerfil === 'admin') return true;
    if (currentUserPerfil === 'gestor' && targetUserPerfil === 'cuidador') return true;
    return false;
  },

  // Função para verificar se um usuário pode editar cargo de outro
  canEditUserRole(currentUserPerfil: string, targetUserPerfil: string): boolean {
    if (currentUserPerfil === 'admin') return true;
    if (currentUserPerfil === 'gestor' && targetUserPerfil === 'cuidador') return true;
    return false;
  }
};
