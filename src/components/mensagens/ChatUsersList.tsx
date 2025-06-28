
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MessageCircle, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/hooks/useChat';
import { UserProfile } from '@/types/chat';

interface ChatUsersListProps {
  onUserSelect: (user: UserProfile) => void;
  selectedUser?: UserProfile | null;
}

const ChatUsersList: React.FC<ChatUsersListProps> = ({ onUserSelect, selectedUser }) => {
  const { userProfile } = useAuth();
  const { usuarios, mensagens } = useChat();
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar usuários com base na pesquisa
  const filteredUsers = usuarios.filter(user =>
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular mensagens não lidas para cada usuário
  const getUnreadCount = (userId: string) => {
    return mensagens.filter(m => 
      m.remetente_id === userId && 
      m.destinatario_id === userProfile?.id && 
      !m.lida
    ).length;
  };

  // Pegar última mensagem com o usuário
  const getLastMessage = (userId: string) => {
    const userMessages = mensagens
      .filter(m => 
        (m.remetente_id === userId && m.destinatario_id === userProfile?.id) ||
        (m.remetente_id === userProfile?.id && m.destinatario_id === userId)
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return userMessages[0];
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
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Conversas ({filteredUsers.length})
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuários..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const unreadCount = getUnreadCount(user.id);
              const lastMessage = getLastMessage(user.id);
              
              return (
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
                        <AvatarImage src={user.avatar_url} alt={user.nome} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(user.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.nome}
                        </p>
                        {unreadCount > 0 && (
                          <Badge variant="destructive" className="ml-2 px-2 py-1 text-xs">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {user.perfil.charAt(0).toUpperCase() + user.perfil.slice(1)}
                      </p>
                      {lastMessage && (
                        <p className="text-xs text-gray-400 truncate mt-1">
                          {lastMessage.remetente_id === userProfile?.id ? 'Você: ' : ''}
                          {lastMessage.conteudo.substring(0, 30)}...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-gray-500">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum usuário encontrado</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatUsersList;
