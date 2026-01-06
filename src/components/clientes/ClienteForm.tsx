
import React, { useEffect } from 'react';
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
  nome: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  contato: z.string().min(1, { message: 'Contato é obrigatório' }),
  tipo: z.enum(['fixo', 'temporario'], {
    required_error: 'Tipo é obrigatório',
  }),
  status: z.enum(['ativo', 'pausado', 'terceirizado'], {
    required_error: 'Status é obrigatório',
  }),
  endereco: z.string().optional(),
  cpf_completo: z.string().optional(),
  nome_completo_cliente: z.string().optional(),
  contrato_ativo: z.boolean().optional(),
  valor_contrato: z.string().optional(),
  status_pagamento: z.enum(['aguardando', 'vencido', 'confirmado'], {
    required_error: 'Status do pagamento é obrigatório',
  }).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ClienteFormProps {
  isOpen: boolean;
  onClose: () => void;
  clienteToEdit?: {
    id: string;
    nome: string;
    contato: string;
    tipo: 'fixo' | 'temporario';
    status: 'ativo' | 'pausado' | 'terceirizado';
    endereco?: string;
    cpf_completo?: string;
    nome_completo_cliente?: string;
    contrato_ativo?: boolean;
    valor_contrato?: number;
    status_pagamento?: 'aguardando' | 'vencido' | 'confirmado';
  };
}

const ClienteForm: React.FC<ClienteFormProps> = ({ isOpen, onClose, clienteToEdit }) => {
  const { addCliente, updateCliente, addTransacao } = useData();
  const { toast } = useToast();
  const isEditing = !!clienteToEdit;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      contato: '',
      tipo: 'fixo',
      status: 'ativo',
      endereco: '',
      cpf_completo: '',
      nome_completo_cliente: '',
      contrato_ativo: false,
      valor_contrato: '',
      status_pagamento: 'aguardando',
    },
  });

  // Resetar o formulário quando clienteToEdit mudar
  useEffect(() => {
    if (clienteToEdit) {
      console.log('Editando cliente:', clienteToEdit);
      form.reset({
        nome: clienteToEdit.nome,
        contato: clienteToEdit.contato,
        tipo: clienteToEdit.tipo,
        status: clienteToEdit.status,
        endereco: clienteToEdit.endereco || '',
        cpf_completo: clienteToEdit.cpf_completo || '',
        nome_completo_cliente: clienteToEdit.nome_completo_cliente || '',
        contrato_ativo: clienteToEdit.contrato_ativo || false,
        valor_contrato: clienteToEdit.valor_contrato?.toString() || '',
        status_pagamento: clienteToEdit.status_pagamento || 'aguardando',
      });
    } else {
      form.reset({
        nome: '',
        contato: '',
        tipo: 'fixo',
        status: 'ativo',
        endereco: '',
        cpf_completo: '',
        nome_completo_cliente: '',
        contrato_ativo: false,
        valor_contrato: '',
        status_pagamento: 'aguardando',
      });
    }
  }, [clienteToEdit, form]);

  async function onSubmit(values: FormData) {
    try {
      const clienteData = {
        nome: values.nome,
        contato: values.contato,
        tipo: values.tipo,
        status: values.status,
        endereco: values.endereco || null,
        cpf_completo: values.cpf_completo || null,
        nome_completo_cliente: values.nome_completo_cliente || null,
        contrato_ativo: values.contrato_ativo || false,
        valor_contrato: values.valor_contrato ? parseFloat(values.valor_contrato) : null,
        status_pagamento: values.status_pagamento || 'aguardando',
      };
      
      if (isEditing && clienteToEdit) {
        await updateCliente(clienteToEdit.id, clienteData);
        toast({
          title: 'Cliente atualizado',
          description: 'O cliente foi atualizado com sucesso!',
        });
      } else {
        const novoCliente = await addCliente(clienteData);
        
        // Se há valor de contrato, tentar criar transação automaticamente
        if (clienteData.valor_contrato && clienteData.valor_contrato > 0) {
          try {
            await addTransacao({
              cliente_id: novoCliente.id,
              valor: clienteData.valor_contrato,
              status: clienteData.status_pagamento as 'confirmado' | 'aguardando' | 'expirado',
              data: new Date().toISOString(),
            });
          } catch (transacaoError) {
            console.warn('Não foi possível criar transação automática:', transacaoError);
            // Cliente foi criado com sucesso, apenas a transação falhou
          }
        }
        
        toast({
          title: 'Cliente adicionado',
          description: 'O cliente foi adicionado com sucesso!',
        });
      }
      onClose();
    } catch (error) {
      console.error('Erro ao processar cliente:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Ocorreu um erro ao processar o cliente.',
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contato"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contato</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="(xx) xxxxx-xxxx" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cpf_completo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="000.000.000-00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="nome_completo_cliente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome completo para notas fiscais" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Endereço completo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fixo">Fixo</SelectItem>
                      <SelectItem value="temporario">Temporário</SelectItem>
                    </SelectContent>
                  </Select>
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
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="pausado">Pausado</SelectItem>
                      <SelectItem value="terceirizado">Terceirizado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Campos de contrato */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-medium mb-3">Informações do Contrato</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contrato_ativo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="rounded border border-gray-300"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Contrato Ativo</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="valor_contrato"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor do Contrato (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="status_pagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status do Pagamento</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status do pagamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="aguardando">Aguardando Pagamento</SelectItem>
                        <SelectItem value="vencido">Vencido</SelectItem>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ClienteForm;
