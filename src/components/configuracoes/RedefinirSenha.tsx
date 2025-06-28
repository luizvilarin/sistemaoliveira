
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, Lock, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const RedefinirSenha = () => {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [adminFormData, setAdminFormData] = useState({
    userEmail: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleUserPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'As senhas não coincidem.',
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'A nova senha deve ter pelo menos 6 caracteres.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;

      toast({
        title: 'Senha alterada',
        description: 'Sua senha foi alterada com sucesso!',
      });

      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao alterar senha.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (adminFormData.newPassword !== adminFormData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'As senhas não coincidem.',
      });
      return;
    }

    if (adminFormData.newPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'A nova senha deve ter pelo menos 6 caracteres.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('admin-reset-password', {
        body: { 
          email: adminFormData.userEmail, 
          newPassword: adminFormData.newPassword 
        }
      });

      if (error) throw error;

      toast({
        title: 'Senha alterada',
        description: `Senha do usuário ${adminFormData.userEmail} foi alterada com sucesso!`,
      });

      setAdminFormData({
        userEmail: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Erro ao alterar senha do usuário:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao alterar senha do usuário.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Redefinir própria senha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Redefinir Minha Senha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUserPasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Digite sua nova senha"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
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
            
            <Button type="submit" disabled={isLoading}>
              <Lock className="h-4 w-4 mr-2" />
              {isLoading ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Área administrativa - só para admins */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Redefinir Senha de Usuário (Admin)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminPasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userEmail">Email do Usuário</Label>
                <Input
                  id="userEmail"
                  type="email"
                  placeholder="Digite o email do usuário"
                  value={adminFormData.userEmail}
                  onChange={(e) => setAdminFormData({ ...adminFormData, userEmail: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adminNewPassword">Nova Senha</Label>
                <Input
                  id="adminNewPassword"
                  type="password"
                  placeholder="Digite a nova senha"
                  value={adminFormData.newPassword}
                  onChange={(e) => setAdminFormData({ ...adminFormData, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adminConfirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="adminConfirmPassword"
                  type="password"
                  placeholder="Confirme a nova senha"
                  value={adminFormData.confirmPassword}
                  onChange={(e) => setAdminFormData({ ...adminFormData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              
              <Button type="submit" disabled={isLoading} variant="destructive">
                <Shield className="h-4 w-4 mr-2" />
                {isLoading ? 'Alterando...' : 'Alterar Senha do Usuário'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RedefinirSenha;
