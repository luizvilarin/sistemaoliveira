import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { PagamentoFuncionario } from '@/types/data';

export const usePagamentoFuncionarioCrud = (setPagamentos: React.Dispatch<React.SetStateAction<PagamentoFuncionario[]>>) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const addPagamento = async (pagamento: any) => {
    setIsLoading(true);
    try {
      // Ensure we have the current user for created_by
      const { data: { user } } = await supabase.auth.getUser();
      
      const paymentData = {
        ...pagamento,
        created_by: user?.id,
        // Ensure cuidador_id is set to null if we're using nome_funcionario
        cuidador_id: null
      };

      const { data, error } = await supabase
        .from('pagamentos_funcionarios')
        .insert(paymentData)
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Sincronizar com o sistema financeiro se estiver pago
      if (data.status === 'pago') {
        try {
          const financeiroEntry = {
            tipo: 'despesa',
            categoria: data.tipo_pagamento === 'salario' ? 'Salários e Ordenados' :
                      data.tipo_pagamento === 'bonus' ? 'Bonificações' :
                      data.tipo_pagamento === 'comissao' ? 'Comissões' :
                      data.tipo_pagamento === 'ajuda_custo' ? 'Ajuda de Custo' :
                      'Outras Despesas com Pessoal',
            valor: data.valor,
            data_transacao: data.data_pagamento,
            descricao: `Pagamento funcionário: ${data.nome_funcionario || 'N/A'}${data.descricao ? ' - ' + data.descricao : ''}`,
            referencia_id: data.id,
            referencia_tipo: 'pagamento_funcionario',
            created_by: data.created_by
          };

          await supabase
            .from('financeiro')
            .insert(financeiroEntry);
        } catch (financeiroError) {
          console.warn('Erro ao sincronizar com financeiro:', financeiroError);
        }
      }
      
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
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Atualizar no sistema financeiro se necessário
      if (updates.status === 'pago' || updates.valor || updates.data_pagamento) {
        try {
          if (updates.status === 'pago') {
            // Se mudou para pago, criar entrada no financeiro
            const financeiroEntry = {
              tipo: 'despesa',
              categoria: data.tipo_pagamento === 'salario' ? 'Salários e Ordenados' :
                        data.tipo_pagamento === 'bonus' ? 'Bonificações' :
                        data.tipo_pagamento === 'comissao' ? 'Comissões' :
                        data.tipo_pagamento === 'ajuda_custo' ? 'Ajuda de Custo' :
                        'Outras Despesas com Pessoal',
              valor: data.valor,
              data_transacao: data.data_pagamento,
              descricao: `Pagamento funcionário: ${data.nome_funcionario || 'N/A'}${data.descricao ? ' - ' + data.descricao : ''}`,
              referencia_id: data.id,
              referencia_tipo: 'pagamento_funcionario',
              created_by: data.created_by
            };

            await supabase
              .from('financeiro')
              .insert(financeiroEntry);
          } else {
            // Atualizar entrada existente
            const financeiroUpdates: any = {};
            if (updates.valor) financeiroUpdates.valor = updates.valor;
            if (updates.data_pagamento) financeiroUpdates.data_transacao = updates.data_pagamento;
            
            if (Object.keys(financeiroUpdates).length > 0) {
              await supabase
                .from('financeiro')
                .update(financeiroUpdates)
                .eq('referencia_id', id)
                .eq('referencia_tipo', 'pagamento_funcionario');
            }
          }
        } catch (financeiroError) {
          console.warn('Erro ao sincronizar com financeiro:', financeiroError);
        }
      }
      
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
      console.log('Removendo pagamento:', id);
      
      // Primeiro, remover todas as entradas correspondentes no sistema financeiro
      const { error: financeiroError, count } = await supabase
        .from('financeiro')
        .delete({ count: 'exact' })
        .eq('referencia_id', id)
        .eq('referencia_tipo', 'pagamento_funcionario');
      
      if (financeiroError) {
        console.error('Erro ao remover do financeiro:', financeiroError);
        throw new Error('Erro ao sincronizar com sistema financeiro');
      }
      
      console.log(`Removidos ${count} registros do financeiro`);
      
      // Depois, remover o pagamento
      const { error } = await supabase.from('pagamentos_funcionarios').delete().eq('id', id);
      if (error) throw error;
      
      setPagamentos(prev => prev.filter(p => p.id !== id));
      toast({
        title: 'Sucesso',
        description: 'Pagamento e registros financeiros removidos com sucesso!',
      });
    } catch (error: any) {
      console.error('Erro completo ao deletar:', error);
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