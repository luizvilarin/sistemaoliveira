
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChatData } from './chat/useChatData';
import { useChatRealtime } from './chat/useChatRealtime';
import { useChatActions } from './chat/useChatActions';

export const useChat = () => {
  const { userProfile } = useAuth();
  const {
    grupos,
    usuarios,
    mensagens,
    loading,
    setLoading,
    setMensagens,
    carregarGrupos,
    carregarUsuarios,
    carregarMensagens
  } = useChatData(userProfile);

  const {
    criarGrupo,
    enviarMensagem,
    adicionarReacao,
    marcarComoLida
  } = useChatActions(userProfile);

  // Setup realtime subscriptions
  useChatRealtime(userProfile, carregarGrupos, carregarMensagens, setMensagens);

  useEffect(() => {
    if (userProfile) {
      console.log('Carregando dados do chat para:', userProfile.nome);
      Promise.all([
        carregarUsuarios(),
        carregarGrupos()
      ]).then(() => {
        // Carregar mensagens após carregar grupos para ter acesso aos IDs dos grupos
        carregarMensagens();
      }).finally(() => setLoading(false));
    }
  }, [userProfile]);

  // Recarregar mensagens quando grupos mudarem
  useEffect(() => {
    if (userProfile && grupos.length >= 0) {
      carregarMensagens();
    }
  }, [grupos, userProfile]);

  return {
    grupos,
    usuarios,
    mensagens,
    loading,
    criarGrupo,
    enviarMensagem,
    adicionarReacao,
    marcarComoLida,
    carregarGrupos,
    carregarUsuarios,
    carregarMensagens
  };
};
