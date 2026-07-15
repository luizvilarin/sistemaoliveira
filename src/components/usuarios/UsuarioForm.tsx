import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userService } from '@/services/userService';
import { Loader2, Copy, Check, Eye, EyeOff, RefreshCw, CheckCircle2 } from 'lucide-react';

const formSchema = z.object({
  nome: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'E-mail inválido' }),
  perfil: z.enum(['admin', 'gestor', 'cuidador'], {
    required_error: 'Perfil é obrigatório',
  }),
  senha: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
});

type FormData = z.infer<typeof formSchema>;

interface UsuarioFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  isGestor?: boolean;
}

const generateRandomPassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const UsuarioForm: React.FC<UsuarioFormProps> = ({ isOpen, onClose, onSuccess, isGestor = false }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedDetails, setCopiedDetails] = useState(false);
  
  // Guardar informações do usuário criado para exibir na tela de sucesso
  const [createdUserInfo, setCreatedUserInfo] = useState<FormData | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      email: '',
      perfil: 'gestor',
      senha: '',
    },
  });

  // Gerar senha quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      form.setValue('senha', generateRandomPassword());
      setCreatedUserInfo(null);
      setCopied(false);
      setCopiedDetails(false);
    }
  }, [isOpen, form]);

  const handleGeneratePassword = () => {
    form.setValue('senha', generateRandomPassword());
    toast({
      title: 'Senha gerada',
      description: 'Uma nova senha provisória foi gerada com sucesso.',
    });
  };

  const handleCopyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    toast({
      title: 'Copiado!',
      description: 'Senha copiada para a área de transferência.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAllDetails = (info: FormData) => {
    const text = `*Acesso ao Sistema Oliveira* 🔑\n\nOlá *${info.nome}*, seu usuário foi criado no sistema!\n\n📧 *E-mail:* ${info.email}\n🔑 *Senha:* ${info.senha}\n🔗 *Link de Acesso:* https://sistemaoliveira.vercel.app/login`;
    navigator.clipboard.writeText(text);
    setCopiedDetails(true);
    toast({
      title: 'Acesso Copiado!',
      description: 'Mensagem formatada copiada com sucesso.',
    });
    setTimeout(() => setCopiedDetails(false), 2000);
  };

  async function onSubmit(values: FormData) {
    try {
      setIsLoading(true);
      
      console.log('Criando usuário diretamente:', values.email);
      
      await userService.sendInvite(values.email, values.nome, values.perfil, values.senha);
      
      setCreatedUserInfo(values);
      
      toast({
        title: 'Usuário Criado',
        description: `Usuário ${values.nome} criado com sucesso e ativo no sistema.`,
      });
      
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      
      let errorMessage = 'Ocorreu um erro ao criar o usuário. Tente novamente.';
      
      if (error.message) {
        if (error.message.includes('já possui uma conta')) {
          errorMessage = 'Este email já possui uma conta no sistema.';
        } else if (error.message.includes('administradores')) {
          errorMessage = 'Apenas administradores podem criar novos usuários.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        variant: 'destructive',
        title: 'Erro ao criar usuário',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleFinalClose = () => {
    form.reset();
    setCreatedUserInfo(null);
    onSuccess?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleFinalClose}>
      <DialogContent className="sm:max-w-[500px]">
        {createdUserInfo ? (
          <div className="flex flex-col items-center py-6 text-center space-y-6">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-800">Usuário Criado com Sucesso!</h2>
              <p className="text-sm text-slate-500">
                O usuário está ativo e pronto para acessar o sistema. Envie os dados abaixo para ele.
              </p>
            </div>

            <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-left space-y-3 font-medium text-sm text-slate-700">
              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Nome</span>
                <span className="text-slate-800 font-bold">{createdUserInfo.nome}</span>
              </div>
              <div className="border-t border-slate-100 pt-2">
                <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">E-mail</span>
                <span className="text-slate-800 font-bold">{createdUserInfo.email}</span>
              </div>
              <div className="border-t border-slate-100 pt-2">
                <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Senha Provisória</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-slate-800 font-bold bg-white border px-2.5 py-1 rounded">
                    {createdUserInfo.senha}
                  </span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleCopyPassword(createdUserInfo.senha)}
                    className="h-8 px-2 text-slate-500 hover:text-slate-800"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col w-full gap-2 pt-2">
              <Button 
                onClick={() => handleCopyAllDetails(createdUserInfo)} 
                className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2 h-11"
              >
                {copiedDetails ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Copiar Dados (WhatsApp)
              </Button>
              <Button 
                variant="outline" 
                onClick={handleFinalClose}
                className="w-full h-11"
              >
                Fechar
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
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
                          <SelectItem value="cuidador">Cuidador</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="senha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha de Acesso</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <div className="relative flex-1">
                            <Input 
                              {...field} 
                              type={showPassword ? "text" : "password"} 
                              placeholder="Mínimo 6 caracteres" 
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleGeneratePassword}
                          className="px-3"
                          title="Gerar senha aleatória"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" type="button" onClick={handleFinalClose} disabled={isLoading}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Criar Usuário
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UsuarioForm;
