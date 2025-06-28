
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
      
      // Buscar grupos onde o usuário é membro ou criador
      const { data: gruposData, error } = await supabase
        .from('grupos_chat')
        .select(`
          *,
          membros_grupo!inner(usuario_id, papel)
        `)
        .or(`criado_por.eq.${userProfile.id},membros_grupo.usuario_id.eq.${userProfile.id}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar grupos:', error);
        throw error;
      }

      console.log('Grupos carregados:', gruposData);
      
      // Remover duplicatas baseado no ID
      const gruposUnicos = gruposData?.reduce((acc, grupo) => {
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
      }, [] as GrupoChat[]) || [];

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
      
      const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .or(`remetente_id.eq.${userProfile.id},destinatario_id.eq.${userProfile.id},grupo_id.in.(${grupos.map(g => g.id).join(',') || 'null'})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        throw error;
      }

      const mensagensFormatadas: MensagensAvancada[] = (data || []).map(msg => ({
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
