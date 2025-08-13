import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserActivity = () => {
  useEffect(() => {
    // Função para marcar usuários como offline baseado na última atividade
    const checkUserActivity = async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

      try {
        // Marcar como ausente usuários que não tiveram atividade nos últimos 5 minutos
        await supabase
          .from('profiles')
          .update({ status_online: 'ausente' })
          .eq('status_online', 'online')
          .lt('ultima_atividade', fiveMinutesAgo);

        // Marcar como offline usuários que não tiveram atividade nos últimos 15 minutos
        await supabase
          .from('profiles')
          .update({ status_online: 'offline' })
          .in('status_online', ['online', 'ausente'])
          .lt('ultima_atividade', fifteenMinutesAgo);

      } catch (error) {
        console.error('Erro ao verificar atividade dos usuários:', error);
      }
    };

    // Executar a cada 2 minutos
    const interval = setInterval(checkUserActivity, 2 * 60 * 1000);

    // Executar imediatamente
    checkUserActivity();

    return () => clearInterval(interval);
  }, []);
};