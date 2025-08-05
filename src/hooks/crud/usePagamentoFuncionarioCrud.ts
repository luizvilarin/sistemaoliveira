import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { PagamentoFuncionario } from '@/types/data';

export const usePagamentoFuncionarioCrud = (setPagamentos: React.Dispatch<React.SetStateAction<PagamentoFuncionario[]>>) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const addPagamento = async (pagamento: TablesInsert<'pagamentos_funcionarios'>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pagamentos_funcionarios')
        .insert(pagamento)
        .select(`
          *,
          cuidador:cuidadores(*)
        `)
        .single();
      
      if (error) throw error;
      
      setPagamentos(prev => [...prev, data]);
      toast({
        title: 'Sucesso',
        description: 'Pagamento registrado com sucesso!',
      });
      return data;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao registrar pagamento',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePagamento = async (id: string, updates: TablesUpdate<'pagamentos_funcionarios'>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pagamentos_funcionarios')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          cuidador:cuidadores(*)
        `)
        .single();
      
      if (error) throw error;
      
      setPagamentos(prev => prev.map(p => p.id === id ? data : p));
      toast({
        title: 'Sucesso',
        description: 'Pagamento atualizado com sucesso!',
      });
      return data;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao atualizar pagamento',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePagamento = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('pagamentos_funcionarios').delete().eq('id', id);
      if (error) throw error;
      
      setPagamentos(prev => prev.filter(p => p.id !== id));
      toast({
        title: 'Sucesso',
        description: 'Pagamento excluído com sucesso!',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao excluir pagamento',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addPagamento,
    updatePagamento,
    deletePagamento,
    isLoading,
  };
};