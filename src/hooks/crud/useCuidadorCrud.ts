
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { Cuidador } from '@/types/data';

export const useCuidadorCrud = (
  setCuidadores: React.Dispatch<React.SetStateAction<Cuidador[]>>
) => {
  const addCuidador = async (cuidador: TablesInsert<'cuidadores'>) => {
    const { data, error } = await supabase.from('cuidadores').insert(cuidador).select().single();
    if (error) throw error;
    setCuidadores(prev => [...prev, data]);
    return data;
  };

  const updateCuidador = async (id: string, updates: TablesUpdate<'cuidadores'>) => {
    const { data, error } = await supabase.from('cuidadores').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setCuidadores(prev => prev.map(c => c.id === id ? data : c));
  };

  const deleteCuidador = async (id: string) => {
    const { error } = await supabase.from('cuidadores').delete().eq('id', id);
    if (error) throw error;
    setCuidadores(prev => prev.filter(c => c.id !== id));
  };

  return {
    addCuidador,
    updateCuidador,
    deleteCuidador,
  };
};
