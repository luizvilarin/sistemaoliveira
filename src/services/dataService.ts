
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const fetchAllData = async (user: User | null) => {
  if (!user) return null;
  
  try {
    // Fetch data with joins to get related information
    const [
      clientesRes,
      cuidadoresRes,
      pacientesRes,
      transacoesRes,
      tarefasRes,
      lembretesRes,
      mensagensRes,
      notificacoesRes,
      notificacoesSistemaRes,
      boletosRes,
      pagamentosFuncionariosRes,
      financeiroRes,
      notasFiscaisRes,
      kanbanColunasRes
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
      supabase.from('tarefas').select('*'),
      supabase.from('lembretes').select(`
        *,
        cliente:clientes(*),
        cuidador:cuidadores(*)
      `),
      // Buscar mensagens onde o usuário é remetente OU destinatário
      supabase.from('mensagens').select('*').or(`remetente_id.eq.${user.id},destinatario_id.eq.${user.id}`),
      supabase.from('notificacoes').select('*').eq('usuario_id', user.id),
      supabase.from('notificacoes_sistema').select('*').eq('usuario_id', user.id),
      supabase.from('boletos').select(`*, cliente:clientes(*)`),
      supabase.from('pagamentos_funcionarios').select(`*, cuidador:cuidadores(*)`),
      supabase.from('financeiro').select('*'),
      supabase.from('notas_fiscais').select('*'),
      supabase.from('kanban_colunas').select('*').order('ordem', { ascending: true })
    ]);

    return {
      clientes: clientesRes.data || [],
      cuidadores: cuidadoresRes.data || [],
      pacientes: pacientesRes.data || [],
      transacoes: transacoesRes.data || [],
      tarefas: tarefasRes.data || [],
      lembretes: lembretesRes.data || [],
      mensagens: mensagensRes.data || [],
      notificacoes: notificacoesRes.data || [],
      notificacoesSistema: notificacoesSistemaRes.data || [],
      boletos: boletosRes.data || [],
      pagamentosFuncionarios: pagamentosFuncionariosRes.data || [],
      financeiro: financeiroRes.data || [],
      notasFiscais: notasFiscaisRes.data || [],
      kanbanColunas: kanbanColunasRes.data || []
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
