
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
        
        // Verificar se há fragmentos de URL para processar
        const urlParams = new URLSearchParams(window.location.search);
        const fragment = window.location.hash;
        
        console.log('AuthCallback: URL params:', urlParams.toString());
        console.log('AuthCallback: Fragment:', fragment);
        
        // Aguardar um momento para o Supabase processar o callback
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verificar a sessão atual
        const { data, error } = await supabase.auth.getSession();
        
        console.log('AuthCallback: Dados da sessão:', data);
        console.log('AuthCallback: Erro da sessão:', error);
        
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
          console.log('AuthCallback: User metadata completo:', user.user_metadata);
          console.log('AuthCallback: App metadata:', user.app_metadata);
          console.log('AuthCallback: Email confirmed at:', user.email_confirmed_at);
          console.log('AuthCallback: Created at:', user.created_at);
          
          // Verificar se existe convite pendente para este email
          const { data: inviteData } = await supabase
            .from('user_invites')
            .select('*')
            .eq('email', user.email)
            .eq('accepted', false)
            .single();
          
          console.log('AuthCallback: Dados do convite:', inviteData);
          
          // Se existe convite pendente OU se o usuário tem metadados de convite
          const hasInviteMetadata = user.user_metadata?.nome || user.user_metadata?.perfil;
          const hasInvite = inviteData || hasInviteMetadata;
          
          console.log('AuthCallback: Tem convite?', hasInvite);
          console.log('AuthCallback: Tem metadados de convite?', hasInviteMetadata);
          
          if (hasInvite) {
            // Usuário de convite, redirecionar para completar cadastro
            console.log('AuthCallback: Redirecionando para complete-signup');
            navigate('/complete-signup');
          } else {
            // Usuário já existente, redirecionar para dashboard
            console.log('AuthCallback: Redirecionando para dashboard');
            navigate('/dashboard');
          }
        } else {
          console.log('AuthCallback: Sem sessão válida, redirecionando para login');
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
        <p className="text-xs text-gray-500 mt-2">Aguarde enquanto configuramos sua conta</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
