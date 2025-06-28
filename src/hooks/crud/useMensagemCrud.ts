
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { Mensagem } from '@/types/data';

export const useMensagemCrud = (
  setMensagens: React.Dispatch<React.SetStateAction<Mensagem[]>>
) => {
  const addMensagem = async (mensagem: TablesInsert<'mensagens'>) => {
    console.log('Adicionando mensagem:', mensagem);
    
    const { data, error } = await supabase
      .from('mensagens')
      .insert(mensagem)
      .select()
      .single();
      
    if (error) {
      console.error('Erro ao adicionar mensagem:', error);
      throw error;
    }
    
    console.log('Mensagem adicionada com sucesso:', data);
    setMensagens(prev => [...prev, data]);
    return data;
  };

  const updateMensagem = async (id: string, updates: TablesUpdate<'mensagens'>) => {
    console.log('Atualizando mensagem:', id, updates);
    
    const { data, error } = await supabase
      .from('mensagens')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Erro ao atualizar mensagem:', error);
      throw error;
    }
    
    console.log('Mensagem atualizada com sucesso:', data);
    setMensagens(prev => prev.map(m => m.id === id ? data : m));
    return data;
  };

  const deleteMensagem = async (id: string) => {
    console.log('Deletando mensagem:', id);
    
    const { error } = await supabase
      .from('mensagens')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Erro ao deletar mensagem:', error);
      throw error;
    }
    
    console.log('Mensagem deletada com sucesso');
    setMensagens(prev => prev.filter(m => m.id !== id));
  };

  return {
    addMensagem,
    updateMensagem,
    deleteMensagem,
  };
};
