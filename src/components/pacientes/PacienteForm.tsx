
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import PacienteFormFields from './PacienteFormFields';
import { usePacienteForm } from './PacienteFormLogic';

interface PacienteFormProps {
  isOpen: boolean;
  onClose: () => void;
  pacienteToEdit?: any;
}

const PacienteForm: React.FC<PacienteFormProps> = ({ isOpen, onClose, pacienteToEdit }) => {
  const { clientes, cuidadores } = useData();
  const { form, onSubmit, isEditing } = usePacienteForm({ pacienteToEdit, onClose });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Paciente' : 'Novo Paciente'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <PacienteFormFields
              form={form}
              clientes={clientes}
              cuidadores={cuidadores}
              isEditing={isEditing}
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

export default PacienteForm;
