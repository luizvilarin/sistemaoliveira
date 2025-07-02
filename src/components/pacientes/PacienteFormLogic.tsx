
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';

const formSchema = z.object({
  nome: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  cliente_id: z.string().min(1, { message: 'Cliente é obrigatório' }),
  cuidador_id: z.string().optional(),
  historico_medico: z.string().optional(),
});

export type FormData = z.infer<typeof formSchema>;

interface UsePacienteFormProps {
  pacienteToEdit?: any;
  onClose: () => void;
}

export const usePacienteForm = ({ pacienteToEdit, onClose }: UsePacienteFormProps) => {
  const { addPaciente, updatePaciente } = useData();
  const { toast } = useToast();
  const isEditing = !!pacienteToEdit;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      cliente_id: '',
      cuidador_id: undefined,
      historico_medico: '',
    },
  });

  useEffect(() => {
    if (pacienteToEdit) {
      form.reset({
        nome: pacienteToEdit.nome || '',
        cliente_id: pacienteToEdit.cliente_id || '',
        cuidador_id: pacienteToEdit.cuidador_id || undefined,
        historico_medico: pacienteToEdit.historico_medico || '',
      });
    } else {
      form.reset({
        nome: '',
        cliente_id: '',
        cuidador_id: undefined,
        historico_medico: '',
      });
    }
  }, [pacienteToEdit, form]);

  const onSubmit = async (values: FormData) => {
    try {
      const pacienteData = {
        nome: values.nome,
        cliente_id: values.cliente_id,
        cuidador_id: values.cuidador_id || null,
        historico_medico: values.historico_medico || null,
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
    } catch (error: any) {
      console.error('Erro ao processar paciente:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao processar o paciente.',
      });
    }
  };

  return {
    form,
    onSubmit,
    isEditing,
  };
};
