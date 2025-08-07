
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
    
    // Sincronizar com o sistema financeiro
    try {
      const financeiroEntry = {
        tipo: 'receita',
        categoria: 'Receitas de Clientes',
        valor: transacao.valor,
        data_transacao: new Date(transacao.data).toISOString().split('T')[0],
        descricao: `Transação do cliente: ${data.cliente?.nome || 'Cliente não identificado'}`,
        referencia_id: data.id,
        referencia_tipo: 'transacao_cliente',
        created_by: data.cliente_id
      };

      await supabase
        .from('financeiro')
        .insert(financeiroEntry);
        
      console.log('Transação sincronizada com o financeiro');
    } catch (financeiroError) {
      console.warn('Erro ao sincronizar com financeiro:', financeiroError);
      // Não falha a transação principal se a sincronização falhar
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
    
    // Atualizar no sistema financeiro se existir
    try {
      if (updates.valor || updates.data) {
        const financeiroUpdates: any = {};
        
        if (updates.valor) {
          financeiroUpdates.valor = updates.valor;
        }
        
        if (updates.data) {
          financeiroUpdates.data_transacao = new Date(updates.data).toISOString().split('T')[0];
        }
        
        if (Object.keys(financeiroUpdates).length > 0) {
          await supabase
            .from('financeiro')
            .update(financeiroUpdates)
            .eq('referencia_id', id)
            .eq('referencia_tipo', 'transacao_cliente');
            
          console.log('Transação sincronizada no financeiro');
        }
      }
    } catch (financeiroError) {
      console.warn('Erro ao sincronizar atualização com financeiro:', financeiroError);
    }
    
    console.log('Transação atualizada com sucesso:', data);
    setTransacoes(prev => prev.map(t => t.id === id ? data : t));
    return data;
  };

  const deleteTransacao = async (id: string) => {
    console.log('Deletando transação:', id);
    
    // Primeiro remover do sistema financeiro
    try {
      await supabase
        .from('financeiro')
        .delete()
        .eq('referencia_id', id)
        .eq('referencia_tipo', 'transacao_cliente');
        
      console.log('Registro financeiro relacionado removido');
    } catch (financeiroError) {
      console.warn('Erro ao remover do financeiro:', financeiroError);
    }
    
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
