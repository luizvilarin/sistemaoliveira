
import React from 'react';
import { Bell, Search } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
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
import MensagensDropdown from './MensagensDropdown';

const TopBar = () => {
  const { notificacoes } = useData();
  const unreadCount = notificacoes.filter(n => !n.lida).length;

  return (
    <header className="h-16 border-b border-border flex items-center px-6 bg-white dark:bg-gray-800">
      <div className="flex-1">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar..."
            className="pl-8 h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <MensagensDropdown />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">{unreadCount}</Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notificacoes.length > 0 ? (
              notificacoes.map((notificacao) => (
                <DropdownMenuItem key={notificacao.id} className="flex flex-col items-start p-3">
                  <div className="flex items-center w-full">
                    <span className="text-sm">{notificacao.mensagem}</span>
                    {!notificacao.lida && (
                      <span className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                        Novo
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {new Date(notificacao.criado_em).toLocaleString()}
                  </span>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>Sem notificações</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopBar;
