
import React, { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MensagensDropdown from './MensagensDropdown';
import NotificationSystem from '@/components/notifications/NotificationSystem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const TopBar = () => {
  const authContext = useContext(AuthContext);
  
  // Proteção contra renderização fora do AuthProvider
  if (!authContext) {
    console.error('TopBar sendo renderizado fora do AuthProvider');
    return null;
  }
  
  const { userProfile, signOut } = authContext;
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Force a complete page refresh to ensure clean state
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during sign out:', error);
      // Force navigation even if signOut fails
      window.location.href = '/login';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Sistema de Gerenciamento
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationSystem />
          <MensagensDropdown />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={userProfile?.avatar_url || ''} alt={userProfile?.nome || ''} />
                  <AvatarFallback>
                    {userProfile?.nome ? getInitials(userProfile.nome) : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {userProfile?.nome && (
                    <p className="font-medium">{userProfile.nome}</p>
                  )}
                  {userProfile?.email && (
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {userProfile.email}
                    </p>
                  )}
                  {userProfile?.perfil && (
                    <p className="text-xs text-muted-foreground capitalize">
                      {userProfile.perfil}
                    </p>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/configuracoes')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
