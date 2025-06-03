
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  cliente_id: z.string().min(1, { message: 'Cliente é obrigatório' }),
  valor: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Valor deve ser um número maior que zero',
  }),
  status: z.enum(['confirmado', 'aguardando', 'expirado'], {
    required_error: 'Status é obrigatório',
  }),
  data: z.string().min(1, { message: 'Data é obrigatória' }),
});

interface TransacaoFormProps {
  isOpen: boolean;
  onClose: () => void;
  transacaoToEdit?: {
    id: string;
    cliente_id: string;
    valor: number;
    status: 'confirmado' | 'aguardando' | 'expirado';
    data: string;
  };
}

const TransacaoForm: React.FC<TransacaoFormProps> = ({ isOpen, onClose, transacaoToEdit }) => {
  const { clientes, addTransacao, updateTransacao } = useData();
  const { toast } = useToast();
  const isEditing = !!transacaoToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cliente_id: transacaoToEdit?.cliente_id || '',
      valor: transacaoToEdit ? transacaoToEdit.valor.toString() : '',
      status: transacaoToEdit?.status || 'aguardando',
      data: transacaoToEdit 
        ? new Date(transacaoToEdit.data).toISOString().slice(0, 16) 
        : new Date().toISOString().slice(0, 16),
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (isEditing && transacaoToEdit) {
        updateTransacao(transacaoToEdit.id, {
          cliente_id: values.cliente_id,
          valor: parseFloat(values.valor),
          status: values.status as 'confirmado' | 'aguardando' | 'expirado',
          data: new Date(values.data).toISOString(),
        });
        toast({
          title: 'Transação atualizada',
          description: 'A transação foi atualizada com sucesso!',
        });
      } else {
        addTransacao({
          cliente_id: values.cliente_id,
          valor: parseFloat(values.valor),
          status: values.status as 'confirmado' | 'aguardando' | 'expirado',
          data: new Date(values.data).toISOString(),
        });
        toast({
          title: 'Transação registrada',
          description: 'A transação foi registrada com sucesso!',
        });
      }
      onClose();
      form.reset();
    } catch (error) {
      console.error('Erro ao processar transação:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Ocorreu um erro ao processar a transação.',
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cliente_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
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
                    <Input {...field} type="number" step="0.01" min="0" />
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
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="confirmado">Confirmado</SelectItem>
                      <SelectItem value="aguardando">Aguardando</SelectItem>
                      <SelectItem value="expirado">Expirado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="data"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input {...field} type="datetime-local" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? 'Atualizar' : 'Registrar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TransacaoForm;
