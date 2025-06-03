
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

const formSchema = z.object({
  nome: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  especializacao: z.string().min(3, { message: 'Especialização deve ter pelo menos 3 caracteres' }),
});

type FormData = z.infer<typeof formSchema>;

interface CuidadorFormProps {
  isOpen: boolean;
  onClose: () => void;
  cuidadorToEdit?: any;
}

const CuidadorForm: React.FC<CuidadorFormProps> = ({ isOpen, onClose, cuidadorToEdit }) => {
  const { addCuidador } = useData();
  const { toast } = useToast();
  const isEditing = !!cuidadorToEdit;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: cuidadorToEdit?.nome || '',
      especializacao: cuidadorToEdit?.especializacao || '',
    },
  });

  function onSubmit(values: FormData) {
    try {
      const cuidadorData = {
        ...values,
        disponibilidade: { seg: true, ter: true, qua: true, qui: true, sex: true }
      };
      
      addCuidador(cuidadorData);
      toast({
        title: 'Cuidador adicionado',
        description: 'O cuidador foi adicionado com sucesso!',
      });
      
      onClose();
      form.reset();
    } catch (error) {
      console.error('Erro ao processar cuidador:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Ocorreu um erro ao processar o cuidador.',
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
