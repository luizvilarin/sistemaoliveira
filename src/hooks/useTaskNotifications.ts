import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useTaskNotifications = () => {
  const { user, userProfile } = useAuth();

  useEffect(() => {
    if (!user || !userProfile || userProfile.perfil === 'cuidador') return;

    // Executar verificação de tarefas a cada 30 minutos
    const checkTaskNotifications = async () => {
      try {
        console.log('Verificando tarefas pendentes...');
        
        const { error } = await supabase.rpc('notificar_tarefas_pendentes');
        
        if (error) {
          console.error('Erro ao verificar tarefas pendentes:', error);
        } else {
          console.log('Verificação de tarefas concluída');
        }
      } catch (error) {
        console.error('Erro na verificação de tarefas:', error);
      }
    };

    // Executar imediatamente e depois a cada 30 minutos
    checkTaskNotifications();
    const interval = setInterval(checkTaskNotifications, 30 * 60 * 1000); // 30 minutos

    return () => clearInterval(interval);
  }, [user, userProfile]);
};

export default useTaskNotifications;