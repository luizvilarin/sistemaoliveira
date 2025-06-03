
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Interfaces para os dados
interface Cliente {
  id: string;
  nome: string;
  contato: string;
  tipo: 'fixo' | 'temporario';
  status: 'ativo' | 'pausado' | 'terceirizado';
  criado_em: string;
}

interface Paciente {
  id: string;
  nome: string;
  cliente_id: string;
  historico_medico: string;
  criado_em: string;
}

interface Cuidador {
  id: string;
  nome: string;
  especializacao: string;
  disponibilidade: Record<string, any>;
  criado_em: string;
}

interface Transacao {
  id: string;
  cliente_id: string;
  cliente_nome?: string; // Para exibição na UI
  valor: number;
  status: 'confirmado' | 'aguardando' | 'expirado';
  data: string;
}

interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  status: 'todo' | 'inProgress' | 'done';
  cliente_id: string;
  cuidador_id: string;
  criado_em: string;
}

interface Notificacao {
  id: string;
  mensagem: string;
  usuario_id: string;
  lida: boolean;
  criado_em: string;
}

interface DataContextType {
  clientes: Cliente[];
  pacientes: Paciente[];
  cuidadores: Cuidador[];
  transacoes: Transacao[];
  tarefas: Tarefa[];
  notificacoes: Notificacao[];
  addCliente: (cliente: Omit<Cliente, 'id' | 'criado_em'>) => void;
  addPaciente: (paciente: Omit<Paciente, 'id' | 'criado_em'>) => void;
  addCuidador: (cuidador: Omit<Cuidador, 'id' | 'criado_em'>) => void;
  addTransacao: (transacao: Omit<Transacao, 'id' | 'cliente_nome'>) => void;
  addTarefa: (tarefa: Omit<Tarefa, 'id' | 'criado_em'>) => void;
  addNotificacao: (notificacao: Omit<Notificacao, 'id' | 'criado_em'>) => void;
  updateTransacao: (id: string, data: Partial<Transacao>) => void;
  updateCliente: (id: string, data: Partial<Cliente>) => void;
  updateTarefa: (id: string, data: Partial<Tarefa>) => void;
  getClienteById: (id: string) => Cliente | undefined;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Dados de exemplo para simulação
const mockClientes: Cliente[] = [
  {
    id: '1',
    nome: 'João da Silva',
    contato: '(11) 98765-4321',
    tipo: 'fixo',
    status: 'ativo',
    criado_em: '2023-01-15T10:30:00Z',
  },
  {
    id: '2',
    nome: 'Maria Oliveira',
    contato: '(21) 97654-3210',
    tipo: 'temporario',
    status: 'ativo',
    criado_em: '2023-02-20T14:45:00Z',
  },
  {
    id: '3',
    nome: 'Carlos Santos',
    contato: '(31) 96543-2109',
    tipo: 'fixo',
    status: 'pausado',
    criado_em: '2023-03-10T09:15:00Z',
  },
  {
    id: '4',
    nome: 'Ana Pereira',
    contato: '(41) 95432-1098',
    tipo: 'temporario',
    status: 'terceirizado',
    criado_em: '2023-04-05T16:20:00Z',
  },
  {
    id: '5',
    nome: 'Paulo Ferreira',
    contato: '(51) 94321-0987',
    tipo: 'fixo',
    status: 'ativo',
    criado_em: '2023-05-18T11:10:00Z',
  },
];

const mockPacientes: Paciente[] = [
  {
    id: '1',
    nome: 'Pedro Silva',
    cliente_id: '1',
    historico_medico: 'Hipertensão, tratamento contínuo',
    criado_em: '2023-01-16T10:30:00Z',
  },
  {
    id: '2',
    nome: 'Lúcia Oliveira',
    cliente_id: '2',
    historico_medico: 'Recuperação pós-operatória',
    criado_em: '2023-02-21T14:45:00Z',
  }
];

const mockCuidadores: Cuidador[] = [
  {
    id: '1',
    nome: 'Fernanda Lima',
    especializacao: 'Enfermagem',
    disponibilidade: { seg: true, ter: true, qua: true, qui: true, sex: true },
    criado_em: '2022-12-01T08:00:00Z',
  },
  {
    id: '2',
    nome: 'Ricardo Gomes',
    especializacao: 'Fisioterapia',
    disponibilidade: { seg: true, qua: true, sex: true },
    criado_em: '2022-12-15T09:30:00Z',
  }
];

const mockTransacoes: Transacao[] = [
  {
    id: '1',
    cliente_id: '1',
    cliente_nome: 'João da Silva',
    valor: 1500.00,
    status: 'confirmado',
    data: '2023-05-10T14:30:00Z',
  },
  {
    id: '2',
    cliente_id: '2',
    cliente_nome: 'Maria Oliveira',
    valor: 800.00,
    status: 'aguardando',
    data: '2023-05-15T10:15:00Z',
  },
  {
    id: '3',
    cliente_id: '3',
    cliente_nome: 'Carlos Santos',
    valor: 1200.00,
    status: 'expirado',
    data: '2023-04-28T16:45:00Z',
  },
  {
    id: '4',
    cliente_id: '1',
    cliente_nome: 'João da Silva',
    valor: 1500.00,
    status: 'confirmado',
    data: '2023-04-10T14:30:00Z',
  },
  {
    id: '5',
    cliente_id: '2',
    cliente_nome: 'Maria Oliveira',
    valor: 800.00,
    status: 'confirmado',
    data: '2023-04-15T10:15:00Z',
  }
];

const mockTarefas: Tarefa[] = [
  {
    id: '1',
    titulo: 'Visita domiciliar',
    descricao: 'Realizar visita semanal ao paciente Pedro Silva',
    status: 'todo',
    cliente_id: '1',
    cuidador_id: '1',
    criado_em: '2023-05-12T09:00:00Z',
  },
  {
    id: '2',
    titulo: 'Sessão de fisioterapia',
    descricao: 'Realizar sessão de fisioterapia com Lúcia Oliveira',
    status: 'inProgress',
    cliente_id: '2',
    cuidador_id: '2',
    criado_em: '2023-05-14T10:30:00Z',
  }
];

const mockNotificacoes: Notificacao[] = [
  {
    id: '1',
    mensagem: 'Novo paciente cadastrado: Pedro Silva',
    usuario_id: '1',
    lida: false,
    criado_em: '2023-05-16T15:30:00Z',
  },
  {
    id: '2',
    mensagem: 'Pagamento recebido do cliente João da Silva',
    usuario_id: '1',
    lida: true,
    criado_em: '2023-05-15T14:45:00Z',
  }
];

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes);
  const [pacientes, setPacientes] = useState<Paciente[]>(mockPacientes);
  const [cuidadores, setCuidadores] = useState<Cuidador[]>(mockCuidadores);
  const [transacoes, setTransacoes] = useState<Transacao[]>(mockTransacoes);
  const [tarefas, setTarefas] = useState<Tarefa[]>(mockTarefas);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(mockNotificacoes);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simular carregamento de dados
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const addCliente = (cliente: Omit<Cliente, 'id' | 'criado_em'>) => {
    const novoCliente: Cliente = {
      ...cliente,
      id: Date.now().toString(),
      criado_em: new Date().toISOString(),
    };
    setClientes([...clientes, novoCliente]);
  };

  const addPaciente = (paciente: Omit<Paciente, 'id' | 'criado_em'>) => {
    const novoPaciente: Paciente = {
      ...paciente,
      id: Date.now().toString(),
      criado_em: new Date().toISOString(),
    };
    setPacientes([...pacientes, novoPaciente]);
  };

  const addCuidador = (cuidador: Omit<Cuidador, 'id' | 'criado_em'>) => {
    const novoCuidador: Cuidador = {
      ...cuidador,
      id: Date.now().toString(),
      criado_em: new Date().toISOString(),
    };
    setCuidadores([...cuidadores, novoCuidador]);
  };

  const addTransacao = (transacao: Omit<Transacao, 'id' | 'cliente_nome'>) => {
    const cliente = clientes.find(c => c.id === transacao.cliente_id);
    
    const novaTransacao: Transacao = {
      ...transacao,
      id: Date.now().toString(),
      cliente_nome: cliente?.nome || 'Cliente desconhecido',
    };
    
    setTransacoes([...transacoes, novaTransacao]);
  };

  const addTarefa = (tarefa: Omit<Tarefa, 'id' | 'criado_em'>) => {
    const novaTarefa: Tarefa = {
      ...tarefa,
      id: Date.now().toString(),
      criado_em: new Date().toISOString(),
    };
    setTarefas([...tarefas, novaTarefa]);
  };

  const addNotificacao = (notificacao: Omit<Notificacao, 'id' | 'criado_em'>) => {
    const novaNotificacao: Notificacao = {
      ...notificacao,
      id: Date.now().toString(),
      criado_em: new Date().toISOString(),
    };
    setNotificacoes([...notificacoes, novaNotificacao]);
  };

  const updateTransacao = (id: string, data: Partial<Transacao>) => {
    setTransacoes(
      transacoes.map((transacao) =>
        transacao.id === id ? { ...transacao, ...data } : transacao
      )
    );
  };

  const updateCliente = (id: string, data: Partial<Cliente>) => {
    setClientes(
      clientes.map((cliente) =>
        cliente.id === id ? { ...cliente, ...data } : cliente
      )
    );
  };

  const updateTarefa = (id: string, data: Partial<Tarefa>) => {
    setTarefas(
      tarefas.map((tarefa) =>
        tarefa.id === id ? { ...tarefa, ...data } : tarefa
      )
    );
  };

  const getClienteById = (id: string) => {
    return clientes.find((cliente) => cliente.id === id);
  };

  return (
    <DataContext.Provider
      value={{
        clientes,
        pacientes,
        cuidadores,
        transacoes,
        tarefas,
        notificacoes,
        addCliente,
        addPaciente,
        addCuidador,
        addTransacao,
        addTarefa,
        addNotificacao,
        updateTransacao,
        updateCliente,
        updateTarefa,
        getClienteById,
        isLoading,
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
