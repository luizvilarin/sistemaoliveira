
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  assunto: string;
  lida: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedUser }) => {
  const { userProfile } = useAuth();
  const { addMensagem } = useData();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedUser && userProfile) {
      loadMessages();
      
      // Marcar mensagens como lidas quando abrir a conversa
      markMessagesAsRead();
      
      // Configurar realtime para mensagens entre estes dois usuários específicos
      const channel = supabase
        .channel(`chat-${userProfile.id}-${selectedUser.id}`)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'mensagens',
            filter: `or(and(remetente_id.eq.${userProfile.id},destinatario_id.eq.${selectedUser.id}),and(remetente_id.eq.${selectedUser.id},destinatario_id.eq.${userProfile.id}))`
          }, 
          (payload) => {
            console.log('Nova mensagem recebida no chat:', payload);
            const newMsg = payload.new as ChatMessage;
            setMessages(prev => {
              // Evitar duplicatas
              if (prev.some(msg => msg.id === newMsg.id)) {
                return prev;
              }
              const updatedMessages = [...prev, newMsg].sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              );
              
              // Se a mensagem foi recebida (não enviada por mim), marcar como lida
              if (newMsg.remetente_id !== userProfile.id) {
                markMessageAsRead(newMsg.id);
              }
              
              return updatedMessages;
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setMessages([]);
    }
  }, [selectedUser, userProfile]);

  const loadMessages = async () => {
    if (!selectedUser || !userProfile) return;
    
    setIsLoading(true);
    try {
      console.log('Carregando conversa entre:', userProfile.id, 'e', selectedUser.id);
      
      const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .or(`and(remetente_id.eq.${userProfile.id},destinatario_id.eq.${selectedUser.id}),and(remetente_id.eq.${selectedUser.id},destinatario_id.eq.${userProfile.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        throw error;
      }

      console.log('Mensagens da conversa carregadas:', data?.length || 0);
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar as mensagens.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!selectedUser || !userProfile) return;
    
    try {
      // Marcar como lidas todas as mensagens não lidas desta conversa que eu recebi
      await supabase
        .from('mensagens')
        .update({ lida: true })
        .eq('remetente_id', selectedUser.id)
        .eq('destinatario_id', userProfile.id)
        .eq('lida', false);
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('mensagens')
        .update({ lida: true })
        .eq('id', messageId);
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !userProfile || isSending) return;

    setIsSending(true);
    try {
      console.log('Enviando mensagem para:', selectedUser.id);
      
      const messageData = {
        assunto: `Mensagem para ${selectedUser.nome}`,
        conteudo: newMessage.trim(),
        remetente_id: userProfile.id,
        destinatario_id: selectedUser.id,
        lida: false,
      };

      await addMensagem(messageData);
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
        description: 'Não foi possível enviar a mensagem. Tente novamente.',
      });
    } finally {
      setIsSending(false);
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
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : messages.length > 0 ? (
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
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs opacity-70">
                        {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {message.remetente_id === userProfile?.id && (
                        <span className="text-xs opacity-70">
                          {message.lida ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
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
                disabled={isSending}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isSending || !newMessage.trim()}
              >
                {isSending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatWindow;
