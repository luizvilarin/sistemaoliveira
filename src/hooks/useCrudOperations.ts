
import { supabase } from '@/integrations/supabase/client';
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

  const addPaciente = async (paciente: TablesInsert<'pacientes'>) => {
    const { data, error } = await supabase.from('pacientes').insert(paciente).select(`
      *,
      cliente:clientes(*),
      cuidador:cuidadores(*)
    `).single();
    if (error) throw error;
    setPacientes(prev => [...prev, data]);
  };

  const updatePaciente = async (id: string, updates: TablesUpdate<'pacientes'>) => {
    const { data, error } = await supabase.from('pacientes').update(updates).eq('id', id).select(`
      *,
      cliente:clientes(*),
      cuidador:cuidadores(*)
    `).single();
    if (error) throw error;
    setPacientes(prev => prev.map(p => p.id === id ? data : p));
  };

  const deletePaciente = async (id: string) => {
    const { error } = await supabase.from('pacientes').delete().eq('id', id);
    if (error) throw error;
    setPacientes(prev => prev.filter(p => p.id !== id));
  };

  const addTransacao = async (transacao: TablesInsert<'transacoes'>) => {
    const { data, error } = await supabase.from('transacoes').insert(transacao).select(`
      *,
      cliente:clientes(*)
    `).single();
    if (error) throw error;
    setTransacoes(prev => [...prev, data]);
  };

  const updateTransacao = async (id: string, updates: TablesUpdate<'transacoes'>) => {
    const { data, error } = await supabase.from('transacoes').update(updates).eq('id', id).select(`
      *,
      cliente:clientes(*)
    `).single();
    if (error) throw error;
    setTransacoes(prev => prev.map(t => t.id === id ? data : t));
  };

  const deleteTransacao = async (id: string) => {
    const { error } = await supabase.from('transacoes').delete().eq('id', id);
    if (error) throw error;
    setTransacoes(prev => prev.filter(t => t.id !== id));
  };

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

  const addLembrete = async (lembrete: TablesInsert<'lembretes'>) => {
    const { data, error } = await supabase.from('lembretes').insert(lembrete).select(`
      *,
      cliente:clientes(*),
      cuidador:cuidadores(*)
    `).single();
    if (error) throw error;
    setLembretes(prev => [...prev, data]);
  };

  const updateLembrete = async (id: string, updates: TablesUpdate<'lembretes'>) => {
    const { data, error } = await supabase.from('lembretes').update(updates).eq('id', id).select(`
      *,
      cliente:clientes(*),
      cuidador:cuidadores(*)
    `).single();
    if (error) throw error;
    setLembretes(prev => prev.map(l => l.id === id ? data : l));
  };

  const deleteLembrete = async (id: string) => {
    const { error } = await supabase.from('lembretes').delete().eq('id', id);
    if (error) throw error;
    setLembretes(prev => prev.filter(l => l.id !== id));
  };

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

  const addNotificacaoSistema = async (notificacao: TablesInsert<'notificacoes_sistema'>) => {
    const { data, error } = await supabase.from('notificacoes_sistema').insert(notificacao).select().single();
    if (error) throw error;
    setNotificacoesSistema(prev => [...prev, data]);
  };

  const updateNotificacaoSistema = async (id: string, updates: TablesUpdate<'notificacoes_sistema'>) => {
    const { data, error } = await supabase.from('notificacoes_sistema').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setNotificacoesSistema(prev => prev.map(n => n.id === id ? data : n));
  };

  const deleteNotificacaoSistema = async (id: string) => {
    const { error } = await supabase.from('notificacoes_sistema').delete().eq('id', id);
    if (error) throw error;
    setNotificacoesSistema(prev => prev.filter(n => n.id !== id));
  };

  return {
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
    addNotificacaoSistema,
    updateNotificacaoSistema,
    deleteNotificacaoSistema,
  };
};
