
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Smile, 
  Reply, 
  Play,
  Pause,
  Download,
  Image as ImageIcon,
  Video,
  Mic,
  File
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MensagensAvancada, UserProfile } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';

interface MensagemAvancadaProps {
  mensagem: MensagensAvancada;
  usuarios: UserProfile[];
  isGroup?: boolean;
  onAddReaction?: (emoji: string) => Promise<void>;
  onMarkAsRead?: () => Promise<void>;
}

const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉'];

const MensagemAvancada: React.FC<MensagemAvancadaProps> = ({ 
  mensagem, 
  usuarios, 
  isGroup = false,
  onAddReaction,
  onMarkAsRead
}) => {
  const { userProfile } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  
  const remetente = usuarios.find(u => u.id === mensagem.remetente_id);
  const isMyMessage = mensagem.remetente_id === userProfile?.id;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const formatarMencoes = (texto: string, mencoes?: string[]) => {
    if (!mencoes || mencoes.length === 0) return texto;
    
    let textoFormatado = texto;
    mencoes.forEach(userId => {
      const usuario = usuarios.find(u => u.id === userId);
      if (usuario) {
        textoFormatado = textoFormatado.replace(
          `@${userId}`, 
          `<span class="bg-blue-100 text-blue-800 px-1 rounded">@${usuario.nome}</span>`
        );
      }
    });
    
    return textoFormatado;
  };

  const handleReacao = async (emoji: string) => {
    if (onAddReaction) {
      await onAddReaction(emoji);
    }
  };

  const renderConteudoMensagem = () => {
    switch (mensagem.tipo_mensagem) {
      case 'imagem':
        return (
          <div className="max-w-xs">
            <img 
              src={mensagem.arquivo_url || ''} 
              alt={mensagem.arquivo_nome || 'Imagem'}
              className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90"
              onClick={() => window.open(mensagem.arquivo_url || '', '_blank')}
            />
            {mensagem.conteudo && (
              <p className="mt-2 text-sm">{mensagem.conteudo}</p>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="max-w-xs">
            <video 
              controls 
              className="rounded-lg max-w-full h-auto"
              preload="metadata"
            >
              <source src={mensagem.arquivo_url || ''} type="video/mp4" />
              Seu navegador não suporta vídeo.
            </video>
            {mensagem.conteudo && (
              <p className="mt-2 text-sm">{mensagem.conteudo}</p>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="flex items-center space-x-3 bg-gray-100 p-3 rounded-lg max-w-xs">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <div className="flex-1">
              <div className="text-sm font-medium">Áudio</div>
              {mensagem.duracao_audio && (
                <div className="text-xs text-gray-500">
                  {Math.floor(mensagem.duracao_audio / 60)}:{String(mensagem.duracao_audio % 60).padStart(2, '0')}
                </div>
              )}
            </div>
            <audio
              src={mensagem.arquivo_url || ''}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              style={{ display: 'none' }}
              controls={false}
            />
          </div>
        );

      case 'arquivo':
        return (
          <div className="flex items-center space-x-3 bg-gray-100 p-3 rounded-lg max-w-xs">
            <File className="h-8 w-8 text-gray-500" />
            <div className="flex-1">
              <div className="text-sm font-medium truncate">
                {mensagem.arquivo_nome || 'Arquivo'}
              </div>
              <div className="text-xs text-gray-500">Clique para baixar</div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.open(mensagem.arquivo_url || '', '_blank')}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );

      default:
        return (
          <div 
            className="text-sm"
            dangerouslySetInnerHTML={{
              __html: formatarMencoes(mensagem.conteudo, mensagem.mencoes)
            }}
          />
        );
    }
  };

  const renderReacoes = () => {
    if (!mensagem.emoji_reacoes || typeof mensagem.emoji_reacoes !== 'object') {
      return null;
    }

    const reacoes = mensagem.emoji_reacoes as Record<string, string[]>;
    if (Object.keys(reacoes).length === 0) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {Object.entries(reacoes).map(([emoji, userIds]) => (
          <Badge
            key={emoji}
            variant="secondary"
            className="text-xs cursor-pointer hover:bg-gray-200"
            onClick={() => handleReacao(emoji)}
          >
            {emoji} {userIds.length}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className={`max-w-xs lg:max-w-md ${isMyMessage ? 'order-2' : 'order-1'}`}>
        {/* Avatar e info do remetente (apenas para grupos e mensagens dos outros) */}
        {!isMyMessage && (
          <div className="flex items-center space-x-2 mb-1">
            <Avatar className="w-6 h-6">
              <AvatarImage src={remetente?.avatar_url} alt={remetente?.nome} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {remetente ? getInitials(remetente.nome) : '?'}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-gray-600">
              {remetente?.nome || 'Usuário desconhecido'}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(mensagem.created_at).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        )}

        {/* Conteúdo da mensagem */}
        <div
          className={`p-3 rounded-lg ${
            isMyMessage
              ? 'bg-primary text-primary-foreground'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {renderConteudoMensagem()}

          {/* Horário para mensagens próprias */}
          {isMyMessage && (
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs opacity-70">
                {new Date(mensagem.created_at).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <span className="text-xs opacity-70">
                {mensagem.lida ? '✓✓' : '✓'}
              </span>
            </div>
          )}
        </div>

        {/* Reações */}
        {renderReacoes()}

        {/* Ações da mensagem */}
        <div className="flex items-center justify-between mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center space-x-1">
            {/* Emojis */}
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Smile className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <div className="flex space-x-1">
                  {emojis.map(emoji => (
                    <Button
                      key={emoji}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => handleReacao(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Menu de ações */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Reply className="h-4 w-4 mr-2" />
                  Responder
                </DropdownMenuItem>
                {isMyMessage && (
                  <>
                    <DropdownMenuItem>Editar</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Excluir</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MensagemAvancada;
