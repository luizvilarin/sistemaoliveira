
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
  contrato_ativo: z.boolean().default(true),
  valor_contrato: z.string().optional(),
  pagamento_realizado: z.boolean().default(false),
});

export type FormData = z.infer<typeof formSchema>;

interface UsePacienteFormProps {
  pacienteToEdit?: any;
  onClose: () => void;
}

export const usePacienteForm = ({ pacienteToEdit, onClose }: UsePacienteFormProps) => {
  const { addPaciente, updatePaciente, addTransacao } = useData();
  const { toast } = useToast();
  const isEditing = !!pacienteToEdit;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      cliente_id: '',
      cuidador_id: undefined,
      historico_medico: '',
      contrato_ativo: true,
      valor_contrato: '',
      pagamento_realizado: false,
    },
  });

  useEffect(() => {
    if (pacienteToEdit) {
      form.reset({
        nome: pacienteToEdit.nome || '',
        cliente_id: pacienteToEdit.cliente_id || '',
        cuidador_id: pacienteToEdit.cuidador_id || undefined,
        historico_medico: pacienteToEdit.historico_medico || '',
        contrato_ativo: pacienteToEdit.contrato_ativo ?? true,
        valor_contrato: pacienteToEdit.valor_contrato?.toString() || '',
        pagamento_realizado: false,
      });
    } else {
      form.reset({
        nome: '',
        cliente_id: '',
        cuidador_id: undefined,
        historico_medico: '',
        contrato_ativo: true,
        valor_contrato: '',
        pagamento_realizado: false,
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
        contrato_ativo: values.contrato_ativo,
        valor_contrato: values.valor_contrato ? parseFloat(values.valor_contrato) : null,
      };

      let pacienteId: string;

      if (isEditing) {
        await updatePaciente(pacienteToEdit.id, pacienteData);
        pacienteId = pacienteToEdit.id;
        toast({
          title: 'Paciente atualizado',
          description: 'O paciente foi atualizado com sucesso!',
        });
      } else {
        const newPaciente = await addPaciente(pacienteData);
        pacienteId = newPaciente.id;
        toast({
          title: 'Paciente adicionado',
          description: 'O paciente foi adicionado com sucesso!',
        });
      }

      // Criar transação automaticamente se há valor de contrato e não está editando
      if (!isEditing && values.valor_contrato && parseFloat(values.valor_contrato) > 0) {
        const transacaoData = {
          cliente_id: values.cliente_id,
          valor: parseFloat(values.valor_contrato),
          status: values.pagamento_realizado ? 'confirmado' as const : 'aguardando' as const,
          data: new Date().toISOString(),
        };

        await addTransacao(transacaoData);
        
        toast({
          title: 'Transação criada',
          description: `Transação de ${values.pagamento_realizado ? 'pagamento confirmado' : 'pagamento pendente'} foi criada automaticamente.`,
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
