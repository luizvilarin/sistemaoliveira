
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { MessageSquare, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useData } from '@/contexts/DataContext';
import { useNavigate } from 'react-router-dom';

const MensagensDropdown = () => {
  const navigate = useNavigate();
  const { mensagens } = useData();
  
  const mensagensNaoLidas = mensagens.filter(m => !m.lida).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <MessageSquare className="h-5 w-5" />
          {mensagensNaoLidas > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
              {mensagensNaoLidas}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Mensagens</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {mensagens.length > 0 ? (
          mensagens.slice(0, 3).map((mensagem) => (
            <DropdownMenuItem key={mensagem.id} className="flex items-start gap-3 p-3 cursor-pointer">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">Remetente</p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(mensagem.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{mensagem.assunto}</p>
                <p className="text-xs text-muted-foreground truncate">{mensagem.conteudo}</p>
                {!mensagem.lida && (
                  <div className="flex justify-end mt-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>Sem mensagens</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center" onClick={() => navigate('/mensagens')}>
          <Button variant="ghost" size="sm" className="w-full">
            Ver todas as mensagens
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MensagensDropdown;
