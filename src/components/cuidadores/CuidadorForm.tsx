
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  nome: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  especializacao: z.string().min(3, { message: 'Especialização deve ter pelo menos 3 caracteres' }),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  cliente_id: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CuidadorFormProps {
  isOpen: boolean;
  onClose: () => void;
  cuidadorToEdit?: any;
}

const CuidadorForm: React.FC<CuidadorFormProps> = ({ isOpen, onClose, cuidadorToEdit }) => {
  const { addCuidador, updateCuidador, clientes } = useData();
  const { toast } = useToast();
  const isEditing = !!cuidadorToEdit;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: cuidadorToEdit?.nome || '',
      especializacao: cuidadorToEdit?.especializacao || '',
      telefone: cuidadorToEdit?.telefone || '',
      email: cuidadorToEdit?.email || '',
      cliente_id: cuidadorToEdit?.cliente_id || 'none',
    },
  });

  async function onSubmit(values: FormData) {
    try {
      const cuidadorData = {
        nome: values.nome,
        especializacao: values.especializacao,
        telefone: values.telefone || undefined,
        email: values.email || undefined,
        cliente_id: values.cliente_id === 'none' ? null : values.cliente_id || null,
        disponibilidade: { seg: true, ter: true, qua: true, qui: true, sex: true }
      };

      if (isEditing) {
        await updateCuidador(cuidadorToEdit.id, cuidadorData);
        toast({
          title: 'Cuidador atualizado',
          description: 'O cuidador foi atualizado com sucesso!',
        });
      } else {
        await addCuidador(cuidadorData);
        toast({
          title: 'Cuidador adicionado',
          description: 'O cuidador foi adicionado com sucesso!',
        });
      }
      
      onClose();
      form.reset();
    } catch (error: any) {
      console.error('Erro ao processar cuidador:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao processar o cuidador.',
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Cuidador' : 'Novo Cuidador'}</DialogTitle>
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
              name="especializacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialização</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Enfermagem, Fisioterapia..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="(11) 99999-9999" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="cuidador@email.com" />
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
                  <FormLabel>Família/Cliente (Opcional)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma família" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma família</SelectItem>
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

export default CuidadorForm;
