
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
        console.log('AuthCallback: Iniciando processamento do callback');
        console.log('AuthCallback: URL atual:', window.location.href);
        
        // Verificar se há um hash de autenticação na URL
        const { data, error } = await supabase.auth.getSession();
        
        console.log('AuthCallback: Sessão obtida:', data?.session ? 'Sessão válida' : 'Sem sessão');
        
        if (error) {
          console.error('AuthCallback: Erro no callback de autenticação:', error);
          toast({
            variant: 'destructive',
            title: 'Erro de autenticação',
            description: 'Erro ao processar convite. Tente novamente.',
          });
          navigate('/login');
          return;
        }

        if (data?.session?.user) {
          const user = data.session.user;
          console.log('AuthCallback: Usuário autenticado:', user.email);
          
          // Verificar se é um novo usuário vindo de convite
          // Usuários de convite geralmente têm email_confirmed_at null na primeira vez
          const isNewUser = !user.email_confirmed_at || user.user_metadata?.nome;
          
          console.log('AuthCallback: É novo usuário?', isNewUser);
          console.log('AuthCallback: User metadata:', user.user_metadata);
          
          if (isNewUser) {
            // Usuário autenticado via convite, redirecionar para completar cadastro
            console.log('AuthCallback: Redirecionando para complete-signup');
            navigate('/complete-signup');
          } else {
            // Usuário já existente, redirecionar para dashboard
            console.log('AuthCallback: Redirecionando para dashboard');
            navigate('/dashboard');
          }
        } else {
          console.log('AuthCallback: Sem sessão, redirecionando para login');
          // Sem sessão, redirecionar para login
          navigate('/login');
        }
      } catch (error) {
        console.error('AuthCallback: Erro no callback:', error);
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Erro ao processar autenticação. Tente novamente.',
        });
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Processando convite...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
