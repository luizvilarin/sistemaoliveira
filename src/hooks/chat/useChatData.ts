
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GrupoChat, UserProfile, MensagensAvancada } from '@/types/chat';

export const useChatData = (userProfile: any) => {
  const [grupos, setGrupos] = useState<GrupoChat[]>([]);
  const [usuarios, setUsuarios] = useState<UserProfile[]>([]);
  const [mensagens, setMensagens] = useState<MensagensAvancada[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarGrupos = async () => {
    try {
      const { data, error } = await supabase
        .from('grupos_chat')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setGrupos(data || []);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    }
  };

  const carregarUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, email, perfil, avatar_url, ativo')
        .eq('ativo', true)
        .neq('id', userProfile?.id)
        .order('nome');

      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const carregarMensagens = async () => {
    try {
      const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      // Converter os dados do banco para o formato esperado
      const mensagensFormatadas: MensagensAvancada[] = (data || []).map(msg => ({
        ...msg,
        tipo_mensagem: msg.tipo_mensagem as 'texto' | 'imagem' | 'video' | 'audio' | 'arquivo',
        emoji_reacoes: (msg.emoji_reacoes as Record<string, string[]>) || {}
      }));
      setMensagens(mensagensFormatadas);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
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
