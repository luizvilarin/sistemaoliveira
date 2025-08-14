import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export interface NotaFiscal {
  id: string;
  cliente_id: string;
  periodo: string;
  cpf_tomador: string;
  responsavel_pagador: string;
  emissor_nf: string;
  valor_nf: number;
  status_envio: string;
  data_emissao: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export const useNotaFiscalCrud = (setNotasFiscais: React.Dispatch<React.SetStateAction<NotaFiscal[]>>) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const addNotaFiscal = async (notaFiscal: TablesInsert<'notas_fiscais'>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notas_fiscais')
        .insert(notaFiscal)
        .select()
        .single();
      
      if (error) throw error;
      
      setNotasFiscais(prev => [...prev, data]);
      toast({
        title: 'Sucesso',
        description: 'Nota fiscal criada com sucesso!',
      });
      return data;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao criar nota fiscal',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateNotaFiscal = async (id: string, updates: TablesUpdate<'notas_fiscais'>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notas_fiscais')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setNotasFiscais(prev => prev.map(nf => nf.id === id ? data : nf));
      toast({
        title: 'Sucesso',
        description: 'Nota fiscal atualizada com sucesso!',
      });
      return data;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao atualizar nota fiscal',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNotaFiscal = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('notas_fiscais').delete().eq('id', id);
      if (error) throw error;
      
      setNotasFiscais(prev => prev.filter(nf => nf.id !== id));
      toast({
        title: 'Sucesso',
        description: 'Nota fiscal excluída com sucesso!',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao excluir nota fiscal',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addNotaFiscal,
    updateNotaFiscal,
    deleteNotaFiscal,
    isLoading,
  };
};