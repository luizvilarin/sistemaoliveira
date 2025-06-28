
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Users, Settings, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/hooks/useChat';
import { GrupoChat, UserProfile, MensagensAvancada } from '@/types/chat';
import MensagemAvancada from './MensagemAvancada';
import InputMensagemAvancado from './InputMensagemAvancado';

interface ChatWindowProps {
  selectedUser?: UserProfile | null;
  selectedGroup?: GrupoChat | null;
  usuarios: UserProfile[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedUser, selectedGroup, usuarios }) => {
  const { userProfile } = useAuth();
  const { mensagens, enviarMensagem, adicionarReacao, marcarComoLida } = useChat();
  const [mensagensFiltradas, setMensagensFiltradas] = useState<MensagensAvancada[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedUser) {
      // Filtrar mensagens entre o usuário atual e o usuário selecionado
      const mensagensConversa = mensagens.filter(m => 
        (m.remetente_id === userProfile?.id && m.destinatario_id === selectedUser.id) ||
        (m.remetente_id === selectedUser.id && m.destinatario_id === userProfile?.id)
      );
      setMensagensFiltradas(mensagensConversa);
    } else if (selectedGroup) {
      // Filtrar mensagens do grupo selecionado
      const mensagensGrupo = mensagens.filter(m => m.grupo_id === selectedGroup.id);
      setMensagensFiltradas(mensagensGrupo);
    } else {
      setMensagensFiltradas([]);
    }
  }, [selectedUser, selectedGroup, mensagens, userProfile]);

  useEffect(() => {
    scrollToBottom();
  }, [mensagensFiltradas]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEnviarMensagem = async (
    conteudo: string,
    tipoMensagem: 'texto' | 'imagem' | 'video' | 'audio' | 'arquivo' = 'texto',
    arquivoUrl?: string,
    arquivoNome?: string,
    duracaoAudio?: number,
    mencoes?: string[]
  ) => {
    if (selectedUser) {
      await enviarMensagem(
        conteudo,
        selectedUser.id,
        undefined,
        tipoMensagem,
        arquivoUrl,
        arquivoNome,
        duracaoAudio,
        mencoes
      );
    } else if (selectedGroup) {
      await enviarMensagem(
        conteudo,
        undefined,
        selectedGroup.id,
        tipoMensagem,
        arquivoUrl,
        arquivoNome,
        duracaoAudio,
        mencoes
      );
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

  if (!selectedUser && !selectedGroup) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
            <p>Escolha um usuário ou grupo para começar a conversar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chatTitle = selectedUser ? selectedUser.nome : selectedGroup?.nome;
  const chatSubtitle = selectedUser ? selectedUser.email : selectedGroup?.descricao;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage 
                src={selectedUser?.avatar_url || selectedGroup?.imagem_url} 
                alt={chatTitle} 
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                {selectedGroup ? (
                  <Users className="h-5 w-5" />
                ) : (
                  getInitials(chatTitle || '')
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{chatTitle}</CardTitle>
              {chatSubtitle && (
                <p className="text-sm text-gray-500">{chatSubtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {selectedGroup && (
              <>
                <Button variant="ghost" size="sm">
                  <UserPlus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
          {mensagensFiltradas.length > 0 ? (
            mensagensFiltradas.map((mensagem) => (
              <MensagemAvancada
                key={mensagem.id}
                mensagem={mensagem}
                usuarios={usuarios}
                isGroup={!!selectedGroup}
                onAddReaction={(emoji) => adicionarReacao(mensagem.id, emoji)}
                onMarkAsRead={() => marcarComoLida(mensagem.id)}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma mensagem ainda</p>
                <p className="text-sm">Envie a primeira mensagem!</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <InputMensagemAvancado 
            onSendMessage={handleEnviarMensagem}
            usuarios={selectedGroup ? usuarios : []}
            isGroup={!!selectedGroup}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatWindow;
