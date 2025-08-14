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
import { useClienteCrud } from './crud/useClienteCrud';
import { useCuidadorCrud } from './crud/useCuidadorCrud';
import { usePacienteCrud } from './crud/usePacienteCrud';
import { useTransacaoCrud } from './crud/useTransacaoCrud';
import { useTarefaCrud } from './crud/useTarefaCrud';
import { useLembreteCrud } from './crud/useLembreteCrud';
import { useMensagemCrud } from './crud/useMensagemCrud';
import { useNotificacaoCrud } from './crud/useNotificacaoCrud';
import { useBoletoCrud } from './crud/useBoletoCrud';
import { usePagamentoFuncionarioCrud } from './crud/usePagamentoFuncionarioCrud';
import { useFinanceiroCrud } from './crud/useFinanceiroCrud';
import { useNotaFiscalCrud } from './crud/useNotaFiscalCrud';

export const useCrudOperations = (
  setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>,
  setCuidadores: React.Dispatch<React.SetStateAction<Cuidador[]>>,
  setPacientes: React.Dispatch<React.SetStateAction<Paciente[]>>,
  setTransacoes: React.Dispatch<React.SetStateAction<Transacao[]>>,
  setTarefas: React.Dispatch<React.SetStateAction<Tarefa[]>>,
  setLembretes: React.Dispatch<React.SetStateAction<Lembrete[]>>,
  setMensagens: React.Dispatch<React.SetStateAction<Mensagem[]>>,
  setNotificacoes: React.Dispatch<React.SetStateAction<Notificacao[]>>,
  setNotificacoesSistema: React.Dispatch<React.SetStateAction<NotificacaoSistema[]>>,
  setBoletos: React.Dispatch<React.SetStateAction<Boleto[]>>,
  setPagamentosFuncionarios: React.Dispatch<React.SetStateAction<PagamentoFuncionario[]>>,
  setFinanceiro: React.Dispatch<React.SetStateAction<Financeiro[]>>,
  setNotasFiscais: React.Dispatch<React.SetStateAction<NotaFiscal[]>>
) => {
  const clienteCrud = useClienteCrud(setClientes);
  const cuidadorCrud = useCuidadorCrud(setCuidadores);
  const pacienteCrud = usePacienteCrud(setPacientes);
  const transacaoCrud = useTransacaoCrud(setTransacoes);
  const tarefaCrud = useTarefaCrud(setTarefas);
  const lembreteCrud = useLembreteCrud(setLembretes);
  const mensagemCrud = useMensagemCrud(setMensagens);
  const notificacaoCrud = useNotificacaoCrud(setNotificacoes, setNotificacoesSistema);
  const boletoCrud = useBoletoCrud(setBoletos);
  const pagamentoFuncionarioCrud = usePagamentoFuncionarioCrud(setPagamentosFuncionarios);
  const financeiroCrud = useFinanceiroCrud(setFinanceiro);
  const notaFiscalCrud = useNotaFiscalCrud(setNotasFiscais);

  return {
    ...clienteCrud,
    ...cuidadorCrud,
    ...pacienteCrud,
    ...transacaoCrud,
    ...tarefaCrud,
    ...lembreteCrud,
    ...mensagemCrud,
    ...notificacaoCrud,
    addBoleto: boletoCrud.addBoleto,
    updateBoleto: boletoCrud.updateBoleto,
    deleteBoleto: boletoCrud.deleteBoleto,
    addPagamentoFuncionario: pagamentoFuncionarioCrud.addPagamento,
    updatePagamentoFuncionario: pagamentoFuncionarioCrud.updatePagamento,
    deletePagamentoFuncionario: pagamentoFuncionarioCrud.deletePagamento,
    addFinanceiro: financeiroCrud.addFinanceiro,
    updateFinanceiro: financeiroCrud.updateFinanceiro,
    deleteFinanceiro: financeiroCrud.deleteFinanceiro,
    addNotaFiscal: notaFiscalCrud.addNotaFiscal,
    updateNotaFiscal: notaFiscalCrud.updateNotaFiscal,
    deleteNotaFiscal: notaFiscalCrud.deleteNotaFiscal,
  };
};