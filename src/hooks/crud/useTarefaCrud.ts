
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
    const { data, error } = await supabase.from('tarefas').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setTarefas(prev => prev.map(t => t.id === id ? data : t));
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
