
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { userService } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';
import UserStatusIndicator from './UserStatusIndicator';

interface UserStatusSelectorProps {
  currentStatus: 'online' | 'offline' | 'ausente' | 'ocupado' | 'invisivel';
  onStatusChange?: (status: 'online' | 'offline' | 'ausente' | 'ocupado' | 'invisivel') => void;
}

const UserStatusSelector: React.FC<UserStatusSelectorProps> = ({ 
  currentStatus, 
  onStatusChange 
}) => {
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: 'online' | 'offline' | 'ausente' | 'ocupado' | 'invisivel') => {
    try {
      await userService.updateUserStatus(newStatus);
      onStatusChange?.(newStatus);
      
      toast({
        title: 'Status atualizado',
        description: `Seu status foi alterado para ${newStatus}`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível atualizar seu status',
      });
    }
  };

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-32">
        <SelectValue>
          <div className="flex items-center gap-2">
            <UserStatusIndicator status={currentStatus} size="sm" />
            <span className="text-xs capitalize">{currentStatus}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="online">
          <div className="flex items-center gap-2">
            <UserStatusIndicator status="online" size="sm" />
            <span>Online</span>
          </div>
        </SelectItem>
        <SelectItem value="ocupado">
          <div className="flex items-center gap-2">
            <UserStatusIndicator status="ocupado" size="sm" />
            <span>Ocupado</span>
          </div>
        </SelectItem>
        <SelectItem value="ausente">
          <div className="flex items-center gap-2">
            <UserStatusIndicator status="ausente" size="sm" />
            <span>Ausente</span>
          </div>
        </SelectItem>
        <SelectItem value="invisivel">
          <div className="flex items-center gap-2">
            <UserStatusIndicator status="offline" size="sm" />
            <span>Invisível</span>
          </div>
        </SelectItem>
        <SelectItem value="offline">
          <div className="flex items-center gap-2">
            <UserStatusIndicator status="offline" size="sm" />
            <span>Offline</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default UserStatusSelector;
