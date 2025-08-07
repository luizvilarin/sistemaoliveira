
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';

export const useUserStatus = () => {
  const authContext = useAuth();
  
  // Proteção contra uso fora do AuthProvider
  if (!authContext) {
    console.error('useUserStatus sendo usado fora do AuthProvider');
    return { setUserStatus: async () => {} };
  }
  
  const { userProfile } = authContext;

  useEffect(() => {
    if (!userProfile) return;

    // Marcar como online quando conectar
    userService.updateUserStatus('online').catch(console.error);

    // Atualizar atividade a cada 30 segundos
    const interval = setInterval(() => {
      userService.updateUserStatus('online').catch(console.error);
    }, 30000);

    // Marcar como offline ao sair
    const handleBeforeUnload = () => {
      userService.updateUserStatus('offline').catch(console.error);
    };

    // Detectar inatividade
    let inactivityTimer: NodeJS.Timeout;
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        userService.updateUserStatus('ausente').catch(console.error);
      }, 5 * 60 * 1000); // 5 minutos
    };

    // Eventos para detectar atividade
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    resetInactivityTimer();

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      clearTimeout(inactivityTimer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer, true);
      });
      
      // Tentar marcar como offline
      userService.updateUserStatus('offline').catch(console.error);
    };
  }, [userProfile]);

  const setUserStatus = async (status: 'online' | 'offline' | 'ausente' | 'ocupado') => {
    try {
      await userService.updateUserStatus(status);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  return { setUserStatus };
};
