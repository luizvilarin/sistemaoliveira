
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { Paciente } from '@/types/data';

export const usePacienteCrud = (
  setPacientes: React.Dispatch<React.SetStateAction<Paciente[]>>
) => {
  const addPaciente = async (paciente: TablesInsert<'pacientes'>) => {
    const { data, error } = await supabase.from('pacientes').insert(paciente).select(`
      *,
      cliente:clientes(*),
      cuidador:cuidadores(*)
    `).single();
    if (error) throw error;
    setPacientes(prev => [...prev, data]);
    return data;
  };

  const updatePaciente = async (id: string, updates: TablesUpdate<'pacientes'>) => {
    const { data, error } = await supabase.from('pacientes').update(updates).eq('id', id).select(`
      *,
      cliente:clientes(*),
      cuidador:cuidadores(*)
    `).single();
    if (error) throw error;
    setPacientes(prev => prev.map(p => p.id === id ? data : p));
  };

  const deletePaciente = async (id: string) => {
    const { error } = await supabase.from('pacientes').delete().eq('id', id);
    if (error) throw error;
    setPacientes(prev => prev.filter(p => p.id !== id));
  };

  return {
    addPaciente,
    updatePaciente,
    deletePaciente,
  };
};
