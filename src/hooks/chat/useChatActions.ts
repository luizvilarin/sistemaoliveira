
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useChatActions = (userProfile: any) => {
  const { toast } = useToast();

  const criarGrupo = async (nome: string, descricao?: string, membros: string[] = []) => {
    if (!userProfile) {
      throw new Error('Usuário não autenticado');
    }

    try {
      console.log('Criando grupo:', { nome, descricao, membros, userId: userProfile.id });
      
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

      if (grupoError) {
        console.error('Erro ao criar grupo:', grupoError);
        throw grupoError;
      }

      console.log('Grupo criado:', grupo);

      // Adicionar o criador como admin
      const { error: criadorError } = await supabase
        .from('membros_grupo')
        .insert({
          grupo_id: grupo.id,
          usuario_id: userProfile.id,
          papel: 'admin'
        });

      if (criadorError) {
        console.error('Erro ao adicionar criador:', criadorError);
        throw criadorError;
      }

      // Adicionar outros membros
      if (membros.length > 0) {
        const { error: membrosError } = await supabase
          .from('membros_grupo')
          .insert(
            membros.map(userId => ({
              grupo_id: grupo.id,
              usuario_id: userId,
              papel: 'membro' as const
            }))
          );

        if (membrosError) {
          console.error('Erro ao adicionar membros:', membrosError);
          throw membrosError;
        }
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
        description: 'Não foi possível criar o grupo. Verifique suas permissões.'
      });
      throw error;
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
    if (!userProfile) {
      throw new Error('Usuário não autenticado');
    }

    if (!destinatarioId && !grupoId) {
      throw new Error('É necessário especificar um destinatário ou grupo');
    }

    if (!conteudo.trim() && !arquivoUrl) {
      throw new Error('Mensagem não pode estar vazia');
    }

    try {
      console.log('Enviando mensagem:', {
        conteudo,
        destinatarioId,
        grupoId,
        tipoMensagem,
        remetente: userProfile.id
      });

      const mensagemData = {
        assunto: grupoId ? `Mensagem no grupo` : `Mensagem privada`,
        conteudo: conteudo.trim(),
        remetente_id: userProfile.id,
        destinatario_id: destinatarioId || null,
        grupo_id: grupoId || null,
        tipo_mensagem: tipoMensagem,
        arquivo_url: arquivoUrl || null,
        arquivo_nome: arquivoNome || null,
        duracao_audio: duracaoAudio || null,
        mencoes: mencoes || [],
        lida: false
      };

      const { data, error } = await supabase
        .from('mensagens')
        .insert(mensagemData)
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir mensagem:', error);
        throw error;
      }

      console.log('Mensagem enviada com sucesso:', data);
      return data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  };

  const adicionarReacao = async (mensagemId: string, emoji: string) => {
    if (!userProfile) return;

    try {
      const { data: mensagem, error: buscarError } = await supabase
        .from('mensagens')
        .select('emoji_reacoes')
        .eq('id', mensagemId)
        .single();

      if (buscarError) throw buscarError;

      const reacoesAtuais = (mensagem.emoji_reacoes as Record<string, string[]>) || {};
      const usuariosEmoji = reacoesAtuais[emoji] || [];

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
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível adicionar a reação.'
      });
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
