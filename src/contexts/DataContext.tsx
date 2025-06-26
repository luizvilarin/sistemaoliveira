import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Cliente, Cuidador, Paciente, Transacao, Tarefa, Lembrete, Mensagem, Notificacao } from '@/integrations/supabase/types';
import { useToast } from '@/components/ui/use-toast';

interface DataContextType {
  // Data
  clientes: Cliente[];
  cuidadores: Cuidador[];
  pacientes: Paciente[];
  transacoes: Transacao[];
  tarefas: Tarefa[];
  lembretes: Lembrete[];
  mensagens: Mensagem[];
  notificacoes: Notificacao[];
  
  // Loading states
  isLoading: boolean;
  
  // CRUD operations
  addCliente: (cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCliente: (id: string, updates: Partial<Cliente>) => Promise<void>;
  deleteCliente: (id: string) => Promise<void>;
  
  addCuidador: (cuidador: Omit<Cuidador, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCuidador: (id: string, updates: Partial<Cuidador>) => Promise<void>;
  deleteCuidador: (id: string) => Promise<void>;
  
  addPaciente: (paciente: Omit<Paciente, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePaciente: (id: string, updates: Partial<Paciente>) => Promise<void>;
  deletePaciente: (id: string) => Promise<void>;
  
  addTransacao: (transacao: Omit<Transacao, 'id' | 'created_at'>) => Promise<void>;
  updateTransacao: (id: string, updates: Partial<Transacao>) => Promise<void>;
  deleteTransacao: (id: string) => Promise<void>;
  
  addTarefa: (tarefa: Omit<Tarefa, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTarefa: (id: string, updates: Partial<Tarefa>) => Promise<void>;
  deleteTarefa: (id: string) => Promise<void>;
  
  addLembrete: (lembrete: Omit<Lembrete, 'id' | 'created_at'>) => Promise<void>;
  updateLembrete: (id: string, updates: Partial<Lembrete>) => Promise<void>;
  deleteLembrete: (id: string) => Promise<void>;
  
  addMensagem: (mensagem: Omit<Mensagem, 'id' | 'created_at'>) => Promise<void>;
  updateMensagem: (id: string, updates: Partial<Mensagem>) => Promise<void>;
  deleteMensagem: (id: string) => Promise<void>;
  
  addNotificacao: (notificacao: Omit<Notificacao, 'id' | 'created_at'>) => Promise<void>;
  updateNotificacao: (id: string, updates: Partial<Notificacao>) => Promise<void>;
  deleteNotificacao: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cuidadores, setCuidadores] = useState<Cuidador[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data
  const fetchAllData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Fetch all data in parallel
      const [
        clientesRes,
        cuidadoresRes,
        pacientesRes,
        transacoesRes,
        tarefasRes,
        lembretesRes,
        mensagensRes,
        notificacoesRes
      ] = await Promise.all([
        supabase.from('clientes').select('*'),
        supabase.from('cuidadores').select(`
          *,
          cliente:clientes(*)
        `),
        supabase.from('pacientes').select(`
          *,
          cliente:clientes(*),
          cuidador:cuidadores(*)
        `),
        supabase.from('transacoes').select(`
          *,
          cliente:clientes(*)
        `),
        supabase.from('tarefas').select(`
          *,
          cliente:clientes(*),
          cuidador:cuidadores(*)
        `),
        supabase.from('lembretes').select(`
          *,
          cliente:clientes(*),
          cuidador:cuidadores(*)
        `),
        supabase.from('mensagens').select('*').eq('destinatario_id', user.id),
        supabase.from('notificacoes').select('*').eq('usuario_id', user.id)
      ]);

      // Update state with real data from database
      if (clientesRes.data) setClientes(clientesRes.data as Cliente[]);
      if (cuidadoresRes.data) setCuidadores(cuidadoresRes.data as Cuidador[]);
      if (pacientesRes.data) setPacientes(pacientesRes.data as Paciente[]);
      if (transacoesRes.data) setTransacoes(transacoesRes.data as Transacao[]);
      if (tarefasRes.data) setTarefas(tarefasRes.data as Tarefa[]);
      if (lembretesRes.data) setLembretes(lembretesRes.data as Lembrete[]);
      if (mensagensRes.data) setMensagens(mensagensRes.data as Mensagem[]);
      if (notificacoesRes.data) setNotificacoes(notificacoesRes.data as Notificacao[]);

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

  // Load data when user changes
  useEffect(() => {
    if (user) {
      fetchAllData();
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
      setIsLoading(false);
    }
  }, [user]);

  // CRUD Operations for Clientes
  const addCliente = async (cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase.from('clientes').insert([cliente]).select().single();
    if (error) throw error;
    setClientes(prev => [...prev, data as Cliente]);
  };

  const updateCliente = async (id: string, updates: Partial<Cliente>) => {
    const { data, error } = await supabase.from('clientes').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setClientes(prev => prev.map(c => c.id === id ? data as Cliente : c));
  };

  const deleteCliente = async (id: string) => {
    const { error } = await supabase.from('clientes').delete().eq('id', id);
    if (error) throw error;
    setClientes(prev => prev.filter(c => c.id !== id));
  };

  // ... keep existing code (CRUD operations for all other entities)

  const addCuidador = async (cuidador: Omit<Cuidador, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase.from('cuidadores').insert([cuidador]).select().single();
    if (error) throw error;
    setCuidadores(prev => [...prev, data as Cuidador]);
  };

  const updateCuidador = async (id: string, updates: Partial<Cuidador>) => {
    const { data, error } = await supabase.from('cuidadores').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setCuidadores(prev => prev.map(c => c.id === id ? data as Cuidador : c));
  };

  const deleteCuidador = async (id: string) => {
    const { error } = await supabase.from('cuidadores').delete().eq('id', id);
    if (error) throw error;
    setCuidadores(prev => prev.filter(c => c.id !== id));
  };

  const addPaciente = async (paciente: Omit<Paciente, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase.from('pacientes').insert([paciente]).select().single();
    if (error) throw error;
    setPacientes(prev => [...prev, data as Paciente]);
  };

  const updatePaciente = async (id: string, updates: Partial<Paciente>) => {
    const { data, error } = await supabase.from('pacientes').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setPacientes(prev => prev.map(p => p.id === id ? data as Paciente : p));
  };

  const deletePaciente = async (id: string) => {
    const { error } = await supabase.from('pacientes').delete().eq('id', id);
    if (error) throw error;
    setPacientes(prev => prev.filter(p => p.id !== id));
  };

  const addTransacao = async (transacao: Omit<Transacao, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('transacoes').insert([transacao]).select().single();
    if (error) throw error;
    setTransacoes(prev => [...prev, data as Transacao]);
  };

  const updateTransacao = async (id: string, updates: Partial<Transacao>) => {
    const { data, error } = await supabase.from('transacoes').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setTransacoes(prev => prev.map(t => t.id === id ? data as Transacao : t));
  };

  const deleteTransacao = async (id: string) => {
    const { error } = await supabase.from('transacoes').delete().eq('id', id);
    if (error) throw error;
    setTransacoes(prev => prev.filter(t => t.id !== id));
  };

  const addTarefa = async (tarefa: Omit<Tarefa, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase.from('tarefas').insert([tarefa]).select().single();
    if (error) throw error;
    setTarefas(prev => [...prev, data as Tarefa]);
  };

  const updateTarefa = async (id: string, updates: Partial<Tarefa>) => {
    const { data, error } = await supabase.from('tarefas').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setTarefas(prev => prev.map(t => t.id === id ? data as Tarefa : t));
  };

  const deleteTarefa = async (id: string) => {
    const { error } = await supabase.from('tarefas').delete().eq('id', id);
    if (error) throw error;
    setTarefas(prev => prev.filter(t => t.id !== id));
  };

  const addLembrete = async (lembrete: Omit<Lembrete, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('lembretes').insert([lembrete]).select().single();
    if (error) throw error;
    setLembretes(prev => [...prev, data as Lembrete]);
  };

  const updateLembrete = async (id: string, updates: Partial<Lembrete>) => {
    const { data, error } = await supabase.from('lembretes').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setLembretes(prev => prev.map(l => l.id === id ? data as Lembrete : l));
  };

  const deleteLembrete = async (id: string) => {
    const { error } = await supabase.from('lembretes').delete().eq('id', id);
    if (error) throw error;
    setLembretes(prev => prev.filter(l => l.id !== id));
  };

  const addMensagem = async (mensagem: Omit<Mensagem, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('mensagens').insert([mensagem]).select().single();
    if (error) throw error;
    setMensagens(prev => [...prev, data as Mensagem]);
  };

  const updateMensagem = async (id: string, updates: Partial<Mensagem>) => {
    const { data, error } = await supabase.from('mensagens').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setMensagens(prev => prev.map(m => m.id === id ? data as Mensagem : m));
  };

  const deleteMensagem = async (id: string) => {
    const { error } = await supabase.from('mensagens').delete().eq('id', id);
    if (error) throw error;
    setMensagens(prev => prev.filter(m => m.id !== id));
  };

  const addNotificacao = async (notificacao: Omit<Notificacao, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('notificacoes').insert([notificacao]).select().single();
    if (error) throw error;
    setNotificacoes(prev => [...prev, data as Notificacao]);
  };

  const updateNotificacao = async (id: string, updates: Partial<Notificacao>) => {
    const { data, error } = await supabase.from('notificacoes').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setNotificacoes(prev => prev.map(n => n.id === id ? data as Notificacao : n));
  };

  const deleteNotificacao = async (id: string) => {
    const { error } = await supabase.from('notificacoes').delete().eq('id', id);
    if (error) throw error;
    setNotificacoes(prev => prev.filter(n => n.id !== id));
  };

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
        
        // Loading
        isLoading,
        
        // CRUD operations
        addCliente,
        updateCliente,
        deleteCliente,
        
        addCuidador,
        updateCuidador,
        deleteCuidador,
        
        addPaciente,
        updatePaciente,
        deletePaciente,
        
        addTransacao,
        updateTransacao,
        deleteTransacao,
        
        addTarefa,
        updateTarefa,
        deleteTarefa,
        
        addLembrete,
        updateLembrete,
        deleteLembrete,
        
        addMensagem,
        updateMensagem,
        deleteMensagem,
        
        addNotificacao,
        updateNotificacao,
        deleteNotificacao,
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
