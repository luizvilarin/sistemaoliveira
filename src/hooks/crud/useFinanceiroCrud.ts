import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { Financeiro } from '@/types/data';

export const useFinanceiroCrud = (setFinanceiro: React.Dispatch<React.SetStateAction<Financeiro[]>>) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const addFinanceiro = async (item: TablesInsert<'financeiro'>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('financeiro')
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      
      setFinanceiro(prev => [...prev, data]);
      toast({
        title: 'Sucesso',
        description: 'Registro financeiro criado com sucesso!',
      });
      return data;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao criar registro financeiro',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateFinanceiro = async (id: string, updates: TablesUpdate<'financeiro'>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('financeiro')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setFinanceiro(prev => prev.map(f => f.id === id ? data : f));
      toast({
        title: 'Sucesso',
        description: 'Registro financeiro atualizado com sucesso!',
      });
      return data;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao atualizar registro financeiro',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFinanceiro = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('financeiro').delete().eq('id', id);
      if (error) throw error;
      
      setFinanceiro(prev => prev.filter(f => f.id !== id));
      toast({
        title: 'Sucesso',
        description: 'Registro financeiro excluído com sucesso!',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao excluir registro financeiro',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addFinanceiro,
    updateFinanceiro,
    deleteFinanceiro,
    isLoading,
  };
};