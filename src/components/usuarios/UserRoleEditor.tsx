
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { userService } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Edit2, Save, X } from 'lucide-react';

interface UserRoleEditorProps {
  user: {
    id: string;
    perfil: string;
    nome: string;
  };
  onRoleUpdated: () => void;
}

const UserRoleEditor: React.FC<UserRoleEditorProps> = ({ user, onRoleUpdated }) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [newRole, setNewRole] = useState(user.perfil);
  const [isLoading, setIsLoading] = useState(false);

  const canEdit = userService.canEditUserRole(userProfile?.perfil || '', user.perfil);

  const handleSave = async () => {
    if (newRole === user.perfil) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await userService.updateUserRole(user.id, newRole as 'admin' | 'gestor' | 'cuidador');
      
      toast({
        title: 'Cargo atualizado',
        description: `Cargo de ${user.nome} alterado para ${newRole}`,
      });
      
      onRoleUpdated();
      setIsEditing(false);
    } catch (error: any) {
      console.error('Erro ao atualizar cargo:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar o cargo',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setNewRole(user.perfil);
    setIsEditing(false);
  };

  if (!canEdit) {
    return <span className="capitalize text-gray-600">{user.perfil}</span>;
  }

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <span className="capitalize">{user.perfil}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="h-6 w-6 p-0"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={newRole} onValueChange={setNewRole}>
        <SelectTrigger className="w-32 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {userProfile?.perfil === 'admin' && (
            <>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="gestor">Gestor</SelectItem>
            </>
          )}
          <SelectItem value="cuidador">Cuidador</SelectItem>
        </SelectContent>
      </Select>
      
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          disabled={isLoading}
          className="h-6 w-6 p-0 text-green-600"
        >
          <Save className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          disabled={isLoading}
          className="h-6 w-6 p-0 text-red-600"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default UserRoleEditor;
