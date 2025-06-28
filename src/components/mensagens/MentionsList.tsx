
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AtSign } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserProfile } from '@/types/chat';

interface MentionsListProps {
  usuarios: UserProfile[];
  isGroup: boolean;
  onMentionSelect: (usuario: UserProfile) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MentionsList: React.FC<MentionsListProps> = ({
  usuarios,
  isGroup,
  onMentionSelect,
  open,
  onOpenChange
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  if (!isGroup) return null;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost">
          <AtSign className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="max-h-48 overflow-y-auto">
          {usuarios.map(usuario => (
            <div
              key={usuario.id}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
              onClick={() => onMentionSelect(usuario)}
            >
              <Avatar className="w-6 h-6">
                <AvatarImage src={usuario.avatar_url} alt={usuario.nome} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(usuario.nome)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{usuario.nome}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MentionsList;
