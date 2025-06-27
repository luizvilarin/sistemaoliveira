
import { supabase } from '@/integrations/supabase/client';
import { Usuario, UserInvite } from '@/types/data';

export const userService = {
  async sendInvite(email: string, nome: string, perfil: 'admin' | 'gestor' | 'cuidador') {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Não autenticado');

    const response = await supabase.functions.invoke('send-invite', {
      body: { email, nome, perfil },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (response.error) {
      throw response.error;
    }

    return response.data;
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
