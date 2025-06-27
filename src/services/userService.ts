
import { supabase } from '@/integrations/supabase/client';
import { Usuario, UserInvite } from '@/types/data';

export const userService = {
  async sendInvite(email: string, nome: string, perfil: 'admin' | 'gestor' | 'cuidador') {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Não autenticado');

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('perfil')
      .eq('id', session.user.id)
      .single();

    if (profile?.perfil !== 'admin') {
      throw new Error('Apenas administradores podem enviar convites');
    }

    // Primeiro, salvar o convite na nossa tabela
    const { error: inviteError } = await supabase
      .from('user_invites')
      .insert({
        email,
        nome,
        perfil,
        invited_by: session.user.id
      });

    if (inviteError) {
      throw inviteError;
    }

    // Usar o método nativo do Supabase para enviar o convite
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        nome,
        perfil
      }
    });

    if (error) {
      // Se falhar, remover o convite que criamos
      await supabase
        .from('user_invites')
        .delete()
        .eq('email', email);
      throw error;
    }

    return data;
  },

  async deleteUser(userId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Não autenticado');

    const response = await supabase.functions.invoke('delete-user', {
      body: { userId },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (response.error) {
      throw response.error;
    }

    return response.data;
  },

  async getAllUsers(): Promise<Usuario[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Marcar quais usuários podem ser deletados
    const users = (data || []).map(user => ({
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
  }
};
