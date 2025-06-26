
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useToast } from '@/components/ui/use-toast';

// Type definitions based on Supabase schema
type Cliente = Tables<'clientes'>;
type Cuidador = Tables<'cuidadores'>;
type Paciente = Tables<'pacientes'>;
type Transacao = Tables<'transacoes'>;
type Tarefa = Tables<'tarefas'>;
type Lembrete = Tables<'lembretes'>;
type Mensagem = Tables<'mensagens'>;
type Notificacao = Tables<'notificacoes'>;

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
  addCliente: (cliente: TablesInsert<'clientes'>) => Promise<void>;
  updateCliente: (id: string, updates: TablesUpdate<'clientes'>) => Promise<void>;
  deleteCliente: (id: string) => Promise<void>;
  
  addCuidador: (cuidador: TablesInsert<'cuidadores'>) => Promise<void>;
  updateCuidador: (id: string, updates: TablesUpdate<'cuidadores'>) => Promise<void>;
  deleteCuidador: (id: string) => Promise<void>;
  
  addPaciente: (paciente: TablesInsert<'pacientes'>) => Promise<void>;
  updatePaciente: (id: string, updates: TablesUpdate<'pacientes'>) => Promise<void>;
  deletePaciente: (id: string) => Promise<void>;
  
  addTransacao: (transacao: TablesInsert<'transacoes'>) => Promise<void>;
  updateTransacao: (id: string, updates: TablesUpdate<'transacoes'>) => Promise<void>;
  deleteTransacao: (id: string) => Promise<void>;
  
  addTarefa: (tarefa: TablesInsert<'tarefas'>) => Promise<void>;
  updateTarefa: (id: string, updates: TablesUpdate<'tarefas'>) => Promise<void>;
  deleteTarefa: (id: string) => Promise<void>;
  
  addLembrete: (lembrete: TablesInsert<'lembretes'>) => Promise<void>;
  updateLembrete: (id: string, updates: TablesUpdate<'lembretes'>) => Promise<void>;
  deleteLembrete: (id: string) => Promise<void>;
  
  addMensagem: (mensagem: TablesInsert<'mensagens'>) => Promise<void>;
  updateMensagem: (id: string, updates: TablesUpdate<'mensagens'>) => Promise<void>;
  deleteMensagem: (id: string) => Promise<void>;
  
  addNotificacao: (notificacao: TablesInsert<'notificacoes'>) => Promise<void>;
  updateNotificacao: (id: string, updates: TablesUpdate<'notificacoes'>) => Promise<void>;
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
        supabase.from('cuidadores').select('*'),
        supabase.from('pacientes').select('*'),
        supabase.from('transacoes').select('*'),
        supabase.from('tarefas').select('*'),
        supabase.from('lembretes').select('*'),
        supabase.from('mensagens').select('*').eq('destinatario_id', user.id),
        supabase.from('notificacoes').select('*').eq('usuario_id', user.id)
      ]);

      // Update state with real data from database
      if (clientesRes.data) setClientes(clientesRes.data);
      if (cuidadoresRes.data) setCuidadores(cuidadoresRes.data);
      if (pacientesRes.data) setPacientes(pacientesRes.data);
      if (transacoesRes.data) setTransacoes(transacoesRes.data);
      if (tarefasRes.data) setTarefas(tarefasRes.data);
      if (lembretesRes.data) setLembretes(lembretesRes.data);
      if (mensagensRes.data) setMensagens(mensagensRes.data);
      if (notificacoesRes.data) setNotificacoes(notificacoesRes.data);

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
  const addCliente = async (cliente: TablesInsert<'clientes'>) => {
    const { data, error } = await supabase.from('clientes').insert(cliente).select().single();
    if (error) throw error;
    setClientes(prev => [...prev, data]);
  };

  const updateCliente = async (id: string, updates: TablesUpdate<'clientes'>) => {
    const { data, error } = await supabase.from('clientes').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setClientes(prev => prev.map(c => c.id === id ? data : c));
  };

  const deleteCliente = async (id: string) => {
    const { error } = await supabase.from('clientes').delete().eq('id', id);
    if (error) throw error;
    setClientes(prev => prev.filter(c => c.id !== id));
  };

  // CRUD Operations for Cuidadores
  const addCuidador = async (cuidador: TablesInsert<'cuidadores'>) => {
    const { data, error } = await supabase.from('cuidadores').insert(cuidador).select().single();
    if (error) throw error;
    setCuidadores(prev => [...prev, data]);
  };

  const updateCuidador = async (id: string, updates: TablesUpdate<'cuidadores'>) => {
    const { data, error } = await supabase.from('cuidadores').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setCuidadores(prev => prev.map(c => c.id === id ? data : c));
  };

  const deleteCuidador = async (id: string) => {
    const { error } = await supabase.from('cuidadores').delete().eq('id', id);
    if (error) throw error;
    setCuidadores(prev => prev.filter(c => c.id !== id));
  };

  // CRUD Operations for Pacientes
  const addPaciente = async (paciente: TablesInsert<'pacientes'>) => {
    const { data, error } = await supabase.from('pacientes').insert(paciente).select().single();
    if (error) throw error;
    setPacientes(prev => [...prev, data]);
  };

  const updatePaciente = async (id: string, updates: TablesUpdate<'pacientes'>) => {
    const { data, error } = await supabase.from('pacientes').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setPacientes(prev => prev.map(p => p.id === id ? data : p));
  };

  const deletePaciente = async (id: string) => {
    const { error } = await supabase.from('pacientes').delete().eq('id', id);
    if (error) throw error;
    setPacientes(prev => prev.filter(p => p.id !== id));
  };

  // CRUD Operations for Transacoes
  const addTransacao = async (transacao: TablesInsert<'transacoes'>) => {
    const { data, error } = await supabase.from('transacoes').insert(transacao).select().single();
    if (error) throw error;
    setTransacoes(prev => [...prev, data]);
  };

  const updateTransacao = async (id: string, updates: TablesUpdate<'transacoes'>) => {
    const { data, error } = await supabase.from('transacoes').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setTransacoes(prev => prev.map(t => t.id === id ? data : t));
  };

  const deleteTransacao = async (id: string) => {
    const { error } = await supabase.from('transacoes').delete().eq('id', id);
    if (error) throw error;
    setTransacoes(prev => prev.filter(t => t.id !== id));
  };

  // CRUD Operations for Tarefas
  const addTarefa = async (tarefa: TablesInsert<'tarefas'>) => {
    const { data, error } = await supabase.from('tarefas').insert(tarefa).select().single();
    if (error) throw error;
    setTarefas(prev => [...prev, data]);
  };

  const updateTarefa = async (id: string, updates: TablesUpdate<'tarefas'>) => {
    const { data, error } = await supabase.from('tarefas').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setTarefas(prev => prev.map(t => t.id === id ? data : t));
  };

  const deleteTarefa = async (id: string) => {
    const { error } = await supabase.from('tarefas').delete().eq('id', id);
    if (error) throw error;
    setTarefas(prev => prev.filter(t => t.id !== id));
  };

  // CRUD Operations for Lembretes
  const addLembrete = async (lembrete: TablesInsert<'lembretes'>) => {
    const { data, error } = await supabase.from('lembretes').insert(lembrete).select().single();
    if (error) throw error;
    setLembretes(prev => [...prev, data]);
  };

  const updateLembrete = async (id: string, updates: TablesUpdate<'lembretes'>) => {
    const { data, error } = await supabase.from('lembretes').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setLembretes(prev => prev.map(l => l.id === id ? data : l));
  };

  const deleteLembrete = async (id: string) => {
    const { error } = await supabase.from('lembretes').delete().eq('id', id);
    if (error) throw error;
    setLembretes(prev => prev.filter(l => l.id !== id));
  };

  // CRUD Operations for Mensagens
  const addMensagem = async (mensagem: TablesInsert<'mensagens'>) => {
    const { data, error } = await supabase.from('mensagens').insert(mensagem).select().single();
    if (error) throw error;
    setMensagens(prev => [...prev, data]);
  };

  const updateMensagem = async (id: string, updates: TablesUpdate<'mensagens'>) => {
    const { data, error } = await supabase.from('mensagens').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setMensagens(prev => prev.map(m => m.id === id ? data : m));
  };

  const deleteMensagem = async (id: string) => {
    const { error } = await supabase.from('mensagens').delete().eq('id', id);
    if (error) throw error;
    setMensagens(prev => prev.filter(m => m.id !== id));
  };

  // CRUD Operations for Notificacoes
  const addNotificacao = async (notificacao: TablesInsert<'notificacoes'>) => {
    const { data, error } = await supabase.from('notificacoes').insert(notificacao).select().single();
    if (error) throw error;
    setNotificacoes(prev => [...prev, data]);
  };

  const updateNotificacao = async (id: string, updates: TablesUpdate<'notificacoes'>) => {
    const { data, error } = await supabase.from('notificacoes').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setNotificacoes(prev => prev.map(n => n.id === id ? data : n));
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
