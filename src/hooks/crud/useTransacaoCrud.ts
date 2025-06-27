
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { Transacao } from '@/types/data';

export const useTransacaoCrud = (
  setTransacoes: React.Dispatch<React.SetStateAction<Transacao[]>>
) => {
  const addTransacao = async (transacao: TablesInsert<'transacoes'>) => {
    const { data, error } = await supabase.from('transacoes').insert(transacao).select(`
      *,
      cliente:clientes(*)
    `).single();
    if (error) throw error;
    setTransacoes(prev => [...prev, data]);
    return data;
  };

  const updateTransacao = async (id: string, updates: TablesUpdate<'transacoes'>) => {
    const { data, error } = await supabase.from('transacoes').update(updates).eq('id', id).select(`
      *,
      cliente:clientes(*)
    `).single();
    if (error) throw error;
    setTransacoes(prev => prev.map(t => t.id === id ? data : t));
  };

  const deleteTransacao = async (id: string) => {
    const { error } = await supabase.from('transacoes').delete().eq('id', id);
    if (error) throw error;
    setTransacoes(prev => prev.filter(t => t.id !== id));
  };

  return {
    addTransacao,
    updateTransacao,
    deleteTransacao,
  };
};
