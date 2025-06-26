
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  nome: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  cliente_id: z.string().min(1, { message: 'Cliente é obrigatório' }),
  cuidador_id: z.string().optional(),
  historico_medico: z.string().optional(),
  contrato_ativo: z.boolean().default(true),
  valor_contrato: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PacienteFormProps {
  isOpen: boolean;
  onClose: () => void;
  pacienteToEdit?: any;
}

const PacienteForm: React.FC<PacienteFormProps> = ({ isOpen, onClose, pacienteToEdit }) => {
  const { addPaciente, updatePaciente, clientes, cuidadores } = useData();
  const { toast } = useToast();
  const isEditing = !!pacienteToEdit;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: pacienteToEdit?.nome || '',
      cliente_id: pacienteToEdit?.cliente_id || '',
      cuidador_id: pacienteToEdit?.cuidador_id || '',
      historico_medico: pacienteToEdit?.historico_medico || '',
      contrato_ativo: pacienteToEdit?.contrato_ativo ?? true,
      valor_contrato: pacienteToEdit?.valor_contrato?.toString() || '',
    },
  });

  async function onSubmit(values: FormData) {
    try {
      const pacienteData = {
        nome: values.nome,
        cliente_id: values.cliente_id,
        cuidador_id: values.cuidador_id || null,
        historico_medico: values.historico_medico || null,
        contrato_ativo: values.contrato_ativo,
        valor_contrato: values.valor_contrato ? parseFloat(values.valor_contrato) : null,
      };

      if (isEditing) {
        await updatePaciente(pacienteToEdit.id, pacienteData);
        toast({
          title: 'Paciente atualizado',
          description: 'O paciente foi atualizado com sucesso!',
        });
      } else {
        await addPaciente(pacienteData);
        toast({
          title: 'Paciente adicionado',
          description: 'O paciente foi adicionado com sucesso!',
        });
      }
      
      onClose();
      form.reset();
    } catch (error: any) {
      console.error('Erro ao processar paciente:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao processar o paciente.',
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Paciente' : 'Novo Paciente'}</DialogTitle>
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
              name="cliente_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente/Família</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
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
              name="cuidador_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cuidador (Opcional)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cuidador" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Nenhum cuidador</SelectItem>
                      {cuidadores.map((cuidador) => (
                        <SelectItem key={cuidador.id} value={cuidador.id}>
                          {cuidador.nome} - {cuidador.especializacao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contrato_ativo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Contrato Ativo
                      </FormLabel>
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
              name="historico_medico"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Histórico Médico</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
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
                {isEditing ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PacienteForm;
