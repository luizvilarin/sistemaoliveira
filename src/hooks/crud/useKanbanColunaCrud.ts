
import { supabase } from '@/integrations/supabase/client';
import { KanbanColuna } from '@/types/data';

export const useKanbanColunaCrud = (
  setColunas: React.Dispatch<React.SetStateAction<KanbanColuna[]>>
) => {
  const addKanbanColuna = async (coluna: Partial<KanbanColuna>) => {
    const { data, error } = await supabase
      .from('kanban_colunas')
      .insert(coluna)
      .select()
      .single();
    
    if (error) throw error;
    setColunas(prev => [...prev, data]);
  };

  const updateKanbanColuna = async (id: string, updates: Partial<KanbanColuna>) => {
    const { data, error } = await supabase
      .from('kanban_colunas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    setColunas(prev => prev.map(c => c.id === id ? data : c));
  };

  const deleteKanbanColuna = async (id: string) => {
    const { error } = await supabase
      .from('kanban_colunas')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    setColunas(prev => prev.filter(c => c.id !== id));
  };

  return {
    addKanbanColuna,
    updateKanbanColuna,
    deleteKanbanColuna,
  };
};
