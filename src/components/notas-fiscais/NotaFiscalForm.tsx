import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { NotaFiscal } from '@/hooks/crud/useNotaFiscalCrud';

const formSchema = z.object({
  cliente_id: z.string().min(1, 'Cliente é obrigatório'),
  periodo: z.string().min(1, 'Período é obrigatório'),
  cpf_tomador: z.string().min(11, 'CPF deve ter pelo menos 11 caracteres'),
  responsavel_pagador: z.string().min(1, 'Responsável pagador é obrigatório'),
  emissor_nf: z.string().min(1, 'Emissor da NF é obrigatório'),
  valor_nf: z.string().min(1, 'Valor é obrigatório'),
  status_envio: z.string(),
  data_emissao: z.string(),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface NotaFiscalFormProps {
  isOpen: boolean;
  onClose: () => void;
  notaFiscalToEdit?: NotaFiscal | null;
}

export const NotaFiscalForm: React.FC<NotaFiscalFormProps> = ({
  isOpen,
  onClose,
  notaFiscalToEdit
}) => {
  const { clientes, addNotaFiscal, updateNotaFiscal } = useData();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cliente_id: '',
      periodo: '',
      cpf_tomador: '',
      responsavel_pagador: '',
      emissor_nf: '',
      valor_nf: '',
      status_envio: 'pendente',
      data_emissao: new Date().toISOString().split('T')[0],
      observacoes: '',
    },
  });

  useEffect(() => {
    if (notaFiscalToEdit) {
      form.reset({
        cliente_id: notaFiscalToEdit.cliente_id,
        periodo: notaFiscalToEdit.periodo,
        cpf_tomador: notaFiscalToEdit.cpf_tomador,
        responsavel_pagador: notaFiscalToEdit.responsavel_pagador,
        emissor_nf: notaFiscalToEdit.emissor_nf,
        valor_nf: notaFiscalToEdit.valor_nf.toString(),
        status_envio: notaFiscalToEdit.status_envio,
        data_emissao: notaFiscalToEdit.data_emissao,
        observacoes: notaFiscalToEdit.observacoes || '',
      });
    } else {
      form.reset({
        cliente_id: '',
        periodo: '',
        cpf_tomador: '',
        responsavel_pagador: '',
        emissor_nf: '',
        valor_nf: '',
        status_envio: 'pendente',
        data_emissao: new Date().toISOString().split('T')[0],
        observacoes: '',
      });
    }
  }, [notaFiscalToEdit, form]);

  const onSubmit = async (values: FormData) => {
    try {
      const notaFiscalData = {
        cliente_id: values.cliente_id,
        periodo: values.periodo,
        cpf_tomador: values.cpf_tomador,
        responsavel_pagador: values.responsavel_pagador,
        emissor_nf: values.emissor_nf,
        valor_nf: parseFloat(values.valor_nf),
        status_envio: values.status_envio,
        data_emissao: values.data_emissao,
        observacoes: values.observacoes,
      };

      if (notaFiscalToEdit) {
        await updateNotaFiscal(notaFiscalToEdit.id, notaFiscalData);
      } else {
        await addNotaFiscal(notaFiscalData);
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar nota fiscal:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {notaFiscalToEdit ? 'Editar Nota Fiscal' : 'Nova Nota Fiscal'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cliente_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cliente" />
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
                name="periodo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Período</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Janeiro/2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf_tomador"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF do Tomador</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsavel_pagador"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável/Pagador</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do responsável" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emissor_nf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emissor da NF</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do emissor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valor_nf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor da NF (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status_envio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status do Envio</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="enviado">Enviado</SelectItem>
                        <SelectItem value="processado">Processado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_emissao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Emissão</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações adicionais..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {notaFiscalToEdit ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};