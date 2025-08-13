
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { MessageSquare, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { NotificacaoSistema } from '@/types/data';

const MensagensDropdown = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notificacoesMensagens, setNotificacoesMensagens] = useState<NotificacaoSistema[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchNotificacoesMensagens = async () => {
      const { data, error } = await supabase
        .from('notificacoes_sistema')
        .select('*')
        .eq('usuario_id', user.id)
        .in('tipo', ['mensagem_individual', 'mensagem_grupo'])
        .eq('lida', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar notificações de mensagens:', error);
        return;
      }

      setNotificacoesMensagens(data || []);
    };

    fetchNotificacoesMensagens();

    // Configurar real-time subscription para notificações de mensagens
    const channel = supabase
      .channel('message-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificacoes_sistema',
          filter: `usuario_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as NotificacaoSistema;
          if (['mensagem_individual', 'mensagem_grupo'].includes(newNotification.tipo)) {
            setNotificacoesMensagens(prev => [newNotification, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notificacoes_sistema',
          filter: `usuario_id=eq.${user.id}`,
        },
        (payload) => {
          const updatedNotification = payload.new as NotificacaoSistema;
          if (updatedNotification.lida) {
            setNotificacoesMensagens(prev => prev.filter(n => n.id !== updatedNotification.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notificacoes_sistema')
      .update({ lida: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return;
    }

    setNotificacoesMensagens(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleNotificationClick = (notification: NotificacaoSistema) => {
    markAsRead(notification.id);
    navigate('/mensagens');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <MessageSquare className="h-5 w-5" />
          {notificacoesMensagens.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
              {notificacoesMensagens.length > 9 ? '9+' : notificacoesMensagens.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Mensagens Recebidas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notificacoesMensagens.length > 0 ? (
          notificacoesMensagens.slice(0, 5).map((notification) => (
            <DropdownMenuItem 
              key={notification.id} 
              className="flex items-start gap-3 p-3 cursor-pointer"
              onClick={() => handleNotificationClick(notification)}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{notification.titulo}</p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.created_at || '').toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{notification.mensagem}</p>
                <div className="flex justify-end mt-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>Sem mensagens novas</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center" onClick={() => navigate('/mensagens')}>
          <Button variant="ghost" size="sm" className="w-full">
            Ver todas as mensagens
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MensagensDropdown;
