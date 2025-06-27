
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  nome: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  perfil: z.enum(['admin', 'gestor', 'cuidador'], { message: 'Selecione um perfil válido' }),
  senha: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface UsuarioFormProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioToEdit?: any;
  onSuccess?: () => void;
}

const UsuarioForm: React.FC<UsuarioFormProps> = ({ isOpen, onClose, usuarioToEdit, onSuccess }) => {
  const { toast } = useToast();
  const isEditing = !!usuarioToEdit;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      email: '',
      perfil: 'cuidador',
      senha: '',
    },
  });

  useEffect(() => {
    if (usuarioToEdit) {
      form.reset({
        nome: usuarioToEdit.nome || '',
        email: usuarioToEdit.email || '',
        perfil: usuarioToEdit.perfil || 'cuidador',
        senha: '', // Não preencher senha para edição
      });
    } else {
      form.reset({
        nome: '',
        email: '',
        perfil: 'cuidador',
        senha: '',
      });
    }
  }, [usuarioToEdit, form]);

  async function onSubmit(values: FormData) {
    try {
      if (isEditing) {
        // Atualizar usuário existente
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            nome: values.nome,
            email: values.email,
            perfil: values.perfil,
          })
          .eq('id', usuarioToEdit.id);

        if (updateError) throw updateError;

        toast({
          title: 'Usuário atualizado',
          description: 'O usuário foi atualizado com sucesso!',
        });
      } else {
        // Criar novo usuário
        if (!values.senha) {
          throw new Error('Senha é obrigatória para novos usuários');
        }

        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: values.email,
          password: values.senha,
          user_metadata: {
            nome: values.nome,
            perfil: values.perfil,
          },
          email_confirm: true,
        });

        if (authError) throw authError;

        // O perfil será criado automaticamente pelo trigger
        toast({
          title: 'Usuário criado',
          description: 'O usuário foi criado com sucesso!',
        });
      }
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Erro ao processar usuário:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao processar o usuário.',
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome completo" />
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
                    <Input {...field} type="email" placeholder="email@exemplo.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="perfil"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfil</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o perfil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="gestor">Gestor</SelectItem>
                      <SelectItem value="cuidador">Cuidador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditing && (
              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="Senha (mínimo 6 caracteres)" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? 'Atualizar' : 'Criar'} Usuário
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UsuarioForm;
