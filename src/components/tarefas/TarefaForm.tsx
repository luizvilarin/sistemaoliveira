
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
import { ListTodo, AlignLeft, User, Briefcase, Info } from 'lucide-react';

const formSchema = z.object({
  titulo: z.string().min(3, { message: 'Título deve ter pelo menos 3 caracteres' }),
  descricao: z.string().optional(),
  cliente_id: z.string().optional(),
  cuidador_id: z.string().optional(),
  responsavel_id: z.string().optional(),
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
  const { addTarefa, updateTarefa, clientes, cuidadores, usuarios } = useData();
  const { toast } = useToast();
  const isEditing = !!tarefaToEdit;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: tarefaToEdit?.titulo || '',
      descricao: tarefaToEdit?.descricao || '',
      cliente_id: tarefaToEdit?.cliente_id || '',
      cuidador_id: tarefaToEdit?.cuidador_id || '',
      responsavel_id: tarefaToEdit?.responsavel_id || '',
      status: tarefaToEdit?.status || 'todo',
    },
  });

  // Update form values when editing changes
  React.useEffect(() => {
    if (tarefaToEdit) {
      form.reset({
        titulo: tarefaToEdit.titulo,
        descricao: tarefaToEdit.descricao || '',
        cliente_id: tarefaToEdit.cliente_id || '',
        cuidador_id: tarefaToEdit.cuidador_id || '',
        responsavel_id: tarefaToEdit.responsavel_id || '',
        status: tarefaToEdit.status,
      });
    } else {
      form.reset({
        titulo: '',
        descricao: '',
        cliente_id: '',
        cuidador_id: '',
        responsavel_id: '',
        status: 'todo',
      });
    }
  }, [tarefaToEdit, form]);

  function onSubmit(values: FormData) {
    try {
      // Garantir que strings vazias de campos opcionais sejam enviadas como null
      const processedValues = {
        ...values,
        cliente_id: values.cliente_id || null,
        cuidador_id: values.cuidador_id || null,
        responsavel_id: values.responsavel_id || null,
        descricao: values.descricao || null,
      };

      if (isEditing && tarefaToEdit) {
        updateTarefa(tarefaToEdit.id, processedValues);
        toast({
          title: 'Tarefa atualizada',
          description: 'A tarefa foi atualizada com sucesso!',
        });
      } else {
        addTarefa(processedValues);
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
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-primary px-6 py-8 text-white">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <ListTodo className="h-5 w-5 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold text-white">
                {isEditing ? 'Editar Tarefa' : 'Criar Nova Tarefa'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-white/80">
              Preencha os detalhes abaixo para {isEditing ? 'atualizar a' : 'registrar uma nova'} atividade.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 bg-white">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                        <Info className="h-4 w-4 text-primary" />
                        Título da Tarefa
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Mandar boleto de Fevereiro" 
                          {...field} 
                          className="bg-gray-50 border-gray-200 focus:bg-white transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                        <AlignLeft className="h-4 w-4 text-primary" />
                        Descrição Detalhada
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva as instruções para esta tarefa..." 
                          {...field} 
                          rows={4} 
                          className="bg-gray-50 border-gray-200 focus:bg-white transition-all resize-none"
                        />
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
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                        <User className="h-4 w-4 text-primary" />
                        Cliente
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-50 border-gray-200">
                            <SelectValue placeholder="Selecione" />
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
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                        <Briefcase className="h-4 w-4 text-primary" />
                        Cuidador
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-50 border-gray-200">
                            <SelectValue placeholder="Selecione" />
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
                  name="responsavel_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                        <User className="h-4 w-4 text-primary" />
                        Responsável
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-50 border-gray-200">
                            <SelectValue placeholder="Selecione um responsável" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Ninguém</SelectItem>
                          {usuarios.map((usuario) => (
                            <SelectItem key={usuario.id} value={usuario.id}>
                              {usuario.nome}
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
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                        Status Inicial
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-50 border-gray-200">
                            <SelectValue placeholder="Defina o status" />
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
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="ghost" type="button" onClick={onClose} className="hover:bg-gray-100">
                  Cancelar
                </Button>
                <Button type="submit" className="px-8 shadow-md">
                  {isEditing ? 'Salvar Alterações' : 'Criar Tarefa'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TarefaForm;
