import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { Boleto } from '@/types/data';

export const useBoletoCrud = (setBoletos: React.Dispatch<React.SetStateAction<Boleto[]>>) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const addBoleto = async (boleto: TablesInsert<'boletos'>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('boletos')
        .insert(boleto)
        .select(`
          *,
          cliente:clientes(*)
        `)
        .single();
      
      if (error) throw error;
      
      setBoletos(prev => [...prev, data]);
      toast({
        title: 'Sucesso',
        description: 'Boleto criado com sucesso!',
      });
      return data;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao criar boleto',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBoleto = async (id: string, updates: TablesUpdate<'boletos'>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('boletos')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          cliente:clientes(*)
        `)
        .single();
      
      if (error) throw error;
      
      setBoletos(prev => prev.map(b => b.id === id ? data : b));
      toast({
        title: 'Sucesso',
        description: 'Boleto atualizado com sucesso!',
      });
      return data;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao atualizar boleto',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBoleto = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('boletos').delete().eq('id', id);
      if (error) throw error;
      
      setBoletos(prev => prev.filter(b => b.id !== id));
      toast({
        title: 'Sucesso',
        description: 'Boleto excluído com sucesso!',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao excluir boleto',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addBoleto,
    updateBoleto,
    deleteBoleto,
    isLoading,
  };
};