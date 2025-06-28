
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  Video, 
  Mic, 
  Smile,
  AtSign,
  X
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile } from '@/types/chat';
import { useChat } from '@/hooks/useChat';

interface InputMensagemAvancadoProps {
  destinatarioId?: string;
  grupoId?: string;
  usuarios: UserProfile[];
  onEnviar?: () => void;
}

const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '👏', '🙌', '👐', '🤝',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔'
];

const InputMensagemAvancado: React.FC<InputMensagemAvancadoProps> = ({
  destinatarioId,
  grupoId,
  usuarios,
  onEnviar
}) => {
  const { enviarMensagem } = useChat();
  const [mensagem, setMensagem] = useState('');
  const [isEnviando, setIsEnviando] = useState(false);
  const [showMencoes, setShowMencoes] = useState(false);
  const [mencoes, setMencoes] = useState<string[]>([]);
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleEnviarMensagem = async () => {
    if ((!mensagem.trim() && arquivos.length === 0) || isEnviando) return;

    setIsEnviando(true);
    try {
      if (arquivos.length > 0) {
        // TODO: Implementar upload de arquivos
        console.log('Upload de arquivos não implementado ainda');
      } else {
        await enviarMensagem(
          mensagem,
          destinatarioId,
          grupoId,
          'texto',
          undefined,
          undefined,
          undefined,
          mencoes
        );
      }
      
      setMensagem('');
      setMencoes([]);
      setArquivos([]);
      onEnviar?.();
    } finally {
      setIsEnviando(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviarMensagem();
    }
  };

  const insertarEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const novaMensagem = mensagem.substring(0, start) + emoji + mensagem.substring(end);
      setMensagem(novaMensagem);
      
      // Manter o cursor após o emoji
      setTimeout(() => {
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
        textarea.focus();
      }, 0);
    }
  };

  const insertarMencao = (usuario: UserProfile) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const novaMensagem = mensagem.substring(0, start) + `@${usuario.nome} ` + mensagem.substring(end);
      setMensagem(novaMensagem);
      
      // Adicionar à lista de menções
      if (!mencoes.includes(usuario.id)) {
        setMencoes([...mencoes, usuario.id]);
      }
      
      setShowMencoes(false);
      setTimeout(() => {
        textarea.setSelectionRange(start + usuario.nome.length + 2, start + usuario.nome.length + 2);
        textarea.focus();
      }, 0);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setArquivos(prev => [...prev, ...files]);
  };

  const removerArquivo = (index: number) => {
    setArquivos(prev => prev.filter((_, i) => i !== index));
  };

  const iniciarGravacao = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // TODO: Implementar upload do áudio
        console.log('Áudio gravado:', audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
    }
  };

  const pararGravacao = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
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

  return (
    <div className="p-4 border-t bg-white">
      {/* Arquivos selecionados */}
      {arquivos.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {arquivos.map((arquivo, index) => (
            <div key={index} className="flex items-center bg-gray-100 px-2 py-1 rounded text-sm">
              <span className="truncate max-w-32">{arquivo.name}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => removerArquivo(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end space-x-2">
        {/* Botões de ação */}
        <div className="flex space-x-1">
          {/* Upload de arquivos */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Menções */}
          <Popover open={showMencoes} onOpenChange={setShowMencoes}>
            <PopoverTrigger asChild>
              <Button size="sm" variant="ghost">
                <AtSign className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <div className="max-h-48 overflow-y-auto">
                {usuarios.map(usuario => (
                  <div
                    key={usuario.id}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => insertarMencao(usuario)}
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={usuario.avatar_url} alt={usuario.nome} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(usuario.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{usuario.nome}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Emojis */}
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="ghost">
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <div className="grid grid-cols-8 gap-1">
                {emojis.map(emoji => (
                  <Button
                    key={emoji}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-lg"
                    onClick={() => insertarEmoji(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Gravação de áudio */}
          <Button
            size="sm"
            variant={isRecording ? "destructive" : "ghost"}
            onClick={isRecording ? pararGravacao : iniciarGravacao}
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>

        {/* Campo de texto */}
        <Textarea
          ref={textareaRef}
          placeholder="Digite sua mensagem..."
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          onKeyPress={handleKeyPress}
          className="min-h-[40px] max-h-32 resize-none"
          rows={1}
        />

        {/* Botão enviar */}
        <Button 
          onClick={handleEnviarMensagem}
          disabled={isEnviando || (!mensagem.trim() && arquivos.length === 0)}
          className="shrink-0"
        >
          {isEnviando ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default InputMensagemAvancado;
