
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
      console.log('Iniciando carregamento de dados do chat para:', userProfile.nome);
      setLoading(true);
      
      // Carregar dados em paralelo de forma otimizada
      Promise.all([
        carregarUsuarios(),
        carregarGrupos(),
        carregarMensagens() // Não depende mais dos grupos
      ])
      .then(() => {
        console.log('Todos os dados do chat carregados com sucesso');
      })
      .catch((error) => {
        console.error('Erro ao carregar dados do chat:', error);
      })
      .finally(() => {
        setLoading(false);
      });
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
