
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GrupoChat, UserProfile, MensagensAvancada } from '@/types/chat';

export const useChatData = (userProfile: any) => {
  const [grupos, setGrupos] = useState<GrupoChat[]>([]);
  const [usuarios, setUsuarios] = useState<UserProfile[]>([]);
  const [mensagens, setMensagens] = useState<MensagensAvancada[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarGrupos = async () => {
    if (!userProfile) return;
    
    try {
      console.log('Carregando grupos para usuário:', userProfile.id);
      
      // Buscar grupos onde o usuário é membro
      const { data: gruposMembros, error: errorMembros } = await supabase
        .from('grupos_chat')
        .select(`
          *,
          membros_grupo!inner(usuario_id, papel)
        `)
        .eq('membros_grupo.usuario_id', userProfile.id)
        .order('updated_at', { ascending: false });

      if (errorMembros) {
        console.error('Erro ao carregar grupos como membro:', errorMembros);
      }

      // Buscar grupos criados pelo usuário
      const { data: gruposCriados, error: errorCriados } = await supabase
        .from('grupos_chat')
        .select('*')
        .eq('criado_por', userProfile.id)
        .order('updated_at', { ascending: false });

      if (errorCriados) {
        console.error('Erro ao carregar grupos criados:', errorCriados);
      }

      // Combinar e remover duplicatas
      const todosGrupos = [...(gruposMembros || []), ...(gruposCriados || [])];
      const gruposUnicos = todosGrupos.reduce((acc, grupo) => {
        if (!acc.find(g => g.id === grupo.id)) {
          acc.push({
            id: grupo.id,
            nome: grupo.nome,
            descricao: grupo.descricao,
            imagem_url: grupo.imagem_url,
            criado_por: grupo.criado_por,
            created_at: grupo.created_at,
            updated_at: grupo.updated_at
          });
        }
        return acc;
      }, [] as GrupoChat[]);

      console.log('Grupos carregados:', gruposUnicos.length);
      setGrupos(gruposUnicos);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      setGrupos([]);
    }
  };

  const carregarUsuarios = async () => {
    if (!userProfile) return;
    
    try {
      console.log('Carregando usuários para:', userProfile.perfil);
      
      let query = supabase
        .from('profiles')
        .select('id, nome, email, perfil, avatar_url, ativo')
        .eq('ativo', true)
        .neq('id', userProfile.id)
        .order('nome');

      // Aplicar filtros baseados no perfil do usuário
      if (userProfile.perfil === 'gestor') {
        // Gestores podem ver admins, outros gestores e cuidadores
        query = query.in('perfil', ['admin', 'gestor', 'cuidador']);
      } else if (userProfile.perfil === 'cuidador') {
        // Cuidadores podem ver gestores e outros cuidadores
        query = query.in('perfil', ['gestor', 'cuidador']);
      }
      // Admins já podem ver todos devido às políticas RLS

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao carregar usuários:', error);
        throw error;
      }

      console.log('Usuários carregados:', data?.length);
      setUsuarios(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setUsuarios([]);
    }
  };

  const carregarMensagens = async () => {
    if (!userProfile) return;
    
    try {
      console.log('Carregando mensagens para usuário:', userProfile.id);
      
      // Buscar mensagens individuais (onde o usuário é remetente ou destinatário)
      const { data: mensagensIndividuais, error: errorIndividuais } = await supabase
        .from('mensagens')
        .select('*')
        .or(`remetente_id.eq.${userProfile.id},destinatario_id.eq.${userProfile.id}`)
        .is('grupo_id', null)
        .order('created_at', { ascending: true });

      if (errorIndividuais) {
        console.error('Erro ao carregar mensagens individuais:', errorIndividuais);
      }

      // Buscar mensagens de grupos (onde o usuário é membro)
      let mensagensGrupos: any[] = [];
      if (grupos.length > 0) {
        const { data: mensagensGrupo, error: errorGrupos } = await supabase
          .from('mensagens')
          .select('*')
          .in('grupo_id', grupos.map(g => g.id))
          .order('created_at', { ascending: true });

        if (errorGrupos) {
          console.error('Erro ao carregar mensagens de grupos:', errorGrupos);
        } else {
          mensagensGrupos = mensagensGrupo || [];
        }
      }

      // Combinar todas as mensagens
      const todasMensagens = [...(mensagensIndividuais || []), ...mensagensGrupos];

      const mensagensFormatadas: MensagensAvancada[] = todasMensagens.map(msg => ({
        ...msg,
        tipo_mensagem: msg.tipo_mensagem as 'texto' | 'imagem' | 'video' | 'audio' | 'arquivo',
        emoji_reacoes: (msg.emoji_reacoes as Record<string, string[]>) || {}
      }));
      
      console.log('Mensagens carregadas:', mensagensFormatadas.length);
      setMensagens(mensagensFormatadas);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      setMensagens([]);
    }
  };

  return {
    grupos,
    usuarios,
    mensagens,
    loading,
    setLoading,
    setMensagens,
    carregarGrupos,
    carregarUsuarios,
    carregarMensagens
  };
};
