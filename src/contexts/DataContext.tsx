
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

// Interfaces para os dados
interface Cliente {
  id: string;
  nome: string;
  contato: string;
  tipo: 'fixo' | 'temporario';
  status: 'ativo' | 'pausado' | 'terceirizado';
  endereco?: string;
  created_at: string;
  updated_at: string;
}

interface Paciente {
  id: string;
  nome: string;
  cliente_id: string;
  cuidador_id?: string;
  historico_medico?: string;
  contrato_ativo: boolean;
  valor_contrato?: number;
  created_at: string;
  updated_at: string;
  cliente?: Cliente;
  cuidador?: Cuidador;
}

interface Cuidador {
  id: string;
  nome: string;
  especializacao: string;
  telefone?: string;
  email?: string;
  cliente_id?: string;
  disponibilidade: Record<string, any>;
  created_at: string;
  updated_at: string;
  cliente?: Cliente;
  pacientes?: Paciente[];
}

interface Transacao {
  id: string;
  cliente_id: string;
  valor: number;
  status: 'confirmado' | 'aguardando' | 'expirado';
  data: string;
  created_at: string;
  cliente?: Cliente;
}

interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  status: 'todo' | 'inProgress' | 'done';
  cliente_id: string;
  cuidador_id: string;
  created_at: string;
  updated_at: string;
  cliente?: Cliente;
  cuidador?: Cuidador;
}

interface Lembrete {
  id: string;
  titulo: string;
  descricao?: string;
  dia: string;
  residencia: string;
  responsavel_id: string;
  cliente_id?: string;
  cuidador_id?: string;
  created_at: string;
  cliente?: Cliente;
  cuidador?: Cuidador;
}

interface Notificacao {
  id: string;
  mensagem: string;
  usuario_id: string;
  lida: boolean;
  created_at: string;
}

interface Mensagem {
  id: string;
  remetente_id: string;
  destinatario_id?: string;
  assunto: string;
  conteudo: string;
  lida: boolean;
  created_at: string;
}

interface DataContextType {
  clientes: Cliente[];
  pacientes: Paciente[];
  cuidadores: Cuidador[];
  transacoes: Transacao[];
  tarefas: Tarefa[];
  lembretes: Lembrete[];
  notificacoes: Notificacao[];
  mensagens: Mensagem[];
  addCliente: (cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  addPaciente: (paciente: Omit<Paciente, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  addCuidador: (cuidador: Omit<Cuidador, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  addTransacao: (transacao: Omit<Transacao, 'id' | 'created_at'>) => Promise<void>;
  addTarefa: (tarefa: Omit<Tarefa, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  addLembrete: (lembrete: Omit<Lembrete, 'id' | 'created_at'>) => Promise<void>;
  addNotificacao: (notificacao: Omit<Notificacao, 'id' | 'created_at'>) => Promise<void>;
  updateTransacao: (id: string, data: Partial<Transacao>) => Promise<void>;
  updateCliente: (id: string, data: Partial<Cliente>) => Promise<void>;
  updateTarefa: (id: string, data: Partial<Tarefa>) => Promise<void>;
  updatePaciente: (id: string, data: Partial<Paciente>) => Promise<void>;
  updateCuidador: (id: string, data: Partial<Cuidador>) => Promise<void>;
  getClienteById: (id: string) => Cliente | undefined;
  isLoading: boolean;
  refetchData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const { user, session } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cuidadores, setCuidadores] = useState<Cuidador[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchData = async () => {
    if (!session) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch clientes
      const { data: clientesData } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch cuidadores with cliente relation
      const { data: cuidadoresData } = await supabase
        .from('cuidadores')
        .select(`
          *,
          cliente:clientes(*)
        `)
        .order('created_at', { ascending: false });

      // Fetch pacientes with cliente and cuidador relations
      const { data: pacientesData } = await supabase
        .from('pacientes')
        .select(`
          *,
          cliente:clientes(*),
          cuidador:cuidadores(*)
        `)
        .order('created_at', { ascending: false });

      // Fetch transacoes with cliente relation
      const { data: transacoesData } = await supabase
        .from('transacoes')
        .select(`
          *,
          cliente:clientes(*)
        `)
        .order('created_at', { ascending: false });

      // Fetch tarefas with relations
      const { data: tarefasData } = await supabase
        .from('tarefas')
        .select(`
          *,
          cliente:clientes(*),
          cuidador:cuidadores(*)
        `)
        .order('created_at', { ascending: false });

      // Fetch lembretes with relations
      const { data: lembretesData } = await supabase
        .from('lembretes')
        .select(`
          *,
          cliente:clientes(*),
          cuidador:cuidadores(*)
        `)
        .order('created_at', { ascending: false });

      // Fetch notificacoes for current user
      const { data: notificacoesData } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('usuario_id', user?.id)
        .order('created_at', { ascending: false });

      // Fetch mensagens for current user
      const { data: mensagensData } = await supabase
        .from('mensagens')
        .select('*')
        .or(`remetente_id.eq.${user?.id},destinatario_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      setClientes(clientesData || []);
      setCuidadores(cuidadoresData || []);
      setPacientes(pacientesData || []);
      setTransacoes(transacoesData || []);
      setTarefas(tarefasData || []);
      setLembretes(lembretesData || []);
      setNotificacoes(notificacoesData || []);
      setMensagens(mensagensData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session, user]);

  const addCliente = async (cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('clientes')
      .insert(cliente)
      .select()
      .single();

    if (error) throw error;
    if (data) {
      setClientes(prev => [data, ...prev]);
    }
  };

  const addPaciente = async (paciente: Omit<Paciente, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('pacientes')
      .insert(paciente)
      .select(`
        *,
        cliente:clientes(*),
        cuidador:cuidadores(*)
      `)
      .single();

    if (error) throw error;
    if (data) {
      setPacientes(prev => [data, ...prev]);
    }
  };

  const addCuidador = async (cuidador: Omit<Cuidador, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('cuidadores')
      .insert(cuidador)
      .select(`
        *,
        cliente:clientes(*)
      `)
      .single();

    if (error) throw error;
    if (data) {
      setCuidadores(prev => [data, ...prev]);
    }
  };

  const addTransacao = async (transacao: Omit<Transacao, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('transacoes')
      .insert(transacao)
      .select(`
        *,
        cliente:clientes(*)
      `)
      .single();

    if (error) throw error;
    if (data) {
      setTransacoes(prev => [data, ...prev]);
    }
  };

  const addTarefa = async (tarefa: Omit<Tarefa, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('tarefas')
      .insert(tarefa)
      .select(`
        *,
        cliente:clientes(*),
        cuidador:cuidadores(*)
      `)
      .single();

    if (error) throw error;
    if (data) {
      setTarefas(prev => [data, ...prev]);
    }
  };

  const addLembrete = async (lembrete: Omit<Lembrete, 'id' | 'created_at'>) => {
    const lembreteData = {
      ...lembrete,
      responsavel_id: user?.id || '',
    };

    const { data, error } = await supabase
      .from('lembretes')
      .insert(lembreteData)
      .select(`
        *,
        cliente:clientes(*),
        cuidador:cuidadores(*)
      `)
      .single();

    if (error) throw error;
    if (data) {
      setLembretes(prev => [data, ...prev]);
    }
  };

  const addNotificacao = async (notificacao: Omit<Notificacao, 'id' | 'created_at'>) => {
    const notificacaoData = {
      ...notificacao,
      usuario_id: user?.id || '',
    };

    const { data, error } = await supabase
      .from('notificacoes')
      .insert(notificacaoData)
      .select()
      .single();

    if (error) throw error;
    if (data) {
      setNotificacoes(prev => [data, ...prev]);
    }
  };

  const updateTransacao = async (id: string, updateData: Partial<Transacao>) => {
    const { data, error } = await supabase
      .from('transacoes')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        cliente:clientes(*)
      `)
      .single();

    if (error) throw error;
    if (data) {
      setTransacoes(prev => prev.map(t => t.id === id ? data : t));
    }
  };

  const updateCliente = async (id: string, updateData: Partial<Cliente>) => {
    const { data, error } = await supabase
      .from('clientes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (data) {
      setClientes(prev => prev.map(c => c.id === id ? data : c));
    }
  };

  const updateTarefa = async (id: string, updateData: Partial<Tarefa>) => {
    const { data, error } = await supabase
      .from('tarefas')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        cliente:clientes(*),
        cuidador:cuidadores(*)
      `)
      .single();

    if (error) throw error;
    if (data) {
      setTarefas(prev => prev.map(t => t.id === id ? data : t));
    }
  };

  const updatePaciente = async (id: string, updateData: Partial<Paciente>) => {
    const { data, error } = await supabase
      .from('pacientes')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        cliente:clientes(*),
        cuidador:cuidadores(*)
      `)
      .single();

    if (error) throw error;
    if (data) {
      setPacientes(prev => prev.map(p => p.id === id ? data : p));
    }
  };

  const updateCuidador = async (id: string, updateData: Partial<Cuidador>) => {
    const { data, error } = await supabase
      .from('cuidadores')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        cliente:clientes(*)
      `)
      .single();

    if (error) throw error;
    if (data) {
      setCuidadores(prev => prev.map(c => c.id === id ? data : c));
    }
  };

  const getClienteById = (id: string) => {
    return clientes.find((cliente) => cliente.id === id);
  };

  const refetchData = async () => {
    setIsLoading(true);
    await fetchData();
  };

  return (
    <DataContext.Provider
      value={{
        clientes,
        pacientes,
        cuidadores,
        transacoes,
        tarefas,
        lembretes,
        notificacoes,
        mensagens,
        addCliente,
        addPaciente,
        addCuidador,
        addTransacao,
        addTarefa,
        addLembrete,
        addNotificacao,
        updateTransacao,
        updateCliente,
        updateTarefa,
        updatePaciente,
        updateCuidador,
        getClienteById,
        isLoading,
        refetchData,
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
