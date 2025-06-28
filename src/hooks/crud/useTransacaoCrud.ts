
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { Transacao } from '@/types/data';

export const useTransacaoCrud = (
  setTransacoes: React.Dispatch<React.SetStateAction<Transacao[]>>
) => {
  const addTransacao = async (transacao: TablesInsert<'transacoes'>) => {
    console.log('Adicionando transação:', transacao);
    
    const { data, error } = await supabase
      .from('transacoes')
      .insert(transacao)
      .select(`
        *,
        cliente:clientes(*)
      `)
      .single();
      
    if (error) {
      console.error('Erro ao adicionar transação:', error);
      throw error;
    }
    
    console.log('Transação adicionada com sucesso:', data);
    setTransacoes(prev => [...prev, data]);
    return data;
  };

  const updateTransacao = async (id: string, updates: TablesUpdate<'transacoes'>) => {
    console.log('Atualizando transação:', id, updates);
    
    const { data, error } = await supabase
      .from('transacoes')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        cliente:clientes(*)
      `)
      .single();
      
    if (error) {
      console.error('Erro ao atualizar transação:', error);
      throw error;
    }
    
    console.log('Transação atualizada com sucesso:', data);
    setTransacoes(prev => prev.map(t => t.id === id ? data : t));
    return data;
  };

  const deleteTransacao = async (id: string) => {
    console.log('Deletando transação:', id);
    
    const { error } = await supabase
      .from('transacoes')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Erro ao deletar transação:', error);
      throw error;
    }
    
    console.log('Transação deletada com sucesso');
    setTransacoes(prev => prev.filter(t => t.id !== id));
  };

  return {
    addTransacao,
    updateTransacao,
    deleteTransacao,
  };
};
