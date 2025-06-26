
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Camera, Save, User, Mail, Shield } from 'lucide-react';

const ConfiguracoesPage = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    nome: '',
    email: user?.email || '',
    avatar_url: '',
  });

  React.useEffect(() => {
    if (user) {
      // Buscar dados do perfil do usuário
      setProfileData({
        nome: user.user_metadata?.nome || user.email?.split('@')[0] || '',
        email: user.email || '',
        avatar_url: user.user_metadata?.avatar_url || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await updateProfile({
        nome: profileData.nome,
        avatar_url: profileData.avatar_url,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso!',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao atualizar perfil',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Aqui você implementaria o upload para o Supabase Storage
      // Por enquanto, vamos simular com uma URL temporária
      const imageUrl = URL.createObjectURL(file);
      setProfileData({ ...profileData, avatar_url: imageUrl });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie suas configurações de perfil</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil do Usuário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileData.avatar_url} alt="Avatar" />
                <AvatarFallback>
                  {profileData.nome.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                    <Camera className="h-4 w-4" />
                    Alterar foto
                  </div>
                </Label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <p className="text-sm text-gray-500 mt-1">
                  JPG ou PNG. Máximo 2MB.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={profileData.nome}
                  onChange={(e) => setProfileData({ ...profileData, nome: e.target.value })}
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    value={profileData.email}
                    disabled
                    className="pl-10"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  O email não pode ser alterado.
                </p>
              </div>

              <Button 
                onClick={handleSaveProfile} 
                disabled={isLoading}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Informações da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Perfil de Acesso</h4>
              <p className="text-sm text-gray-600">
                Administrador - Acesso completo ao sistema
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Data de Criação</h4>
              <p className="text-sm text-gray-600">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'Não disponível'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Último Acesso</h4>
              <p className="text-sm text-gray-600">
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('pt-BR') : 'Não disponível'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConfiguracoesPage;
