
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MensagensAvancada, UserProfile } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { Smile, Reply, MoreVertical } from 'lucide-react';
import MessageStatusIndicator from './MessageStatusIndicator';
import UserStatusIndicator from '../usuarios/UserStatusIndicator';

interface MensagemAvancadaProps {
  mensagem: MensagensAvancada;
  usuarios: UserProfile[];
  isGroup?: boolean;
  onAddReaction?: (emoji: string) => void;
  onMarkAsRead?: () => void;
}

const MensagemAvancada: React.FC<MensagemAvancadaProps> = ({
  mensagem,
  usuarios,
  isGroup = false,
  onAddReaction,
  onMarkAsRead
}) => {
  const { userProfile } = useAuth();
  const isOwnMessage = mensagem.remetente_id === userProfile?.id;
  
  const remetente = usuarios.find(u => u.id === mensagem.remetente_id);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleReactionClick = (emoji: string) => {
    onAddReaction?.(emoji);
  };

  // Marcar como lida se não for própria mensagem
  React.useEffect(() => {
    if (!isOwnMessage && !mensagem.lida) {
      onMarkAsRead?.();
    }
  }, [isOwnMessage, mensagem.lida, onMarkAsRead]);

  const commonReactions = ['👍', '❤️', '😂', '😢', '😮', '🎉'];

  return (
    <div className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={remetente?.avatar_url} alt={remetente?.nome} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs">
          {remetente ? getInitials(remetente.nome) : '?'}
        </AvatarFallback>
      </Avatar>

      <div className={`flex-1 max-w-md ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Header com nome e status */}
        {!isOwnMessage && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-700">
              {remetente?.nome || 'Usuário'}
            </span>
            <UserStatusIndicator 
              status={remetente?.status_online || 'offline'} 
              size="sm" 
            />
          </div>
        )}

        {/* Conteúdo da mensagem */}
        <div className={`
          relative group px-3 py-2 rounded-lg max-w-full break-words
          ${isOwnMessage 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-900'
          }
        `}>
          {/* Tipo de mensagem especial */}
          {mensagem.tipo_mensagem !== 'texto' && (
            <Badge variant="secondary" className="mb-2 text-xs">
              {mensagem.tipo_mensagem}
            </Badge>
          )}

          {/* Conteúdo */}
          <p className="text-sm whitespace-pre-wrap">{mensagem.conteudo}</p>

          {/* Arquivo anexo */}
          {mensagem.arquivo_url && (
            <div className="mt-2 p-2 bg-black/10 rounded">
              <a 
                href={mensagem.arquivo_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm underline"
              >
                📎 {mensagem.arquivo_nome || 'Arquivo'}
              </a>
            </div>
          )}

          {/* Reações */}
          {mensagem.emoji_reacoes && Object.keys(mensagem.emoji_reacoes).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(mensagem.emoji_reacoes).map(([emoji, userIds]) => (
                <button
                  key={emoji}
                  onClick={() => handleReactionClick(emoji)}
                  className="flex items-center gap-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs hover:bg-white/30 transition-colors"
                >
                  <span>{emoji}</span>
                  <span>{userIds.length}</span>
                </button>
              ))}
            </div>
          )}

          {/* Botões de ação - aparecem no hover */}
          <div className="absolute top-0 right-0 transform translate-x-full opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-1 ml-2">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Reply className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Smile className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Reações rápidas */}
        <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {commonReactions.map(emoji => (
            <button
              key={emoji}
              onClick={() => handleReactionClick(emoji)}
              className="hover:scale-125 transition-transform text-lg"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Footer com timestamp e status */}
        <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
          <span>
            {formatDistanceToNow(new Date(mensagem.created_at), { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </span>
          
          {/* Status da mensagem - só para mensagens próprias */}
          {isOwnMessage && (
            <MessageStatusIndicator 
              entregue={mensagem.entregue || false}
              visualizada={mensagem.visualizada || false}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MensagemAvancada;
