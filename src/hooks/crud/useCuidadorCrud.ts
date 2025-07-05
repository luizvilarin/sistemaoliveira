
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { Cuidador } from '@/types/data';

export const useCuidadorCrud = (
  setCuidadores: React.Dispatch<React.SetStateAction<Cuidador[]>>
) => {
  const addCuidador = async (cuidador: TablesInsert<'cuidadores'>) => {
    console.log('Adicionando cuidador:', cuidador);
    
    const { data, error } = await supabase
      .from('cuidadores')
      .insert(cuidador)
      .select(`
        *,
        cliente:clientes(*)
      `)
      .single();
      
    if (error) {
      console.error('Erro ao adicionar cuidador:', error);
      throw error;
    }
    
    console.log('Cuidador adicionado com sucesso:', data);
    setCuidadores(prev => [...prev, data]);
    return data;
  };

  const updateCuidador = async (id: string, updates: TablesUpdate<'cuidadores'>) => {
    console.log('Atualizando cuidador:', id, updates);
    
    const { data, error } = await supabase
      .from('cuidadores')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        cliente:clientes(*)
      `)
      .single();
      
    if (error) {
      console.error('Erro ao atualizar cuidador:', error);
      throw error;
    }
    
    console.log('Cuidador atualizado com sucesso:', data);
    setCuidadores(prev => prev.map(c => c.id === id ? data : c));
    return data;
  };

  const deleteCuidador = async (id: string) => {
    console.log('Deletando cuidador:', id);
    
    // Primeiro deletar tarefas associadas ao cuidador
    const { error: tarefasError } = await supabase
      .from('tarefas')
      .delete()
      .eq('cuidador_id', id);
      
    if (tarefasError) {
      console.error('Erro ao deletar tarefas do cuidador:', tarefasError);
      throw tarefasError;
    }
    
    // Depois deletar o cuidador
    const { error } = await supabase
      .from('cuidadores')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Erro ao deletar cuidador:', error);
      throw error;
    }
    
    console.log('Cuidador deletado com sucesso');
    setCuidadores(prev => prev.filter(c => c.id !== id));
  };

  return {
    addCuidador,
    updateCuidador,
    deleteCuidador,
  };
};
