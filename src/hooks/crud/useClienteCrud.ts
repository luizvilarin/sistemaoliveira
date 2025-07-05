
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
    // Primeiro deletar tarefas dos cuidadores associados ao cliente
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
