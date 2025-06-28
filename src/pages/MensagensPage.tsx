
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, Mail } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import ChatUsersList from '@/components/mensagens/ChatUsersList';
import ChatWindow from '@/components/mensagens/ChatWindow';

interface UserProfile {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  avatar_url?: string;
  ativo: boolean;
}

const MensagensPage = () => {
  const { mensagens } = useData();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const handleUserSelect = (user: UserProfile) => {
    setSelectedUser(user);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mensagens</h1>
          <p className="text-gray-600">Comunicação com usuários do sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Mensagens</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mensagens.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Não Lidas</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mensagens.filter(m => !m.lida).length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ChatUsersList 
            onUserSelect={handleUserSelect}
            selectedUser={selectedUser}
          />
        </div>

        <div className="lg:col-span-2">
          <ChatWindow selectedUser={selectedUser} />
        </div>
      </div>
    </div>
  );
};

export default MensagensPage;
