
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
  useChatRealtime(userProfile, carregarGrupos, setMensagens);

  useEffect(() => {
    if (userProfile) {
      Promise.all([
        carregarGrupos(),
        carregarUsuarios(),
        carregarMensagens()
      ]).finally(() => setLoading(false));
    }
  }, [userProfile]);

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
