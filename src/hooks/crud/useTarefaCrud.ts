
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { Tarefa } from '@/types/data';

export const useTarefaCrud = (
  setTarefas: React.Dispatch<React.SetStateAction<Tarefa[]>>
) => {
  const addTarefa = async (tarefa: TablesInsert<'tarefas'>) => {
    const { data, error } = await supabase.from('tarefas').insert(tarefa).select().single();
    if (error) throw error;
    setTarefas(prev => [...prev, data]);
  };

  const updateTarefa = async (id: string, updates: TablesUpdate<'tarefas'>) => {
    // Atualização otimista do estado local para feedback instantâneo
    setTarefas(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    
    try {
      const { data, error } = await supabase.from('tarefas').update(updates).eq('id', id).select().single();
      if (error) {
        // Reverter em caso de erro (opcional, ou apenas logar)
        console.error("Erro ao atualizar tarefa, revertendo estado local", error);
        // Aqui poderíamos ter uma lógica de reversão mais complexa se necessário
        throw error;
      }
      // Sincronizar com os dados reais do servidor (que podem ter outros campos calculados)
      setTarefas(prev => prev.map(t => t.id === id ? data : t));
    } catch (error) {
      throw error;
    }
  };

  const deleteTarefa = async (id: string) => {
    const { error } = await supabase.from('tarefas').delete().eq('id', id);
    if (error) throw error;
    setTarefas(prev => prev.filter(t => t.id !== id));
  };

  return {
    addTarefa,
    updateTarefa,
    deleteTarefa,
  };
};
