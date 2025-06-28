import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Camera, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RedefinirSenha from '@/components/configuracoes/RedefinirSenha';

const profileSchema = z.object({
  nome: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ConfiguracoesPage = () => {
  const { userProfile, user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nome: userProfile?.nome || '',
      email: userProfile?.email || '',
    },
  });

  React.useEffect(() => {
    if (userProfile) {
      form.reset({
        nome: userProfile.nome || '',
        email: userProfile.email || '',
      });
    }
  }, [userProfile, form]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      return null;
    }
  };

  const onSubmit = async (values: ProfileFormData) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      let avatarUrl = userProfile?.avatar_url;

      if (avatar) {
        const uploadedAvatarUrl = await uploadAvatar(avatar);
        if (uploadedAvatarUrl) {
          avatarUrl = uploadedAvatarUrl;
        }
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nome: values.nome,
          email: values.email,
          avatar_url: avatarUrl,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      if (values.email !== userProfile?.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: values.email,
        });

        if (authError) {
          await supabase
            .from('profiles')
            .update({ email: userProfile?.email })
            .eq('id', user.id);
          throw authError;
        }
      }

      await refreshProfile();

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso!',
      });

      setAvatar(null);
      setAvatarPreview(null);
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao atualizar perfil.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais e configurações</p>
      </div>

      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="senha">Senha</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Seu nome completo" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="seu@email.com" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={isLoading}>
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Foto de Perfil</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage 
                        src={avatarPreview || userProfile?.avatar_url || ''} 
                        alt={userProfile?.nome || ''} 
                      />
                      <AvatarFallback className="text-lg">
                        {userProfile?.nome ? getInitials(userProfile.nome) : <User className="h-8 w-8" />}
                      </AvatarFallback>
                    </Avatar>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Alterar Foto
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informações da Conta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Perfil</Label>
                    <p className="text-sm">{userProfile?.perfil}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Data de Criação</Label>
                    <p className="text-sm">
                      {userProfile?.created_at 
                        ? new Date(userProfile.created_at).toLocaleDateString('pt-BR')
                        : 'N/A'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="senha">
          <RedefinirSenha />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfiguracoesPage;
