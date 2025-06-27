
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from 'lucide-react';

const formSchema = z.object({
  titulo: z.string().min(3, { message: 'Título deve ter pelo menos 3 caracteres' }),
  descricao: z.string().optional(),
  dia: z.string().min(1, { message: 'Data é obrigatória' }),
  hora: z.string().optional(),
  residencia: z.string().min(3, { message: 'Residência deve ter pelo menos 3 caracteres' }),
  cliente_id: z.string().optional(),
  cuidador_id: z.string().optional(),
  urgente: z.boolean().default(false),
  tipo: z.string().default('geral'),
  tags: z.array(z.string()).default([]),
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
  const [currentTag, setCurrentTag] = React.useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: '',
      descricao: '',
      dia: '',
      hora: '',
      residencia: '',
      cliente_id: undefined,
      cuidador_id: undefined,
      urgente: false,
      tipo: 'geral',
      tags: [],
    },
  });

  const watchedTags = form.watch('tags');

  useEffect(() => {
    if (lembreteToEdit) {
      form.reset({
        titulo: lembreteToEdit.titulo || '',
        descricao: lembreteToEdit.descricao || '',
        dia: lembreteToEdit.dia || '',
        hora: lembreteToEdit.hora || '',
        residencia: lembreteToEdit.residencia || '',
        cliente_id: lembreteToEdit.cliente_id || undefined,
        cuidador_id: lembreteToEdit.cuidador_id || undefined,
        urgente: lembreteToEdit.urgente || false,
        tipo: lembreteToEdit.tipo || 'geral',
        tags: lembreteToEdit.tags || [],
      });
    } else {
      form.reset({
        titulo: '',
        descricao: '',
        dia: '',
        hora: '',
        residencia: '',
        cliente_id: undefined,
        cuidador_id: undefined,
        urgente: false,
        tipo: 'geral',
        tags: [],
      });
    }
  }, [lembreteToEdit, form]);

  const addTag = () => {
    if (currentTag.trim() && !watchedTags.includes(currentTag.trim())) {
      form.setValue('tags', [...watchedTags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    form.setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  async function onSubmit(values: FormData) {
    try {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      const lembreteData = {
        titulo: values.titulo,
        descricao: values.descricao || null,
        dia: values.dia,
        hora: values.hora || null,
        residencia: values.residencia,
        responsavel_id: user.id,
        cliente_id: values.cliente_id || null,
        cuidador_id: values.cuidador_id || null,
        urgente: values.urgente,
        tipo: values.tipo,
        tags: values.tags,
        status: 'pendente',
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Lembrete' : 'Novo Lembrete'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="geral">Geral</SelectItem>
                        <SelectItem value="consulta">Consulta</SelectItem>
                        <SelectItem value="medicamento">Medicamento</SelectItem>
                        <SelectItem value="emergencia">Emergência</SelectItem>
                        <SelectItem value="rotina">Rotina</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
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
                name="hora"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora (Opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
              name="urgente"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Urgente</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Marcar este lembrete como urgente
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex gap-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Adicionar tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {watchedTags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
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
