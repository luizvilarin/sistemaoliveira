import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  nome_funcionario: z.string().min(1, 'Nome do funcionário é obrigatório'),
  cargo: z.string().min(1, 'Cargo é obrigatório'),
  valor: z.string().min(1, 'Valor é obrigatório'),
  data_pagamento: z.string().min(1, 'Data do pagamento é obrigatória'),
  tipo_pagamento: z.enum(['salario', 'bonus', 'comissao', 'ajuda_custo', 'outros']),
  descricao: z.string().optional(),
  referencia: z.string().min(1, 'Referência é obrigatória'),
  status: z.enum(['pago', 'pendente', 'cancelado']).default('pago')
});

type FormData = z.infer<typeof formSchema>;

interface PagamentoFuncionarioFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const PagamentoFuncionarioForm: React.FC<PagamentoFuncionarioFormProps> = ({ isOpen, onClose }) => {
  const { addPagamentoFuncionario } = useData();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_funcionario: '',
      cargo: '',
      valor: '',
      data_pagamento: new Date().toISOString().split('T')[0],
      tipo_pagamento: 'salario',
      descricao: '',
      referencia: '',
      status: 'pago'
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      const valor = parseFloat(data.valor.replace(',', '.'));
      
      if (isNaN(valor) || valor <= 0) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Por favor, insira um valor válido.'
        });
        return;
      }

      await addPagamentoFuncionario({
        nome_funcionario: data.nome_funcionario,
        cargo: data.cargo,
        valor,
        data_pagamento: data.data_pagamento,
        tipo_pagamento: data.tipo_pagamento,
        descricao: data.descricao || null,
        referencia: data.referencia,
        status: data.status
      } as any);

      toast({
        title: 'Sucesso',
        description: 'Pagamento registrado com sucesso!'
      });

      form.reset();
      onClose();
    } catch (error: any) {
      console.error('Erro ao registrar pagamento:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao registrar pagamento.'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
          <DialogDescription>
            Registre um novo pagamento para funcionário
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome_funcionario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Funcionário</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Digite o nome do funcionário" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cargo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Cuidador, Auxiliar de Enfermagem, Enfermeiro..." 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipo_pagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="salario">Salário</SelectItem>
                      <SelectItem value="bonus">Bônus</SelectItem>
                      <SelectItem value="comissao">Comissão</SelectItem>
                      <SelectItem value="ajuda_custo">Ajuda de Custo</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (R$)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="0,00" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data_pagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data do Pagamento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referencia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referência</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Janeiro/2024, Plantão Cliente X..." 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informações adicionais sobre o pagamento..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                Registrar Pagamento
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PagamentoFuncionarioForm;