
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import {
  Cliente,
  Cuidador,
  Paciente,
  Transacao,
  Tarefa,
  Lembrete,
  Mensagem,
  Notificacao,
  NotificacaoSistema
} from '@/types/data';

export interface DataContextType {
  // Data
  clientes: Cliente[];
  cuidadores: Cuidador[];
  pacientes: Paciente[];
  transacoes: Transacao[];
  tarefas: Tarefa[];
  lembretes: Lembrete[];
  mensagens: Mensagem[];
  notificacoes: Notificacao[];
  notificacoesSistema: NotificacaoSistema[];
  
  // Loading states
  isLoading: boolean;
  
  // Refresh method
  refreshData: () => Promise<void>;
  
  // CRUD operations
  addCliente: (cliente: TablesInsert<'clientes'>) => Promise<Cliente>;
  updateCliente: (id: string, updates: TablesUpdate<'clientes'>) => Promise<void>;
  deleteCliente: (id: string) => Promise<void>;
  
  addCuidador: (cuidador: TablesInsert<'cuidadores'>) => Promise<Cuidador>;
  updateCuidador: (id: string, updates: TablesUpdate<'cuidadores'>) => Promise<Cuidador>;
  deleteCuidador: (id: string) => Promise<void>;
  
  addPaciente: (paciente: TablesInsert<'pacientes'>) => Promise<Paciente>;
  updatePaciente: (id: string, updates: TablesUpdate<'pacientes'>) => Promise<void>;
  deletePaciente: (id: string) => Promise<void>;
  
  addTransacao: (transacao: TablesInsert<'transacoes'>) => Promise<Transacao>;
  updateTransacao: (id: string, updates: TablesUpdate<'transacoes'>) => Promise<Transacao>;
  deleteTransacao: (id: string) => Promise<void>;
  
  addTarefa: (tarefa: TablesInsert<'tarefas'>) => Promise<void>;
  updateTarefa: (id: string, updates: TablesUpdate<'tarefas'>) => Promise<void>;
  deleteTarefa: (id: string) => Promise<void>;
  
  addLembrete: (lembrete: TablesInsert<'lembretes'>) => Promise<void>;
  updateLembrete: (id: string, updates: TablesUpdate<'lembretes'>) => Promise<void>;
  deleteLembrete: (id: string) => Promise<void>;
  
  addMensagem: (mensagem: TablesInsert<'mensagens'>) => Promise<Mensagem>;
  updateMensagem: (id: string, updates: TablesUpdate<'mensagens'>) => Promise<Mensagem>;
  deleteMensagem: (id: string) => Promise<void>;
  
  addNotificacao: (notificacao: TablesInsert<'notificacoes'>) => Promise<void>;
  updateNotificacao: (id: string, updates: TablesUpdate<'notificacoes'>) => Promise<void>;
  deleteNotificacao: (id: string) => Promise<void>;

  addNotificacaoSistema: (notificacao: TablesInsert<'notificacoes_sistema'>) => Promise<void>;
  updateNotificacaoSistema: (id: string, updates: TablesUpdate<'notificacoes_sistema'>) => Promise<void>;
  deleteNotificacaoSistema: (id: string) => Promise<void>;
}
