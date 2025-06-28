
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, User, Circle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  avatar_url?: string;
  ativo: boolean;
}

interface ChatUsersListProps {
  onUserSelect: (user: UserProfile) => void;
  selectedUser: UserProfile | null;
}

const ChatUsersList: React.FC<ChatUsersListProps> = ({ onUserSelect, selectedUser }) => {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    
    // Configurar realtime para atualizações de usuários
    const channel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        () => {
          console.log('Perfil atualizado, recarregando lista de usuários');
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userProfile]);

  const fetchUsers = async () => {
    try {
      console.log('Buscando usuários ativos...');
      
      // Buscar todos os perfis ativos exceto o próprio usuário
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, email, perfil, avatar_url, ativo')
        .neq('id', userProfile?.id)
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        throw error;
      }
      
      console.log('Usuários encontrados:', data?.length || 0);
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários Ativos ({filteredUsers.length})</CardTitle>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`p-3 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                  selectedUser?.id === user.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => onUserSelect(user)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar_url || ''} alt={user.nome} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(user.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <Circle className="absolute -bottom-1 -right-1 w-4 h-4 text-green-500 fill-current" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.nome}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {user.perfil}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário ativo disponível'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatUsersList;
