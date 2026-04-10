
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DataContextType } from './DataContextTypes';
import { fetchAllData } from '@/services/dataService';
import { useCrudOperations } from '@/hooks/useCrudOperations';
import useTaskNotifications from '@/hooks/useTaskNotifications';
import {
  Cliente,
  Cuidador,
  Paciente,
  Transacao,
  Tarefa,
  Lembrete,
  Mensagem,
  Notificacao,
  NotificacaoSistema,
  Boleto,
  PagamentoFuncionario,
  Financeiro,
  NotaFiscal,
  KanbanColuna
} from '@/types/data';

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Usar hook de notificações de tarefas
  useTaskNotifications();
  
  // State
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cuidadores, setCuidadores] = useState<Cuidador[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [notificacoesSistema, setNotificacoesSistema] = useState<NotificacaoSistema[]>([]);
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [pagamentosFuncionarios, setPagamentosFuncionarios] = useState<PagamentoFuncionario[]>([]);
  const [financeiro, setFinanceiro] = useState<Financeiro[]>([]);
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscal[]>([]);
  const [kanbanColunas, setKanbanColunas] = useState<KanbanColuna[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get CRUD operations
  const crudOperations = useCrudOperations(
    setClientes,
    setCuidadores,
    setPacientes,
    setTransacoes,
    setTarefas,
    setLembretes,
    setMensagens,
    setNotificacoes,
    setNotificacoesSistema,
    setBoletos,
    setPagamentosFuncionarios,
    setFinanceiro,
    setNotasFiscais,
    setKanbanColunas
  );

  // Fetch all data
  const fetchData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await fetchAllData(user);
      
      if (data) {
        setClientes(data.clientes);
        setCuidadores(data.cuidadores);
        setPacientes(data.pacientes);
        setTransacoes(data.transacoes);
        setTarefas(data.tarefas);
        setLembretes(data.lembretes);
        setMensagens(data.mensagens);
        setNotificacoes(data.notificacoes);
        setNotificacoesSistema(data.notificacoesSistema);
        setBoletos(data.boletos);
        setPagamentosFuncionarios(data.pagamentosFuncionarios);
        setFinanceiro(data.financeiro);
        setNotasFiscais(data.notasFiscais);
        setKanbanColunas(data.kanbanColunas);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados do sistema.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data method
  const refreshData = async () => {
    await fetchData();
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      // Clear data when user logs out
      setClientes([]);
      setCuidadores([]);
      setPacientes([]);
      setTransacoes([]);
      setTarefas([]);
      setLembretes([]);
      setMensagens([]);
      setNotificacoes([]);
      setNotificacoesSistema([]);
      setBoletos([]);
      setPagamentosFuncionarios([]);
      setFinanceiro([]);
      setNotasFiscais([]);
      setIsLoading(false);
    }
  }, [user]);

  return (
    <DataContext.Provider
      value={{
        // Data
        clientes,
        cuidadores,
        pacientes,
        transacoes,
        tarefas,
        lembretes,
        mensagens,
        notificacoes,
        notificacoesSistema,
        boletos,
        pagamentosFuncionarios,
        financeiro,
        notasFiscais,
        kanbanColunas,
        
        // Loading
        isLoading,
        
        // Refresh method
        refreshData,
        
        // State setters
        setFinanceiro,
        
        // CRUD operations
        ...crudOperations,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData deve ser usado dentro de um DataProvider');
  }
  return context;
};
