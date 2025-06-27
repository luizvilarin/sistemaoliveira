
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { Notificacao, NotificacaoSistema } from '@/types/data';

export const useNotificacaoCrud = (
  setNotificacoes: React.Dispatch<React.SetStateAction<Notificacao[]>>,
  setNotificacoesSistema: React.Dispatch<React.SetStateAction<NotificacaoSistema[]>>
) => {
  const addNotificacao = async (notificacao: TablesInsert<'notificacoes'>) => {
    const { data, error } = await supabase.from('notificacoes').insert(notificacao).select().single();
    if (error) throw error;
    setNotificacoes(prev => [...prev, data]);
  };

  const updateNotificacao = async (id: string, updates: TablesUpdate<'notificacoes'>) => {
    const { data, error } = await supabase.from('notificacoes').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setNotificacoes(prev => prev.map(n => n.id === id ? data : n));
  };

  const deleteNotificacao = async (id: string) => {
    const { error } = await supabase.from('notificacoes').delete().eq('id', id);
    if (error) throw error;
    setNotificacoes(prev => prev.filter(n => n.id !== id));
  };

  const addNotificacaoSistema = async (notificacao: TablesInsert<'notificacoes_sistema'>) => {
    const { data, error } = await supabase.from('notificacoes_sistema').insert(notificacao).select().single();
    if (error) throw error;
    setNotificacoesSistema(prev => [...prev, data]);
  };

  const updateNotificacaoSistema = async (id: string, updates: TablesUpdate<'notificacoes_sistema'>) => {
    const { data, error } = await supabase.from('notificacoes_sistema').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setNotificacoesSistema(prev => prev.map(n => n.id === id ? data : n));
  };

  const deleteNotificacaoSistema = async (id: string) => {
    const { error } = await supabase.from('notificacoes_sistema').delete().eq('id', id);
    if (error) throw error;
    setNotificacoesSistema(prev => prev.filter(n => n.id !== id));
  };

  return {
    addNotificacao,
    updateNotificacao,
    deleteNotificacao,
    addNotificacaoSistema,
    updateNotificacaoSistema,
    deleteNotificacaoSistema,
  };
};
