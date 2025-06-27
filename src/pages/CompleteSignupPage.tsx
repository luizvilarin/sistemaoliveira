
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, UserCheck, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CompleteSignupPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    nome: string;
    email: string;
    perfil: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const checkUserSession = async () => {
      console.log('CompleteSignup: Verificando sessão do usuário');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log('CompleteSignup: Sem sessão, redirecionando para login');
        navigate('/login');
        return;
      }

      const userData = session.user;
      console.log('CompleteSignup: Usuário encontrado:', userData.email);
      console.log('CompleteSignup: Metadata completo:', userData.user_metadata);

      // Extrair informações do convite dos metadados
      const nome = userData.user_metadata?.nome || userData.email?.split('@')[0] || 'Usuário';
      const perfil = userData.user_metadata?.perfil || 'cuidador';
      
      setUserInfo({
        nome,
        email: userData.email || '',
        perfil: perfil.charAt(0).toUpperCase() + perfil.slice(1)
      });

      // Verificar se o usuário realmente precisa definir senha
      // Se já tem email_confirmed_at e não tem metadados de convite, redirecionar
      if (userData.email_confirmed_at && !userData.user_metadata?.nome && !userData.user_metadata?.perfil) {
        console.log('CompleteSignup: Usuário já confirmado sem convite, redirecionando para dashboard');
        navigate('/dashboard');
      }
    };

    checkUserSession();
  }, [navigate]);

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'As senhas não coincidem.',
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'A senha deve ter pelo menos 6 caracteres.',
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('CompleteSignup: Atualizando senha do usuário');

      // Atualizar a senha do usuário
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (updateError) {
        console.error('CompleteSignup: Erro ao atualizar senha:', updateError);
        throw updateError;
      }

      console.log('CompleteSignup: Senha atualizada com sucesso');

      // Criar/atualizar perfil do usuário se não existir
      if (userInfo) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: (await supabase.auth.getUser()).data.user?.id,
            nome: userInfo.nome,
            email: userInfo.email,
            perfil: userInfo.perfil.toLowerCase(),
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          console.error('CompleteSignup: Erro ao criar perfil:', profileError);
          // Não bloquear o fluxo por erro de perfil
        }
      }

      toast({
        title: 'Cadastro concluído!',
        description: 'Sua conta foi configurada com sucesso. Bem-vindo ao sistema!',
      });

      // Aguardar um momento antes de redirecionar
      setTimeout(() => {
        console.log('CompleteSignup: Redirecionando para dashboard');
        navigate('/dashboard');
      }, 1500);

    } catch (error: any) {
      console.error('CompleteSignup: Erro ao completar cadastro:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao definir senha. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando informações do usuário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <UserCheck className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Bem-vindo, {userInfo.nome}!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Complete seu cadastro definindo uma senha
          </p>
          <div className="mt-2 text-xs text-gray-500">
            <p>Email: {userInfo.email}</p>
            <p>Perfil: {userInfo.perfil}</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleCompleteSignup} className="space-y-4">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Definir Senha
                </CardTitle>
              </CardHeader>
              
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua nova senha"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirme sua nova senha"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Definindo senha...' : 'Definir Senha e Continuar'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="text-center text-xs text-gray-500">
          <p>Após definir sua senha, você será direcionado para o painel principal</p>
        </div>
      </div>
    </div>
  );
};

export default CompleteSignupPage;
