
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido' }),
  senha: z.string().min(1, { message: 'Senha é obrigatória' }),
});

const LoginForm: React.FC = () => {
  const { signIn, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      senha: '',
    },
  });
  
  async function onSubmit(values: z.infer<typeof loginSchema>) {
    await signIn(values.email, values.senha);
  }
  
  return (
    <Card className="w-[350px] shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">SGC</CardTitle>
        <CardDescription className="text-center">
          Sistema de Gerenciamento de Clientes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="seu.email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="senha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="********"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center text-muted-foreground">
          Para demonstração, use:
        </div>
        <div className="text-xs text-center text-muted-foreground">
          Admin: admin@sgc.com / admin123<br />
          Gestor: gestor@sgc.com / gestor123<br />
          Cuidador: cuidador@sgc.com / cuidador123
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
