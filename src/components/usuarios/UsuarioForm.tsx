
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface UsuarioFormProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioToEdit?: any;
}

const UsuarioForm: React.FC<UsuarioFormProps> = ({ isOpen, onClose, usuarioToEdit }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    perfil: 'cuidador' as 'admin' | 'gestor' | 'cuidador',
    senha: '',
    confirmarSenha: ''
  });

  useEffect(() => {
    if (usuarioToEdit) {
      setFormData({
        nome: usuarioToEdit.nome || '',
        email: usuarioToEdit.email || '',
        perfil: usuarioToEdit.perfil || 'cuidador',
        senha: '',
        confirmarSenha: ''
      });
    } else {
      setFormData({
        nome: '',
        email: '',
        perfil: 'cuidador',
        senha: '',
        confirmarSenha: ''
      });
    }
  }, [usuarioToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.senha !== formData.confirmarSenha) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "As senhas não coincidem.",
      });
      return;
    }

    // Aqui você implementaria a lógica para salvar o usuário
    console.log('Dados do usuário:', formData);
    
    toast({
      title: usuarioToEdit ? "Usuário atualizado" : "Usuário criado",
      description: usuarioToEdit ? "Usuário atualizado com sucesso." : "Novo usuário criado com sucesso.",
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {usuarioToEdit ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome completo *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="perfil">Perfil *</Label>
            <Select value={formData.perfil} onValueChange={(value: 'admin' | 'gestor' | 'cuidador') => 
              setFormData(prev => ({ ...prev, perfil: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="gestor">Gestor</SelectItem>
                <SelectItem value="cuidador">Cuidador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha">Senha *</Label>
            <Input
              id="senha"
              type="password"
              value={formData.senha}
              onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmarSenha">Confirmar senha *</Label>
            <Input
              id="confirmarSenha"
              type="password"
              value={formData.confirmarSenha}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmarSenha: e.target.value }))}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {usuarioToEdit ? 'Atualizar' : 'Criar'} Usuário
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UsuarioForm;
