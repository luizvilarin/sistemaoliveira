
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { Lembrete } from '@/types/data';

export const useLembreteCrud = (
  setLembretes: React.Dispatch<React.SetStateAction<Lembrete[]>>
) => {
  const addLembrete = async (lembrete: TablesInsert<'lembretes'>) => {
    const { data, error } = await supabase.from('lembretes').insert(lembrete).select(`
      *,
      cliente:clientes(*),
      cuidador:cuidadores(*)
    `).single();
    if (error) throw error;
    setLembretes(prev => [...prev, data]);
  };

  const updateLembrete = async (id: string, updates: TablesUpdate<'lembretes'>) => {
    const { data, error } = await supabase.from('lembretes').update(updates).eq('id', id).select(`
      *,
      cliente:clientes(*),
      cuidador:cuidadores(*)
    `).single();
    if (error) throw error;
    setLembretes(prev => prev.map(l => l.id === id ? data : l));
  };

  const deleteLembrete = async (id: string) => {
    const { error } = await supabase.from('lembretes').delete().eq('id', id);
    if (error) throw error;
    setLembretes(prev => prev.filter(l => l.id !== id));
  };

  return {
    addLembrete,
    updateLembrete,
    deleteLembrete,
  };
};
