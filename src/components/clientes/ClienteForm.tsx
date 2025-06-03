
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
  nome: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  contato: z.string().min(1, { message: 'Contato é obrigatório' }),
  tipo: z.enum(['fixo', 'temporario'], {
    required_error: 'Tipo é obrigatório',
  }),
  status: z.enum(['ativo', 'pausado', 'terceirizado'], {
    required_error: 'Status é obrigatório',
  }),
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
  };
}

const ClienteForm: React.FC<ClienteFormProps> = ({ isOpen, onClose, clienteToEdit }) => {
  const { addCliente, updateCliente } = useData();
  const { toast } = useToast();
  const isEditing = !!clienteToEdit;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: clienteToEdit?.nome || '',
      contato: clienteToEdit?.contato || '',
      tipo: clienteToEdit?.tipo || 'fixo',
      status: clienteToEdit?.status || 'ativo',
    },
  });

  function onSubmit(values: FormData) {
    try {
      // Cast values to the required type since Zod validation ensures all fields are present
      const clienteData = values as Required<FormData>;
      
      if (isEditing && clienteToEdit) {
        updateCliente(clienteToEdit.id, clienteData);
        toast({
          title: 'Cliente atualizado',
          description: 'O cliente foi atualizado com sucesso!',
        });
      } else {
        addCliente(clienteData);
        toast({
          title: 'Cliente adicionado',
          description: 'O cliente foi adicionado com sucesso!',
        });
      }
      onClose();
      form.reset();
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
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
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
                    defaultValue={field.value}
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
