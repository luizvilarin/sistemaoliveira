import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
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
  valor_personalizado: z.string().optional().refine((val) => {
    if (!val || val === '') return true;
    return !isNaN(Number(val)) && Number(val) > 0;
  }, {
    message: 'Valor personalizado deve ser um número maior que zero',
  }),
  dia_vencimento: z.string().refine((val) => {
    const day = parseInt(val);
    return day >= 1 && day <= 31;
  }, {
    message: 'Dia deve estar entre 1 e 31',
  }),
  tipo_plantao: z.string().min(1, { message: 'Tipo de plantão é obrigatório' }),
  cuidadoras: z.string().min(1, { message: 'Cuidadoras é obrigatório' }),
  status: z.enum(['pendente', 'solicitado', 'enviado', 'pago', 'vencido', 'cancelado'], {
    required_error: 'Status é obrigatório',
  }),
  recorrente: z.boolean().optional(),
  frequencia_recorrencia: z.enum(['unico', 'quinzenal', 'mensal', 'personalizado']).optional(),
  dia_cobranca_secundario: z.string().optional(),
  notificacao_dias_antes: z.string().optional(),
  canal_envio: z.string().optional(),
  observacoes: z.string().optional(),
  data_envio: z.string().optional(),
  data_pagamento: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface BoletoFormProps {
  isOpen: boolean;
  onClose: () => void;
  boletoToEdit?: {
    id: string;
    cliente_id: string;
    valor: number;
    valor_personalizado?: number;
    dia_vencimento: number;
    tipo_plantao: string;
    cuidadoras: string[];
    status: string;
    recorrente?: boolean;
    frequencia_recorrencia?: string;
    dia_cobranca_secundario?: number;
    observacoes?: string;
    data_envio?: string;
    data_pagamento?: string;
  };
}

const BoletoForm: React.FC<BoletoFormProps> = ({ isOpen, onClose, boletoToEdit }) => {
  const { clientes, addBoleto, updateBoleto } = useData();
  const { toast } = useToast();
  const isEditing = !!boletoToEdit;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cliente_id: '',
      valor: '',
      valor_personalizado: '',
      dia_vencimento: '',
      tipo_plantao: '',
      cuidadoras: '',
      status: 'pendente',
      recorrente: false,
      frequencia_recorrencia: 'unico',
      dia_cobranca_secundario: '',
      observacoes: '',
      data_envio: '',
      data_pagamento: '',
    },
  });

  // Resetar o formulário quando boletoToEdit mudar
  useEffect(() => {
    if (boletoToEdit) {
      form.reset({
        cliente_id: boletoToEdit.cliente_id,
        valor: boletoToEdit.valor.toString(),
        valor_personalizado: boletoToEdit.valor_personalizado?.toString() || '',
        dia_vencimento: boletoToEdit.dia_vencimento.toString(),
        tipo_plantao: boletoToEdit.tipo_plantao,
        cuidadoras: boletoToEdit.cuidadoras.join(', '),
        status: boletoToEdit.status as 'pendente' | 'solicitado' | 'enviado' | 'pago' | 'vencido' | 'cancelado',
        recorrente: boletoToEdit.recorrente || false,
        frequencia_recorrencia: boletoToEdit.frequencia_recorrencia as 'unico' | 'quinzenal' | 'mensal' | 'personalizado' || 'unico',
        dia_cobranca_secundario: boletoToEdit.dia_cobranca_secundario?.toString() || '',
        observacoes: boletoToEdit.observacoes || '',
        data_envio: boletoToEdit.data_envio ? new Date(boletoToEdit.data_envio).toISOString().slice(0, 10) : '',
        data_pagamento: boletoToEdit.data_pagamento ? new Date(boletoToEdit.data_pagamento).toISOString().slice(0, 10) : '',
      });
    } else {
      form.reset({
        cliente_id: '',
        valor: '',
        valor_personalizado: '',
        dia_vencimento: '',
        tipo_plantao: '',
        cuidadoras: '',
        status: 'pendente',
        recorrente: false,
        frequencia_recorrencia: 'unico',
        dia_cobranca_secundario: '',
        notificacao_dias_antes: '2',
        canal_envio: 'email',
        observacoes: '',
        data_envio: '',
        data_pagamento: '',
      });
    }
  }, [boletoToEdit, form]);

  async function onSubmit(values: FormData) {
    try {
      const boletoData = {
        cliente_id: values.cliente_id,
        valor: parseFloat(values.valor),
        valor_personalizado: values.valor_personalizado ? parseFloat(values.valor_personalizado) : null,
        dia_vencimento: parseInt(values.dia_vencimento),
        tipo_plantao: values.tipo_plantao,
        cuidadoras: values.cuidadoras.split(',').map(c => c.trim()).filter(c => c),
        status: values.status,
        recorrente: values.recorrente || false,
        frequencia_recorrencia: values.frequencia_recorrencia || 'unico',
        dia_cobranca_secundario: values.dia_cobranca_secundario ? parseInt(values.dia_cobranca_secundario) : null,
        observacoes: values.observacoes || null,
        data_envio: values.data_envio ? new Date(values.data_envio).toISOString().slice(0, 10) : null,
        data_pagamento: values.data_pagamento ? new Date(values.data_pagamento).toISOString().slice(0, 10) : null,
      };
      
      if (isEditing && boletoToEdit) {
        await updateBoleto(boletoToEdit.id, boletoData);
        toast({
          title: 'Boleto atualizado',
          description: 'O boleto foi atualizado com sucesso!',
        });
      } else {
        await addBoleto(boletoData);
        toast({
          title: 'Boleto criado',
          description: 'O boleto foi criado com sucesso!',
        });
      }
      onClose();
    } catch (error) {
      console.error('Erro ao processar boleto:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Ocorreu um erro ao processar o boleto.',
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Boleto' : 'Novo Boleto'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cliente_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
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
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="solicitado">Solicitado</SelectItem>
                        <SelectItem value="enviado">Enviado</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="vencido">Vencido</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Padrão (R$)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valor_personalizado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Personalizado (R$)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" placeholder="Opcional" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dia_vencimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de Vencimento</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="1" max="31" placeholder="1-31" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tipo_plantao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Plantão</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de plantão" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="12h diurno">12h Diurno</SelectItem>
                      <SelectItem value="12h noturno">12h Noturno</SelectItem>
                      <SelectItem value="24h">24h</SelectItem>
                      <SelectItem value="48h">48h</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cuidadoras"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cuidadoras (separadas por vírgula)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome 1, Nome 2, Nome 3..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data_envio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Envio</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
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
                    <FormLabel>Data de Pagamento</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Seção de Recorrência */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-medium mb-3">Configuração de Recorrência</h3>
              
              <FormField
                control={form.control}
                name="recorrente"
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
                      <FormLabel>Boleto Recorrente</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Gerar lembretes automáticos para próximas cobranças
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch('recorrente') && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="frequencia_recorrencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequência</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a frequência" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="unico">Único</SelectItem>
                            <SelectItem value="quinzenal">Quinzenal (2x/mês)</SelectItem>
                            <SelectItem value="mensal">Mensal</SelectItem>
                            <SelectItem value="personalizado">Personalizado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch('frequencia_recorrencia') === 'personalizado' && (
                    <FormField
                      control={form.control}
                      name="dia_cobranca_secundario"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dia Secundário de Cobrança</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" max="31" placeholder="1-31" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Observações adicionais..." />
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
                {isEditing ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BoletoForm;