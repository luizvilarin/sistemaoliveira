
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  titulo: z.string().min(3, { message: 'Título deve ter pelo menos 3 caracteres' }),
  descricao: z.string().min(10, { message: 'Descrição deve ter pelo menos 10 caracteres' }),
  cliente_id: z.string().min(1, { message: 'Cliente é obrigatório' }),
  cuidador_id: z.string().min(1, { message: 'Cuidador é obrigatório' }),
  status: z.enum(['todo', 'inProgress', 'done'], {
    required_error: 'Status é obrigatório',
  }),
});

type FormData = z.infer<typeof formSchema>;

interface TarefaFormProps {
  isOpen: boolean;
  onClose: () => void;
  tarefaToEdit?: any;
}

const TarefaForm: React.FC<TarefaFormProps> = ({ isOpen, onClose, tarefaToEdit }) => {
  const { addTarefa, updateTarefa, clientes, cuidadores } = useData();
  const { toast } = useToast();
  const isEditing = !!tarefaToEdit;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: tarefaToEdit?.titulo || '',
      descricao: tarefaToEdit?.descricao || '',
      cliente_id: tarefaToEdit?.cliente_id || '',
      cuidador_id: tarefaToEdit?.cuidador_id || '',
      status: tarefaToEdit?.status || 'todo',
    },
  });

  function onSubmit(values: FormData) {
    try {
      const tarefaData = values as Required<FormData>;
      
      if (isEditing && tarefaToEdit) {
        updateTarefa(tarefaToEdit.id, tarefaData);
        toast({
          title: 'Tarefa atualizada',
          description: 'A tarefa foi atualizada com sucesso!',
        });
      } else {
        addTarefa(tarefaData);
        toast({
          title: 'Tarefa adicionada',
          description: 'A tarefa foi adicionada com sucesso!',
        });
      }
      
      onClose();
      form.reset();
    } catch (error) {
      console.error('Erro ao processar tarefa:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Ocorreu um erro ao processar a tarefa.',
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Textarea {...field} rows={3} />
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
                  <FormLabel>Cliente</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
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
                  <FormLabel>Cuidador</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cuidador" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cuidadores.map((cuidador) => (
                        <SelectItem key={cuidador.id} value={cuidador.id}>
                          {cuidador.nome}
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
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="todo">A Fazer</SelectItem>
                      <SelectItem value="inProgress">Em Progresso</SelectItem>
                      <SelectItem value="done">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
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

export default TarefaForm;
