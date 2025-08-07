
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { Cliente } from '@/types/data';

export const useClienteCrud = (
  setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>
) => {
  const addCliente = async (cliente: TablesInsert<'clientes'>) => {
    const { data, error } = await supabase.from('clientes').insert(cliente).select().single();
    if (error) throw error;
    setClientes(prev => [...prev, data]);
    return data;
  };

  const updateCliente = async (id: string, updates: TablesUpdate<'clientes'>) => {
    const { data, error } = await supabase.from('clientes').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setClientes(prev => prev.map(c => c.id === id ? data : c));
  };

  const deleteCliente = async (id: string) => {
    // Primeiro deletar transações associadas ao cliente
    const { error: transacoesError } = await supabase
      .from('transacoes')
      .delete()
      .eq('cliente_id', id);
      
    if (transacoesError) throw transacoesError;
    
    // Deletar boletos associados ao cliente
    const { error: boletosError } = await supabase
      .from('boletos')
      .delete()
      .eq('cliente_id', id);
      
    if (boletosError) throw boletosError;
    
    // Primeiro buscar os IDs das transações para deletar entradas financeiras
    const { data: transacaoIds } = await supabase
      .from('transacoes')
      .select('id')
      .eq('cliente_id', id);
    
    // Deletar entradas financeiras relacionadas se existirem transações
    if (transacaoIds && transacaoIds.length > 0) {
      const { error: financeiroError } = await supabase
        .from('financeiro')
        .delete()
        .eq('referencia_tipo', 'transacao_cliente')
        .in('referencia_id', transacaoIds.map(t => t.id));
        
      if (financeiroError) console.warn('Erro ao deletar entradas financeiras:', financeiroError);
    }
    
    // Deletar tarefas dos cuidadores associados ao cliente
    const { error: tarefasError } = await supabase
      .from('tarefas')
      .delete()
      .eq('cliente_id', id);
      
    if (tarefasError) throw tarefasError;
    
    // Deletar pacientes associados ao cliente
    const { error: pacientesError } = await supabase
      .from('pacientes')
      .delete()
      .eq('cliente_id', id);
      
    if (pacientesError) throw pacientesError;
    
    // Deletar lembretes associados ao cliente
    const { error: lembretesError } = await supabase
      .from('lembretes')
      .delete()
      .eq('cliente_id', id);
      
    if (lembretesError) throw lembretesError;
    
    // Remover associação dos cuidadores com este cliente
    const { error: cuidadoresError } = await supabase
      .from('cuidadores')
      .update({ cliente_id: null })
      .eq('cliente_id', id);
      
    if (cuidadoresError) throw cuidadoresError;
    
    // Por último, deletar o cliente
    const { error } = await supabase.from('clientes').delete().eq('id', id);
    if (error) throw error;
    setClientes(prev => prev.filter(c => c.id !== id));
  };

  return {
    addCliente,
    updateCliente,
    deleteCliente,
  };
};
