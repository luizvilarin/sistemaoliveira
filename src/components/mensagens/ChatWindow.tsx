
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';

interface UserProfile {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  avatar_url?: string;
  ativo: boolean;
}

interface ChatWindowProps {
  selectedUser: UserProfile | null;
}

interface ChatMessage {
  id: string;
  conteudo: string;
  remetente_id: string;
  destinatario_id: string;
  created_at: string;
  remetente?: UserProfile;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedUser }) => {
  const { userProfile } = useAuth();
  const { addMensagem } = useData();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedUser && userProfile) {
      // Por enquanto, vamos simular algumas mensagens
      // Em um sistema real, você buscaria as mensagens do banco de dados
      setMessages([]);
    }
  }, [selectedUser, userProfile]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !userProfile) return;

    setIsLoading(true);
    try {
      await addMensagem({
        assunto: `Mensagem para ${selectedUser.nome}`,
        conteudo: newMessage,
        remetente_id: userProfile.id,
        destinatario_id: selectedUser.id,
        lida: false,
      });

      // Adicionar mensagem localmente para feedback imediato
      const localMessage: ChatMessage = {
        id: Date.now().toString(),
        conteudo: newMessage,
        remetente_id: userProfile.id,
        destinatario_id: selectedUser.id,
        created_at: new Date().toISOString(),
        remetente: userProfile,
      };

      setMessages(prev => [...prev, localMessage]);
      setNewMessage('');

      toast({
        title: 'Mensagem enviada',
        description: `Mensagem enviada para ${selectedUser.nome}`,
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível enviar a mensagem.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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

  if (!selectedUser) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Selecione um usuário para iniciar uma conversa</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={selectedUser.avatar_url || ''} alt={selectedUser.nome} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getInitials(selectedUser.nome)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold">{selectedUser.nome}</p>
            <p className="text-sm text-gray-500 capitalize">{selectedUser.perfil}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col h-96">
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.remetente_id === userProfile?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.remetente_id === userProfile?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.conteudo}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Nenhuma mensagem ainda. Inicie a conversa!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || !newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatWindow;
