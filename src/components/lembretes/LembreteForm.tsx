
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
import { useAuth } from '@/contexts/AuthContext';
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
  descricao: z.string().optional(),
  dia: z.string().min(1, { message: 'Data é obrigatória' }),
  residencia: z.string().min(3, { message: 'Residência deve ter pelo menos 3 caracteres' }),
  cliente_id: z.string().optional(),
  cuidador_id: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface LembreteFormProps {
  isOpen: boolean;
  onClose: () => void;
  lembreteToEdit?: any;
}

const LembreteForm: React.FC<LembreteFormProps> = ({ isOpen, onClose, lembreteToEdit }) => {
  const { addLembrete, updateLembrete, clientes, cuidadores } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const isEditing = !!lembreteToEdit;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: '',
      descricao: '',
      dia: '',
      residencia: '',
      cliente_id: undefined,
      cuidador_id: undefined,
    },
  });

  useEffect(() => {
    if (lembreteToEdit) {
      form.reset({
        titulo: lembreteToEdit.titulo || '',
        descricao: lembreteToEdit.descricao || '',
        dia: lembreteToEdit.dia || '',
        residencia: lembreteToEdit.residencia || '',
        cliente_id: lembreteToEdit.cliente_id || undefined,
        cuidador_id: lembreteToEdit.cuidador_id || undefined,
      });
    } else {
      form.reset({
        titulo: '',
        descricao: '',
        dia: '',
        residencia: '',
        cliente_id: undefined,
        cuidador_id: undefined,
      });
    }
  }, [lembreteToEdit, form]);

  async function onSubmit(values: FormData) {
    try {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      const lembreteData = {
        titulo: values.titulo,
        descricao: values.descricao || null,
        dia: values.dia,
        residencia: values.residencia,
        responsavel_id: user.id,
        cliente_id: values.cliente_id || null,
        cuidador_id: values.cuidador_id || null,
      };

      if (isEditing) {
        await updateLembrete(lembreteToEdit.id, lembreteData);
        toast({
          title: 'Lembrete atualizado',
          description: 'O lembrete foi atualizado com sucesso!',
        });
      } else {
        await addLembrete(lembreteData);
        toast({
          title: 'Lembrete criado',
          description: 'O lembrete foi criado com sucesso!',
        });
      }
      
      onClose();
    } catch (error: any) {
      console.error('Erro ao processar lembrete:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao processar o lembrete.',
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Lembrete' : 'Novo Lembrete'}</DialogTitle>
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
                    <Input {...field} placeholder="Ex: Visita domiciliar" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="residencia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Residência/Endereço</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Endereço completo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cliente_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente (Opcional)</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === "none" ? undefined : value)} 
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhum cliente</SelectItem>
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
                      onValueChange={(value) => field.onChange(value === "none" ? undefined : value)} 
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cuidador" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhum cuidador</SelectItem>
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
            </div>
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="Detalhes adicionais..." />
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
                {isEditing ? 'Atualizar' : 'Criar'} Lembrete
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LembreteForm;
