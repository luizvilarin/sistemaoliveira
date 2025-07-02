
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userService } from '@/services/userService';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  nome: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'E-mail inválido' }),
  perfil: z.enum(['admin', 'gestor'], {
    required_error: 'Perfil é obrigatório',
  }),
  resend: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface UsuarioFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  isGestor?: boolean;
}

const UsuarioForm: React.FC<UsuarioFormProps> = ({ isOpen, onClose, onSuccess, isGestor = false }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      email: '',
      perfil: 'gestor',
      resend: false,
    },
  });

  async function onSubmit(values: FormData) {
    try {
      setIsLoading(true);
      
      console.log('Enviando convite para:', values);
      
      await userService.sendInvite(values.email, values.nome, values.perfil, values.resend);
      
      toast({
        title: values.resend ? 'Convite reenviado' : 'Convite enviado',
        description: `Convite ${values.resend ? 'reenviado' : 'enviado'} para ${values.email} com sucesso! O usuário receberá um email para criar sua conta.`,
      });
      
      form.reset();
      onSuccess?.();
      onClose();
      
    } catch (error: any) {
      console.error('Erro ao enviar convite:', error);
      
      let errorMessage = 'Ocorreu um erro ao enviar o convite. Tente novamente.';
      
      // Tratamento específico de erros
      if (error.message) {
        if (error.message.includes('já possui uma conta')) {
          errorMessage = 'Este email já possui uma conta no sistema.';
        } else if (error.message.includes('convite ativo')) {
          errorMessage = 'Já existe um convite pendente para este email. Marque a opção "Permitir reenvio" se deseja enviar novamente.';
        } else if (error.message.includes('administradores')) {
          errorMessage = 'Apenas administradores podem enviar convites.';
        } else if (error.message.includes('email de convite')) {
          errorMessage = 'Erro ao enviar email. Verifique se as configurações de email estão corretas no Supabase.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar convite',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Convidar Novo Usuário</DialogTitle>
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
                  <FormLabel>E-mail</FormLabel>
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
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o perfil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="gestor">Gestor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="resend"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Permitir reenvio
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Marque esta opção para reenviar convite mesmo que já exista um pendente
                    </p>
                  </div>
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Enviar Convite
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UsuarioForm;
