
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { Mensagem } from '@/types/data';

export const useMensagemCrud = (
  setMensagens: React.Dispatch<React.SetStateAction<Mensagem[]>>
) => {
  const addMensagem = async (mensagem: TablesInsert<'mensagens'>) => {
    const { data, error } = await supabase.from('mensagens').insert(mensagem).select().single();
    if (error) throw error;
    setMensagens(prev => [...prev, data]);
  };

  const updateMensagem = async (id: string, updates: TablesUpdate<'mensagens'>) => {
    const { data, error } = await supabase.from('mensagens').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setMensagens(prev => prev.map(m => m.id === id ? data : m));
  };

  const deleteMensagem = async (id: string) => {
    const { error } = await supabase.from('mensagens').delete().eq('id', id);
    if (error) throw error;
    setMensagens(prev => prev.filter(m => m.id !== id));
  };

  return {
    addMensagem,
    updateMensagem,
    deleteMensagem,
  };
};
