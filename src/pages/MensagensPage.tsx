
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Search } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

const MensagensPage = () => {
  const { clientes, cuidadores } = useData();
  const [selectedContact, setSelectedContact] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Simular conversas
  const conversas = [
    {
      id: '1',
      nome: 'João da Silva',
      tipo: 'cliente',
      ultimaMensagem: 'Obrigado pelo atendimento de hoje!',
      hora: '14:30',
      naoLidas: 2
    },
    {
      id: '2',
      nome: 'Fernanda Lima',
      tipo: 'cuidador',
      ultimaMensagem: 'Paciente está se recuperando bem',
      hora: '13:15',
      naoLidas: 0
    },
    {
      id: '3',
      nome: 'Maria Oliveira',
      tipo: 'cliente',
      ultimaMensagem: 'Quando será a próxima sessão?',
      hora: '12:45',
      naoLidas: 1
    }
  ];

  const mensagensConversa = selectedContact ? [
    {
      id: '1',
      remetente: 'João da Silva',
      conteudo: 'Olá, tudo bem?',
      hora: '14:25',
      enviada: false
    },
    {
      id: '2',
      remetente: 'Você',
      conteudo: 'Tudo ótimo! Como posso ajudá-lo?',
      hora: '14:26',
      enviada: true
    },
    {
      id: '3',
      remetente: 'João da Silva',
      conteudo: 'Obrigado pelo atendimento de hoje!',
      hora: '14:30',
      enviada: false
    }
  ] : [];

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Enviando mensagem:', message);
      setMessage('');
    }
  };

  const filteredConversas = conversas.filter(conversa =>
    conversa.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mensagens</h1>
          <p className="text-gray-600">Comunicação com clientes e cuidadores</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Conversas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversas.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Não Lidas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversas.reduce((acc, conv) => acc + conv.naoLidas, 0)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversas</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {filteredConversas.map((conversa) => (
                <div
                  key={conversa.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 border-b ${
                    selectedContact?.id === conversa.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedContact(conversa)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{conversa.nome}</h4>
                        <p className="text-xs text-gray-500 capitalize">{conversa.tipo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{conversa.hora}</p>
                      {conversa.naoLidas > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                          {conversa.naoLidas}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 truncate">{conversa.ultimaMensagem}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedContact ? `Conversa com ${selectedContact.nome}` : 'Selecione uma conversa'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {selectedContact ? (
              <div className="flex flex-col h-96">
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {mensagensConversa.map((mensagem) => (
                    <div
                      key={mensagem.id}
                      className={`flex ${mensagem.enviada ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          mensagem.enviada
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{mensagem.conteudo}</p>
                        <p className={`text-xs mt-1 ${
                          mensagem.enviada ? 'text-primary-foreground/70' : 'text-gray-500'
                        }`}>
                          {mensagem.hora}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-500">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Selecione uma conversa para começar</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MensagensPage;
