
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
  NotificacaoSistema,
  Boleto,
  PagamentoFuncionario,
  Financeiro,
  NotaFiscal
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
  boletos: Boleto[];
  pagamentosFuncionarios: PagamentoFuncionario[];
  financeiro: Financeiro[];
  notasFiscais: NotaFiscal[];
  
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

  // Novas operações CRUD
  addBoleto: (boleto: TablesInsert<'boletos'>) => Promise<Boleto>;
  updateBoleto: (id: string, updates: TablesUpdate<'boletos'>) => Promise<Boleto>;
  deleteBoleto: (id: string) => Promise<void>;

  addPagamentoFuncionario: (pagamento: TablesInsert<'pagamentos_funcionarios'>) => Promise<PagamentoFuncionario>;
  updatePagamentoFuncionario: (id: string, updates: TablesUpdate<'pagamentos_funcionarios'>) => Promise<PagamentoFuncionario>;
  deletePagamentoFuncionario: (id: string) => Promise<void>;

  addFinanceiro: (item: TablesInsert<'financeiro'>) => Promise<Financeiro>;
  updateFinanceiro: (id: string, updates: TablesUpdate<'financeiro'>) => Promise<Financeiro>;
  deleteFinanceiro: (id: string) => Promise<void>;
  
  // State setters
  setFinanceiro: React.Dispatch<React.SetStateAction<Financeiro[]>>;
  
  // NotaFiscal operations
  addNotaFiscal: (notaFiscal: TablesInsert<'notas_fiscais'>) => Promise<NotaFiscal>;
  updateNotaFiscal: (id: string, updates: TablesUpdate<'notas_fiscais'>) => Promise<NotaFiscal>;
  deleteNotaFiscal: (id: string) => Promise<void>;
}
