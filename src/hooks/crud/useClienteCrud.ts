
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
