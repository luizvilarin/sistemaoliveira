
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Cliente, Cuidador } from '@/types/data';
import { FormData } from './PacienteFormLogic';

interface PacienteFormFieldsProps {
  form: UseFormReturn<FormData>;
  clientes: Cliente[];
  cuidadores: Cuidador[];
  isEditing: boolean;
}

const PacienteFormFields: React.FC<PacienteFormFieldsProps> = ({
  form,
  clientes,
  cuidadores,
  isEditing
}) => {
  return (
    <>
      <FormField
        control={form.control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Nome do paciente" />
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
                    {cuidador.nome} - {cuidador.especializacao}
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
        name="historico_medico"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Histórico Médico</FormLabel>
            <FormControl>
              <Textarea {...field} rows={4} placeholder="Informações sobre o histórico médico do paciente" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default PacienteFormFields;
