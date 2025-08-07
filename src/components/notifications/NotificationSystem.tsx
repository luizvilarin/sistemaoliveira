
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { NotificacaoSistema } from '@/types/chat';

const NotificationSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState<NotificacaoSistema[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchNotificacoes = async () => {
      const { data, error } = await supabase
        .from('notificacoes_sistema')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('lida', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erro ao buscar notificações:', error);
        return;
      }

      setNotificacoes(data || []);
      setUnreadCount(data?.length || 0);
    };

    fetchNotificacoes();

    // Configurar real-time subscription
    const channel = supabase
      .channel('user-notifications')
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
          setNotificacoes(prev => [newNotification, ...prev.slice(0, 9)]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast notification
          toast({
            title: newNotification.titulo,
            description: newNotification.mensagem,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notificacoes_sistema')
      .update({ lida: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return;
    }

    setNotificacoes(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleNotificationClick = (notification: NotificacaoSistema) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.tipo === 'tarefa') {
      navigate('/tarefas');
    } else if (notification.tipo === 'mensagem') {
      navigate('/mensagens');
    } else if (notification.tipo === 'lembrete') {
      navigate('/calendario');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="p-2">
          <h3 className="font-medium mb-2">Notificações</h3>
          {notificacoes.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Nenhuma notificação nova
            </p>
          ) : (
            <div className="space-y-1">
              {notificacoes.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start p-3 cursor-pointer"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="font-medium text-sm">{notification.titulo}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {notification.mensagem}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(notification.created_at).toLocaleString()}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationSystem;
