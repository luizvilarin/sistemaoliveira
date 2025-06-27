
import { supabase } from '@/integrations/supabase/client';
import { Usuario, UserInvite } from '@/types/data';

export const userService = {
  async sendInvite(email: string, nome: string, perfil: 'admin' | 'gestor' | 'cuidador') {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Não autenticado');

    console.log('Enviando convite via Edge Function...');

    // Chamar a edge function
    const { data, error } = await supabase.functions.invoke('send-invite', {
      body: { email, nome, perfil },
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

    const { data, error } = await supabase.functions.invoke('delete-user', {
      body: { userId },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      throw error;
    }

    return data;
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
