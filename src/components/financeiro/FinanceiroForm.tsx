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
  tipo: z.enum(['receita', 'despesa']),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  valor: z.string().min(1, 'Valor é obrigatório'),
  data_transacao: z.string().min(1, 'Data da transação é obrigatória'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  referencia_tipo: z.string().optional(),
  referencia_id: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

interface FinanceiroFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const FinanceiroForm: React.FC<FinanceiroFormProps> = ({ isOpen, onClose }) => {
  const { addFinanceiro } = useData();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo: 'receita',
      categoria: '',
      valor: '',
      data_transacao: new Date().toISOString().split('T')[0],
      descricao: '',
      referencia_tipo: '',
      referencia_id: ''
    }
  });

  const watchTipo = form.watch('tipo');

  const getCategorias = (tipo: 'receita' | 'despesa') => {
    if (tipo === 'receita') {
      return [
        'Serviços de Cuidados',
        'Mensalidades',
        'Plantões',
        'Consultorias',
        'Outros'
      ];
    } else {
      return [
        'Salários',
        'Encargos Sociais',
        'Material de Limpeza',
        'Medicamentos',
        'Transporte',
        'Alimentação',
        'Equipamentos',
        'Manutenção',
        'Impostos',
        'Outros'
      ];
    }
  };

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

      await addFinanceiro({
        tipo: data.tipo,
        categoria: data.categoria,
        valor,
        data_transacao: data.data_transacao,
        descricao: data.descricao,
        referencia_tipo: data.referencia_tipo || null,
        referencia_id: data.referencia_id || null
      });

      toast({
        title: 'Sucesso',
        description: `${data.tipo === 'receita' ? 'Receita' : 'Despesa'} registrada com sucesso!`
      });

      form.reset();
      onClose();
    } catch (error: any) {
      console.error('Erro ao registrar transação:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao registrar transação.'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Transação Financeira</DialogTitle>
          <DialogDescription>
            Registre uma nova receita ou despesa
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getCategorias(watchTipo).map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
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
              name="data_transacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data da Transação</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva a transação..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referencia_tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Referência (Opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Cliente, Funcionário, Fornecedor..." 
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
                Registrar Transação
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FinanceiroForm;