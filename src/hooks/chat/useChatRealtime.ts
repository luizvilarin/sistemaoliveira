
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MensagensAvancada } from '@/types/chat';

export const useChatRealtime = (
  userProfile: any,
  carregarGrupos: () => Promise<void>,
  setMensagens: React.Dispatch<React.SetStateAction<MensagensAvancada[]>>
) => {
  useEffect(() => {
    if (!userProfile) return;

    // Setup realtime subscriptions
    const gruposChannel = supabase
      .channel('grupos-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'grupos_chat' }, () => {
        carregarGrupos();
      })
      .subscribe();

    const mensagensChannel = supabase
      .channel('mensagens-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mensagens' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const novaMensagem = payload.new as any;
          const mensagemFormatada: MensagensAvancada = {
            ...novaMensagem,
            tipo_mensagem: novaMensagem.tipo_mensagem as 'texto' | 'imagem' | 'video' | 'audio' | 'arquivo',
            emoji_reacoes: novaMensagem.emoji_reacoes as Record<string, string[]> || {}
          };
          setMensagens(prev => [...prev, mensagemFormatada]);
        } else if (payload.eventType === 'UPDATE') {
          const mensagemAtualizada = payload.new as any;
          const mensagemFormatada: MensagensAvancada = {
            ...mensagemAtualizada,
            tipo_mensagem: mensagemAtualizada.tipo_mensagem as 'texto' | 'imagem' | 'video' | 'audio' | 'arquivo',
            emoji_reacoes: mensagemAtualizada.emoji_reacoes as Record<string, string[]> || {}
          };
          setMensagens(prev => prev.map(m => m.id === mensagemFormatada.id ? mensagemFormatada : m));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(gruposChannel);
      supabase.removeChannel(mensagensChannel);
    };
  }, [userProfile, carregarGrupos, setMensagens]);
};
