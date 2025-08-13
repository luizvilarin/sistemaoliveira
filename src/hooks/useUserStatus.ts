
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';

export const useUserStatus = () => {
  const { userProfile } = useAuth();

  useEffect(() => {
    if (!userProfile) return;

    // Marcar como online quando conectar
    userService.updateUserStatus('online').catch(console.error);

    // Atualizar atividade a cada 30 segundos apenas se estiver ativo
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        userService.updateUserStatus('online').catch(console.error);
      }
    }, 30000);

    // Marcar como offline ao sair
    const handleBeforeUnload = () => {
      navigator.sendBeacon(`/api/user-status`, JSON.stringify({
        userId: userProfile.id,
        status: 'offline'
      }));
    };

    // Detectar quando a página fica visível/oculta
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        userService.updateUserStatus('online').catch(console.error);
      } else {
        userService.updateUserStatus('ausente').catch(console.error);
      }
    };

    // Detectar inatividade
    let inactivityTimer: NodeJS.Timeout;
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      if (document.visibilityState === 'visible') {
        userService.updateUserStatus('online').catch(console.error);
        inactivityTimer = setTimeout(() => {
          userService.updateUserStatus('ausente').catch(console.error);
        }, 5 * 60 * 1000); // 5 minutos
      }
    };

    // Eventos para detectar atividade
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    resetInactivityTimer();

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      clearTimeout(inactivityTimer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer, true);
      });
      
      // Tentar marcar como offline
      userService.updateUserStatus('offline').catch(console.error);
    };
  }, [userProfile]);

  const setUserStatus = async (status: 'online' | 'offline' | 'ausente' | 'ocupado' | 'invisivel') => {
    try {
      await userService.updateUserStatus(status);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  return { setUserStatus };
};
