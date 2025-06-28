
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/hooks/useChat';
import GrupoManager from '@/components/mensagens/GrupoManager';
import ChatUsersList from '@/components/mensagens/ChatUsersList';
import ChatWindow from '@/components/mensagens/ChatWindow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GrupoChat, UserProfile } from '@/types/chat';

const MensagensPage = () => {
  const { userProfile } = useAuth();
  const { grupos, usuarios, mensagens, loading } = useChat();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GrupoChat | null>(null);
  const [activeTab, setActiveTab] = useState<'usuarios' | 'grupos'>('usuarios');

  // Calcular estatísticas
  const mensagensNaoLidas = mensagens.filter(m => 
    m.destinatario_id === userProfile?.id && !m.lida
  ).length;

  const minhasConversas = mensagens.filter(m => 
    m.remetente_id === userProfile?.id || m.destinatario_id === userProfile?.id
  );

  const conversasUnicas = new Set();
  minhasConversas.forEach(m => {
    if (m.grupo_id) {
      conversasUnicas.add(`grupo_${m.grupo_id}`);
    } else {
      const outroUserId = m.remetente_id === userProfile?.id ? m.destinatario_id : m.remetente_id;
      conversasUnicas.add(`user_${outroUserId}`);
    }
  });

  const handleUserSelect = (user: UserProfile) => {
    setSelectedUser(user);
    setSelectedGroup(null);
    setActiveTab('usuarios');
  };

  const handleGroupSelect = (group: GrupoChat) => {
    setSelectedGroup(group);
    setSelectedUser(null);
    setActiveTab('grupos');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mensagens</h1>
          <p className="text-gray-600">Sistema de comunicação avançado</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversas Ativas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversasUnicas.size}</div>
            <p className="text-xs text-gray-500">Entre usuários e grupos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{mensagensNaoLidas}</div>
            <p className="text-xs text-gray-500">Mensagens pendentes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Online</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{usuarios.length}</div>
            <p className="text-xs text-gray-500">Disponíveis para chat</p>
          </CardContent>
        </Card>
      </div>

      {/* Interface principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'usuarios' | 'grupos')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="usuarios">Usuários</TabsTrigger>
              <TabsTrigger value="grupos">Grupos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="usuarios" className="mt-4">
              <ChatUsersList 
                onUserSelect={handleUserSelect}
                selectedUser={selectedUser}
              />
            </TabsContent>
            
            <TabsContent value="grupos" className="mt-4">
              <div className="space-y-4">
                <GrupoManager usuarios={usuarios} />
                
                {/* Lista de grupos */}
                <Card>
                  <CardHeader>
                    <CardTitle>Meus Grupos ({grupos.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-1 max-h-96 overflow-y-auto">
                      {grupos.length > 0 ? (
                        grupos.map((grupo) => (
                          <div
                            key={grupo.id}
                            className={`p-3 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                              selectedGroup?.id === grupo.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                            }`}
                            onClick={() => handleGroupSelect(grupo)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {grupo.nome}
                                </p>
                                {grupo.descricao && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {grupo.descricao}
                                  </p>
                                )}
                                <p className="text-xs text-gray-400">
                                  Criado em {new Date(grupo.created_at).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Nenhum grupo ainda</p>
                          <p className="text-sm">Crie seu primeiro grupo!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-2">
          <ChatWindow 
            selectedUser={selectedUser} 
            selectedGroup={selectedGroup}
            usuarios={usuarios}
          />
        </div>
      </div>
    </div>
  );
};

export default MensagensPage;
