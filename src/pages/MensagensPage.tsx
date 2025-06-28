
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, Mail } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
  const { userProfile } = useAuth();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeUsersCount, setActiveUsersCount] = useState(0);

  useEffect(() => {
    if (userProfile) {
      // Calcular mensagens não lidas que EU recebi
      const myUnreadMessages = mensagens.filter(m => 
        m.destinatario_id === userProfile.id && !m.lida
      ).length;
      setUnreadCount(myUnreadMessages);

      // Buscar usuários ativos
      fetchActiveUsersCount();

      // Configurar realtime para atualizar contadores
      const channel = supabase
        .channel('mensagens-updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'mensagens',
            filter: `destinatario_id.eq.${userProfile.id}`
          }, 
          () => {
            // Recarregar dados quando houver mudanças nas minhas mensagens
            console.log('Mensagens atualizadas, recalculando não lidas');
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [mensagens, userProfile]);

  const fetchActiveUsersCount = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('ativo', true)
        .neq('id', userProfile?.id);

      if (error) throw error;
      setActiveUsersCount(data?.length || 0);
    } catch (error) {
      console.error('Erro ao buscar usuários ativos:', error);
    }
  };

  const handleUserSelect = (user: UserProfile) => {
    setSelectedUser(user);
  };

  // Calcular minhas mensagens (enviadas e recebidas)
  const myMessages = mensagens.filter(m => 
    m.remetente_id === userProfile?.id || m.destinatario_id === userProfile?.id
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mensagens</h1>
          <p className="text-gray-600">Comunicação interna da equipe</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minhas Mensagens</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myMessages.length}</div>
            <p className="text-xs text-gray-500">Total de conversas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
            <p className="text-xs text-gray-500">Mensagens pendentes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeUsersCount}</div>
            <p className="text-xs text-gray-500">Disponíveis para chat</p>
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
