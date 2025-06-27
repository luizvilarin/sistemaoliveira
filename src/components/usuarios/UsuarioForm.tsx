
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface UsuarioFormProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioToEdit?: any;
}

const UsuarioForm = ({ isOpen, onClose, usuarioToEdit }: UsuarioFormProps) => {
  const { refreshData } = useData();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    nome: usuarioToEdit?.nome || '',
    email: usuarioToEdit?.email || '',
    perfil: usuarioToEdit?.perfil || 'cuidador',
    password: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (usuarioToEdit) {
        // Update existing user profile only (cannot update auth email/password via admin)
        const { error } = await supabase
          .from('profiles')
          .update({
            nome: formData.nome,
            perfil: formData.perfil,
          })
          .eq('id', usuarioToEdit.id);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Usuário atualizado com sucesso!',
        });
      } else {
        // For new users, we need to use a more secure approach
        // This is a simplified version - in production, this should be handled by a server-side function
        toast({
          variant: 'destructive',
          title: 'Funcionalidade Restrita',
          description: 'Criação de novos usuários deve ser feita através do sistema de convites por email.',
        });
        
        // TODO: Implement proper user invitation system via Edge Function
        // This prevents the security risk of exposing admin.createUser in the frontend
        
        onClose();
        return;
      }

      await refreshData();
      onClose();
    } catch (error: any) {
      console.error('Error managing user:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao gerenciar o usuário.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nome: '',
      email: '',
      perfil: 'cuidador',
      password: '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {usuarioToEdit ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={!!usuarioToEdit} // Cannot change email of existing user
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="perfil">Perfil</Label>
            <Select value={formData.perfil} onValueChange={(value) => setFormData({ ...formData, perfil: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="gestor">Gestor</SelectItem>
                <SelectItem value="cuidador">Cuidador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {!usuarioToEdit && (
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!usuarioToEdit}
                minLength={6}
              />
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UsuarioForm;
