
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useChatActions = (userProfile: any) => {
  const { toast } = useToast();

  const criarGrupo = async (nome: string, descricao?: string, membros: string[] = []) => {
    if (!userProfile) return;

    try {
      // Criar o grupo
      const { data: grupo, error: grupoError } = await supabase
        .from('grupos_chat')
        .insert({
          nome,
          descricao,
          criado_por: userProfile.id
        })
        .select()
        .single();

      if (grupoError) throw grupoError;

      // Adicionar o criador como admin
      await supabase
        .from('membros_grupo')
        .insert({
          grupo_id: grupo.id,
          usuario_id: userProfile.id,
          papel: 'admin'
        });

      // Adicionar outros membros
      if (membros.length > 0) {
        await supabase
          .from('membros_grupo')
          .insert(
            membros.map(userId => ({
              grupo_id: grupo.id,
              usuario_id: userId,
              papel: 'membro' as const
            }))
          );
      }

      toast({
        title: 'Grupo criado',
        description: `O grupo "${nome}" foi criado com sucesso!`
      });

      return grupo;
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível criar o grupo.'
      });
    }
  };

  const enviarMensagem = async (
    conteudo: string,
    destinatarioId?: string,
    grupoId?: string,
    tipoMensagem: 'texto' | 'imagem' | 'video' | 'audio' | 'arquivo' = 'texto',
    arquivoUrl?: string,
    arquivoNome?: string,
    duracaoAudio?: number,
    mencoes?: string[]
  ) => {
    if (!userProfile || (!destinatarioId && !grupoId)) return;

    try {
      const mensagemData = {
        assunto: grupoId ? `Mensagem no grupo` : `Mensagem privada`,
        conteudo,
        remetente_id: userProfile.id,
        destinatario_id: destinatarioId,
        grupo_id: grupoId,
        tipo_mensagem: tipoMensagem,
        arquivo_url: arquivoUrl,
        arquivo_nome: arquivoNome,
        duracao_audio: duracaoAudio,
        mencoes: mencoes || [],
        lida: false
      };

      const { data, error } = await supabase
        .from('mensagens')
        .insert(mensagemData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível enviar a mensagem.'
      });
    }
  };

  const adicionarReacao = async (mensagemId: string, emoji: string) => {
    if (!userProfile) return;

    try {
      // Buscar a mensagem atual
      const { data: mensagem, error: buscarError } = await supabase
        .from('mensagens')
        .select('emoji_reacoes')
        .eq('id', mensagemId)
        .single();

      if (buscarError) throw buscarError;

      const reacoesAtuais = (mensagem.emoji_reacoes as Record<string, string[]>) || {};
      const usuariosEmoji = reacoesAtuais[emoji] || [];

      // Toggle da reação
      const novasReacoes = { ...reacoesAtuais };
      if (usuariosEmoji.includes(userProfile.id)) {
        novasReacoes[emoji] = usuariosEmoji.filter(id => id !== userProfile.id);
        if (novasReacoes[emoji].length === 0) {
          delete novasReacoes[emoji];
        }
      } else {
        novasReacoes[emoji] = [...usuariosEmoji, userProfile.id];
      }

      const { error } = await supabase
        .from('mensagens')
        .update({ emoji_reacoes: novasReacoes })
        .eq('id', mensagemId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao adicionar reação:', error);
    }
  };

  const marcarComoLida = async (mensagemId: string) => {
    try {
      const { error } = await supabase
        .from('mensagens')
        .update({ lida: true })
        .eq('id', mensagemId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  return {
    criarGrupo,
    enviarMensagem,
    adicionarReacao,
    marcarComoLida
  };
};
