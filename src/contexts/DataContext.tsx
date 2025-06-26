import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Database } from '@/integrations/supabase/types';

// Use database types directly
type Cliente = Database['public']['Tables']['clientes']['Row'];
type Cuidador = Database['public']['Tables']['cuidadores']['Row'] & {
  cliente?: Cliente;
};
type Paciente = Database['public']['Tables']['pacientes']['Row'] & {
  cliente?: Cliente;
  cuidador?: Cuidador;
};
type Transacao = Database['public']['Tables']['transacoes']['Row'] & {
  cliente?: Cliente;
};
type Tarefa = Database['public']['Tables']['tarefas']['Row'] & {
  cliente?: Cliente;
  cuidador?: Cuidador;
};
type Lembrete = Database['public']['Tables']['lembretes']['Row'] & {
  cliente?: Cliente;
  cuidador?: Cuidador;
};
type Notificacao = Database['public']['Tables']['notificacoes']['Row'];
type Mensagem = Database['public']['Tables']['mensagens']['Row'];

interface DataContextType {
  clientes: Cliente[];
  pacientes: Paciente[];
  cuidadores: Cuidador[];
  transacoes: Transacao[];
  tarefas: Tarefa[];
  lembretes: Lembrete[];
  notificacoes: Notificacao[];
  mensagens: Mensagem[];
  addCliente: (cliente: Database['public']['Tables']['clientes']['Insert']) => Promise<void>;
  addPaciente: (paciente: Database['public']['Tables']['pacientes']['Insert']) => Promise<void>;
  addCuidador: (cuidador: Database['public']['Tables']['cuidadores']['Insert']) => Promise<void>;
  addTransacao: (transacao: Database['public']['Tables']['transacoes']['Insert']) => Promise<void>;
  addTarefa: (tarefa: Database['public']['Tables']['tarefas']['Insert']) => Promise<void>;
  addLembrete: (lembrete: Database['public']['Tables']['lembretes']['Insert']) => Promise<void>;
  addNotificacao: (notificacao: Database['public']['Tables']['notificacoes']['Insert']) => Promise<void>;
  updateTransacao: (id: string, data: Database['public']['Tables']['transacoes']['Update']) => Promise<void>;
  updateCliente: (id: string, data: Database['public']['Tables']['clientes']['Update']) => Promise<void>;
  updateTarefa: (id: string, data: Database['public']['Tables']['tarefas']['Update']) => Promise<void>;
  updatePaciente: (id: string, data: Database['public']['Tables']['pacientes']['Update']) => Promise<void>;
  updateCuidador: (id: string, data: Database['public']['Tables']['cuidadores']['Update']) => Promise<void>;
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

      setClientes(clientesData as Cliente[] || []);
      setCuidadores(cuidadoresData as Cuidador[] || []);
      setPacientes(pacientesData as Paciente[] || []);
      setTransacoes(transacoesData as Transacao[] || []);
      setTarefas(tarefasData as Tarefa[] || []);
      setLembretes(lembretesData as Lembrete[] || []);
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

  const addCliente = async (cliente: Database['public']['Tables']['clientes']['Insert']) => {
    const { data, error } = await supabase
      .from('clientes')
      .insert(cliente)
      .select()
      .single();

    if (error) throw error;
    if (data) {
      setClientes(prev => [data as Cliente, ...prev]);
    }
  };

  const addPaciente = async (paciente: Database['public']['Tables']['pacientes']['Insert']) => {
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
      setPacientes(prev => [data as Paciente, ...prev]);
    }
  };

  const addCuidador = async (cuidador: Database['public']['Tables']['cuidadores']['Insert']) => {
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
      setCuidadores(prev => [data as Cuidador, ...prev]);
    }
  };

  const addTransacao = async (transacao: Database['public']['Tables']['transacoes']['Insert']) => {
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
      setTransacoes(prev => [data as Transacao, ...prev]);
    }
  };

  const addTarefa = async (tarefa: Database['public']['Tables']['tarefas']['Insert']) => {
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
      setTarefas(prev => [data as Tarefa, ...prev]);
    }
  };

  const addLembrete = async (lembrete: Database['public']['Tables']['lembretes']['Insert']) => {
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
      setLembretes(prev => [data as Lembrete, ...prev]);
    }
  };

  const addNotificacao = async (notificacao: Database['public']['Tables']['notificacoes']['Insert']) => {
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
      setTransacoes(prev => prev.map(t => t.id === id ? data as Transacao : t));
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
      setClientes(prev => prev.map(c => c.id === id ? data as Cliente : c));
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
      setTarefas(prev => prev.map(t => t.id === id ? data as Tarefa : t));
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
      setPacientes(prev => prev.map(p => p.id === id ? data as Paciente : p));
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
      setCuidadores(prev => prev.map(c => c.id === id ? data as Cuidador : c));
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
