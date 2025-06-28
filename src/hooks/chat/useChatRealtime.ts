
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MensagensAvancada } from '@/types/chat';

export const useChatRealtime = (
  userProfile: any,
  carregarGrupos: () => Promise<void>,
  carregarMensagens: () => Promise<void>,
  setMensagens: React.Dispatch<React.SetStateAction<MensagensAvancada[]>>
) => {
  useEffect(() => {
    if (!userProfile) return;

    console.log('Configurando realtime para usuário:', userProfile.id);

    // Setup realtime subscriptions
    const gruposChannel = supabase
      .channel('grupos-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'grupos_chat' 
      }, (payload) => {
        console.log('Mudança em grupos_chat:', payload);
        carregarGrupos();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'membros_grupo' 
      }, (payload) => {
        console.log('Mudança em membros_grupo:', payload);
        carregarGrupos();
      })
      .subscribe();

    const mensagensChannel = supabase
      .channel('mensagens-realtime')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'mensagens' 
      }, (payload) => {
        console.log('Nova mensagem inserida:', payload);
        const novaMensagem = payload.new as any;
        const mensagemFormatada: MensagensAvancada = {
          ...novaMensagem,
          tipo_mensagem: novaMensagem.tipo_mensagem as 'texto' | 'imagem' | 'video' | 'audio' | 'arquivo',
          emoji_reacoes: novaMensagem.emoji_reacoes as Record<string, string[]> || {}
        };
        
        // Só adicionar se a mensagem é relevante para o usuário atual
        if (novaMensagem.remetente_id === userProfile.id || 
            novaMensagem.destinatario_id === userProfile.id ||
            novaMensagem.grupo_id) {
          setMensagens(prev => {
            // Evitar duplicatas
            if (prev.find(m => m.id === mensagemFormatada.id)) {
              return prev;
            }
            return [...prev, mensagemFormatada];
          });
        }
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'mensagens' 
      }, (payload) => {
        console.log('Mensagem atualizada:', payload);
        const mensagemAtualizada = payload.new as any;
        const mensagemFormatada: MensagensAvancada = {
          ...mensagemAtualizada,
          tipo_mensagem: mensagemAtualizada.tipo_mensagem as 'texto' | 'imagem' | 'video' | 'audio' | 'arquivo',
          emoji_reacoes: mensagemAtualizada.emoji_reacoes as Record<string, string[]> || {}
        };
        setMensagens(prev => prev.map(m => m.id === mensagemFormatada.id ? mensagemFormatada : m));
      })
      .subscribe();

    return () => {
      console.log('Removendo canais realtime');
      supabase.removeChannel(gruposChannel);
      supabase.removeChannel(mensagensChannel);
    };
  }, [userProfile, carregarGrupos, carregarMensagens, setMensagens]);
};
