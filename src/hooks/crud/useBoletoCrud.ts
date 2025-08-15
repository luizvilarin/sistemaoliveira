import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { Boleto } from '@/types/data';

export const useBoletoCrud = (setBoletos: React.Dispatch<React.SetStateAction<Boleto[]>>) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const addBoleto = async (boleto: any) => {
    setIsLoading(true);
    try {
      console.log('🔄 [useBoletoCrud] addBoleto iniciado');
      console.log('📥 [useBoletoCrud] Dados recebidos:', boleto);
      
      // Validações básicas antes da conversão
      if (!boleto.cliente_id) throw new Error('Cliente ID é obrigatório');
      if (!boleto.tipo_plantao) throw new Error('Tipo de plantão é obrigatório');
      if (!boleto.cuidadoras || !Array.isArray(boleto.cuidadoras) || boleto.cuidadoras.length === 0) {
        throw new Error('Lista de cuidadoras é obrigatória e deve ter pelo menos um item');
      }
      if (!boleto.valor || boleto.valor <= 0) throw new Error('Valor deve ser maior que zero');
      if (!boleto.dia_vencimento || boleto.dia_vencimento < 1 || boleto.dia_vencimento > 31) {
        throw new Error('Dia de vencimento deve estar entre 1 e 31');
      }

      // Convert string values to proper types with validation
      const boletoData = {
        ...boleto,
        notificacao_dias_antes: boleto.notificacao_dias_antes ? parseInt(boleto.notificacao_dias_antes) : 2,
        dia_vencimento: typeof boleto.dia_vencimento === 'string' ? parseInt(boleto.dia_vencimento) : boleto.dia_vencimento,
        dia_cobranca_secundario: boleto.dia_cobranca_secundario ? parseInt(boleto.dia_cobranca_secundario) : null,
        valor: typeof boleto.valor === 'string' ? parseFloat(boleto.valor) : boleto.valor,
        valor_personalizado: boleto.valor_personalizado ? (typeof boleto.valor_personalizado === 'string' ? parseFloat(boleto.valor_personalizado) : boleto.valor_personalizado) : null
      };

      console.log('⚙️ [useBoletoCrud] Dados processados para inserção:', boletoData);
      console.log('🎯 [useBoletoCrud] Tipos dos campos:');
      console.log('  - cliente_id:', typeof boletoData.cliente_id, boletoData.cliente_id);
      console.log('  - valor:', typeof boletoData.valor, boletoData.valor);
      console.log('  - dia_vencimento:', typeof boletoData.dia_vencimento, boletoData.dia_vencimento);
      console.log('  - tipo_plantao:', typeof boletoData.tipo_plantao, boletoData.tipo_plantao);
      console.log('  - cuidadoras:', typeof boletoData.cuidadoras, boletoData.cuidadoras);
      console.log('  - status:', typeof boletoData.status, boletoData.status);

      console.log('🚀 [useBoletoCrud] Iniciando inserção no Supabase...');
      const { data, error } = await supabase
        .from('boletos')
        .insert(boletoData)
        .select(`
          *,
          cliente:clientes(*)
        `)
        .single();
      
      console.log('📋 [useBoletoCrud] Resultado da inserção:');
      console.log('  - data:', data);
      console.log('  - error:', error);
      
      if (error) {
        console.error('❌ [useBoletoCrud] Erro detalhado da inserção:', error);
        console.error('❌ [useBoletoCrud] Código do erro:', error.code);
        console.error('❌ [useBoletoCrud] Mensagem do erro:', error.message);
        console.error('❌ [useBoletoCrud] Detalhes do erro:', error.details);
        console.error('❌ [useBoletoCrud] Dica do erro:', error.hint);
        throw new Error(`Erro do banco de dados: ${error.message} (${error.code})`);
      }
      
      console.log('✅ [useBoletoCrud] Boleto criado com sucesso!');
      setBoletos(prev => [...prev, data]);
      toast({
        title: 'Sucesso',
        description: 'Boleto criado com sucesso!',
      });
      return data;
    } catch (error: any) {
      console.error('💥 [useBoletoCrud] Erro geral no addBoleto:', error);
      console.error('💥 [useBoletoCrud] Tipo do erro:', typeof error);
      console.error('💥 [useBoletoCrud] Stack trace:', error.stack);
      
      let errorMessage = 'Erro desconhecido ao criar boleto';
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        variant: 'destructive',
        title: 'Erro ao criar boleto',
        description: errorMessage,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBoleto = async (id: string, updates: TablesUpdate<'boletos'>) => {
    setIsLoading(true);
    try {
      // Buscar dados do boleto antes da atualização
      const { data: boletoAntes } = await supabase
        .from('boletos')
        .select('*')
        .eq('id', id)
        .single();

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
      
      // Se o status mudou para 'pago', criar entrada no financeiro automaticamente
      if (boletoAntes && boletoAntes.status !== 'pago' && data.status === 'pago') {
        await criarEntradaFinanceira(data);
      }
      
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

  const criarEntradaFinanceira = async (boleto: any) => {
    try {
      await supabase.from('financeiro').insert({
        tipo: 'receita',
        categoria: 'Receitas de Clientes',
        valor: boleto.valor_personalizado || boleto.valor,
        data_transacao: boleto.data_confirmacao_pago || boleto.data_pagamento || new Date().toISOString().split('T')[0],
        descricao: `Pagamento boleto - ${boleto.cliente?.nome} - ${boleto.tipo_plantao}`,
        referencia_tipo: 'boleto',
        referencia_id: boleto.id,
        created_by: (await supabase.auth.getUser()).data.user?.id
      });
    } catch (error) {
      console.error('Erro ao criar entrada financeira:', error);
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