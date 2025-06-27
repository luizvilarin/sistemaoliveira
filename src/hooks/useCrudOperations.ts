
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
import { useClienteCrud } from './crud/useClienteCrud';
import { useCuidadorCrud } from './crud/useCuidadorCrud';
import { usePacienteCrud } from './crud/usePacienteCrud';
import { useTransacaoCrud } from './crud/useTransacaoCrud';
import { useTarefaCrud } from './crud/useTarefaCrud';
import { useLembreteCrud } from './crud/useLembreteCrud';
import { useMensagemCrud } from './crud/useMensagemCrud';
import { useNotificacaoCrud } from './crud/useNotificacaoCrud';

export const useCrudOperations = (
  setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>,
  setCuidadores: React.Dispatch<React.SetStateAction<Cuidador[]>>,
  setPacientes: React.Dispatch<React.SetStateAction<Paciente[]>>,
  setTransacoes: React.Dispatch<React.SetStateAction<Transacao[]>>,
  setTarefas: React.Dispatch<React.SetStateAction<Tarefa[]>>,
  setLembretes: React.Dispatch<React.SetStateAction<Lembrete[]>>,
  setMensagens: React.Dispatch<React.SetStateAction<Mensagem[]>>,
  setNotificacoes: React.Dispatch<React.SetStateAction<Notificacao[]>>,
  setNotificacoesSistema: React.Dispatch<React.SetStateAction<NotificacaoSistema[]>>
) => {
  const clienteCrud = useClienteCrud(setClientes);
  const cuidadorCrud = useCuidadorCrud(setCuidadores);
  const pacienteCrud = usePacienteCrud(setPacientes);
  const transacaoCrud = useTransacaoCrud(setTransacoes);
  const tarefaCrud = useTarefaCrud(setTarefas);
  const lembreteCrud = useLembreteCrud(setLembretes);
  const mensagemCrud = useMensagemCrud(setMensagens);
  const notificacaoCrud = useNotificacaoCrud(setNotificacoes, setNotificacoesSistema);

  return {
    ...clienteCrud,
    ...cuidadorCrud,
    ...pacienteCrud,
    ...transacaoCrud,
    ...tarefaCrud,
    ...lembreteCrud,
    ...mensagemCrud,
    ...notificacaoCrud,
  };
};
