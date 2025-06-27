
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Verificar se há um hash de autenticação na URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro no callback de autenticação:', error);
          toast({
            variant: 'destructive',
            title: 'Erro de autenticação',
            description: 'Erro ao processar convite. Tente novamente.',
          });
          navigate('/login');
          return;
        }

        if (data?.session?.user) {
          // Usuário autenticado via convite, redirecionar para completar cadastro
          navigate('/complete-signup');
        } else {
          // Sem sessão, redirecionar para login
          navigate('/login');
        }
      } catch (error) {
        console.error('Erro no callback:', error);
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};

export default AuthCallbackPage;
