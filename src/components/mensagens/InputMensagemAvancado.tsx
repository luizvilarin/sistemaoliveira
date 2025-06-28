
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, X } from 'lucide-react';
import { UserProfile } from '@/types/chat';
import { useChat } from '@/hooks/useChat';
import EmojiPicker from './EmojiPicker';
import MentionsList from './MentionsList';
import FileAttachments from './FileAttachments';
import AudioRecorder from './AudioRecorder';

interface InputMensagemAvancadoProps {
  destinatarioId?: string;
  grupoId?: string;
  usuarios: UserProfile[];
  isGroup?: boolean;
  onSendMessage?: (
    conteudo: string,
    tipoMensagem?: 'texto' | 'imagem' | 'video' | 'audio' | 'arquivo',
    arquivoUrl?: string,
    arquivoNome?: string,
    duracaoAudio?: number,
    mencoes?: string[]
  ) => Promise<void>;
  onEnviar?: () => void;
}

const InputMensagemAvancado: React.FC<InputMensagemAvancadoProps> = ({
  destinatarioId,
  grupoId,
  usuarios,
  isGroup = false,
  onSendMessage,
  onEnviar
}) => {
  const { enviarMensagem } = useChat();
  const [mensagem, setMensagem] = useState('');
  const [isEnviando, setIsEnviando] = useState(false);
  const [showMencoes, setShowMencoes] = useState(false);
  const [mencoes, setMencoes] = useState<string[]>([]);
  const [arquivos, setArquivos] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleEnviarMensagem = async () => {
    if ((!mensagem.trim() && arquivos.length === 0) || isEnviando) return;

    setIsEnviando(true);
    try {
      if (onSendMessage) {
        await onSendMessage(mensagem, 'texto', undefined, undefined, undefined, mencoes);
      } else if (arquivos.length > 0) {
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

  const handleFileSelect = (files: File[]) => {
    setArquivos(prev => [...prev, ...files]);
  };

  const removerArquivo = (index: number) => {
    setArquivos(prev => prev.filter((_, i) => i !== index));
  };

  const handleAudioRecorded = (audioBlob: Blob) => {
    // TODO: Implementar upload do áudio
    console.log('Áudio gravado:', audioBlob);
  };

  return (
    <div className="p-4 border-t bg-white">
      {/* Selected files display - only show if there are files */}
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
        {/* Action buttons */}
        <div className="flex space-x-1">
          <FileAttachments
            arquivos={[]}
            onFileSelect={handleFileSelect}
            onRemoveFile={() => {}} // Not needed for button-only mode
          />

          <MentionsList
            usuarios={usuarios}
            isGroup={isGroup}
            onMentionSelect={insertarMencao}
            open={showMencoes}
            onOpenChange={setShowMencoes}
          />

          <EmojiPicker onEmojiSelect={insertarEmoji} />

          <AudioRecorder onAudioRecorded={handleAudioRecorded} />
        </div>

        {/* Text field */}
        <Textarea
          ref={textareaRef}
          placeholder="Digite sua mensagem..."
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          onKeyPress={handleKeyPress}
          className="min-h-[40px] max-h-32 resize-none"
          rows={1}
        />

        {/* Send button */}
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
