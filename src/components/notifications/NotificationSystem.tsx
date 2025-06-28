
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Bell, X, AlertTriangle, Info, CheckCircle, MessageSquare, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface NotificacaoSistema {
  id: string;
  usuario_id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  data_criacao: string;
  data_vencimento?: string;
  lida: boolean;
  acao_url?: string;
  metadados?: any;
  grupo_id?: string;
  mensagem_id?: string;
}

const NotificationSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState<NotificacaoSistema[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchNotificacoes();
      setupRealtimeSubscription();
    }
  }, [user?.id]);

  const fetchNotificacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('notificacoes_sistema')
        .select('*')
        .eq('usuario_id', user?.id)
        .order('data_criacao', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotificacoes(data || []);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('notificacoes_sistema')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificacoes_sistema',
          filter: `usuario_id=eq.${user?.id}`,
        },
        (payload) => {
          const newNotification = payload.new as NotificacaoSistema;
          setNotificacoes(prev => [newNotification, ...prev]);
          
          // Mostrar toast para novas notificações
          toast({
            title: newNotification.titulo,
            description: newNotification.mensagem,
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const marcarComoLida = async (notificacaoId: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes_sistema')
        .update({ lida: true })
        .eq('id', notificacaoId);

      if (error) throw error;

      setNotificacoes(prev =>
        prev.map(notif =>
          notif.id === notificacaoId ? { ...notif, lida: true } : notif
        )
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const removerNotificacao = async (notificacaoId: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes_sistema')
        .delete()
        .eq('id', notificacaoId);

      if (error) throw error;

      setNotificacoes(prev => prev.filter(notif => notif.id !== notificacaoId));
    } catch (error) {
      console.error('Erro ao remover notificação:', error);
    }
  };

  const handleNotificationClick = async (notificacao: NotificacaoSistema) => {
    // Marcar como lida
    if (!notificacao.lida) {
      await marcarComoLida(notificacao.id);
    }

    // Navegar baseado no tipo da notificação
    if (notificacao.tipo === 'mensagem_individual' || notificacao.tipo === 'mensagem_grupo') {
      navigate('/mensagens');
    } else if (notificacao.acao_url) {
      navigate(notificacao.acao_url);
    }

    setIsOpen(false);
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'mensagem_individual':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'mensagem_grupo':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'lembrete':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'tarefa':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'relatorio':
        return <Info className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'mensagem_individual':
        return 'Mensagem';
      case 'mensagem_grupo':
        return 'Grupo';
      case 'lembrete':
        return 'Lembrete';
      case 'tarefa':
        return 'Tarefa';
      case 'relatorio':
        return 'Relatório';
      default:
        return 'Notificação';
    }
  };

  const notificacoesPendentes = notificacoes.filter(n => !n.lida);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {notificacoesPendentes.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {notificacoesPendentes.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              Notificações
              {notificacoesPendentes.length > 0 && (
                <Badge variant="secondary">
                  {notificacoesPendentes.length} nova{notificacoesPendentes.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto p-0">
            {notificacoes.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notificacoes.map((notificacao) => (
                  <div
                    key={notificacao.id}
                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notificacao.lida ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => handleNotificationClick(notificacao)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <div className="flex items-center gap-1 mt-1">
                          {getIcon(notificacao.tipo)}
                          <span className="text-xs text-gray-500">
                            {getTipoLabel(notificacao.tipo)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{notificacao.titulo}</h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notificacao.mensagem}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notificacao.data_criacao || notificacao.created_at || '').toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!notificacao.lida && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              marcarComoLida(notificacao.id);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removerNotificacao(notificacao.id);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationSystem;
