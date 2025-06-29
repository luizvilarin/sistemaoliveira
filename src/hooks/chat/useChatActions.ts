
import { supabase } from '@/integrations/supabase/client';

export const useChatActions = (userProfile: any) => {
  const criarGrupo = async (nome: string, descricao?: string, membros?: string[]) => {
    if (!userProfile) throw new Error('Usuário não autenticado');

    try {
      console.log('Criando grupo:', nome);
      
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

      // Adicionar o criador como administrador
      const { error: membroError } = await supabase
        .from('membros_grupo')
        .insert({
          grupo_id: grupo.id,
          usuario_id: userProfile.id,
          papel: 'admin'
        });

      if (membroError) {
        console.error('Erro ao adicionar criador ao grupo:', membroError);
        throw membroError;
      }

      // Adicionar outros membros se fornecidos
      if (membros && membros.length > 0) {
        const membrosData = membros.map(membroId => ({
          grupo_id: grupo.id,
          usuario_id: membroId,
          papel: 'membro'
        }));

        const { error: membrosError } = await supabase
          .from('membros_grupo')
          .insert(membrosData);

        if (membrosError) {
          console.error('Erro ao adicionar membros:', membrosError);
          throw membrosError;
        }
      }

      return grupo;
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
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
      throw new Error('Destinatário ou grupo deve ser especificado');
    }

    try {
      console.log('Enviando mensagem:', {
        conteudo: conteudo.substring(0, 50),
        destinatarioId,
        grupoId,
        tipoMensagem
      });

      const mensagemData = {
        remetente_id: userProfile.id,
        destinatario_id: destinatarioId || null,
        grupo_id: grupoId || null,
        conteudo,
        tipo_mensagem: tipoMensagem,
        arquivo_url: arquivoUrl || null,
        arquivo_nome: arquivoNome || null,
        duracao_audio: duracaoAudio || null,
        mencoes: mencoes || null,
        assunto: tipoMensagem === 'texto' ? 'Mensagem' : `${tipoMensagem.charAt(0).toUpperCase() + tipoMensagem.slice(1)}`
      };

      const { data, error } = await supabase
        .from('mensagens')
        .insert(mensagemData)
        .select()
        .single();

      if (error) {
        console.error('Erro ao enviar mensagem:', error);
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
    if (!userProfile) throw new Error('Usuário não autenticado');

    try {
      // Buscar mensagem atual
      const { data: mensagem, error: fetchError } = await supabase
        .from('mensagens')
        .select('emoji_reacoes')
        .eq('id', mensagemId)
        .single();

      if (fetchError) throw fetchError;

      const reacoesAtuais = mensagem.emoji_reacoes || {};
      const usuariosReacao = reacoesAtuais[emoji] || [];

      // Toggle da reação
      let novasReacoes;
      if (usuariosReacao.includes(userProfile.id)) {
        // Remover reação
        const usuariosFiltrados = usuariosReacao.filter((id: string) => id !== userProfile.id);
        if (usuariosFiltrados.length === 0) {
          delete reacoesAtuais[emoji];
          novasReacoes = reacoesAtuais;
        } else {
          novasReacoes = { ...reacoesAtuais, [emoji]: usuariosFiltrados };
        }
      } else {
        // Adicionar reação
        novasReacoes = { ...reacoesAtuais, [emoji]: [...usuariosReacao, userProfile.id] };
      }

      const { error } = await supabase
        .from('mensagens')
        .update({ emoji_reacoes: novasReacoes })
        .eq('id', mensagemId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao adicionar reação:', error);
      throw error;
    }
  };

  const marcarComoLida = async (mensagemId: string) => {
    if (!userProfile) return;

    try {
      const { error } = await supabase
        .from('mensagens')
        .update({ 
          lida: true,
          visualizada: true,
          data_visualizacao: new Date().toISOString()
        })
        .eq('id', mensagemId)
        .eq('destinatario_id', userProfile.id);

      if (error) {
        console.error('Erro ao marcar mensagem como lida:', error);
        throw error;
      }
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
