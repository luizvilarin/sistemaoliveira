
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, X } from 'lucide-react';
import { UserProfile } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import EmojiPicker from './EmojiPicker';
import MentionsList from './MentionsList';
import FileAttachments from './FileAttachments';
import AudioRecorder from './AudioRecorder';

interface InputMensagemAvancadoProps {
  destinatarioId?: string;
  grupoId?: string;
  usuarios: UserProfile[];
  isGroup?: boolean;
  onSendMessage: (
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
  const { toast } = useToast();
  const [mensagem, setMensagem] = useState('');
  const [isEnviando, setIsEnviando] = useState(false);
  const [showMencoes, setShowMencoes] = useState(false);
  const [mencoes, setMencoes] = useState<string[]>([]);
  const [arquivos, setArquivos] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleEnviarMensagem = async () => {
    console.log('Tentando enviar mensagem:', { mensagem: mensagem.trim(), arquivos: arquivos.length });

    if ((!mensagem.trim() && arquivos.length === 0) || isEnviando) {
      console.log('Mensagem vazia ou já enviando');
      return;
    }

    if (!destinatarioId && !grupoId) {
      console.log('Sem destinatário ou grupo');
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Selecione um destinatário ou grupo para enviar a mensagem.'
      });
      return;
    }

    setIsEnviando(true);
    
    try {
      console.log('Enviando mensagem via onSendMessage...');
      await onSendMessage(mensagem.trim(), 'texto', undefined, undefined, undefined, mencoes);
      
      console.log('Mensagem enviada com sucesso, limpando campos...');
      
      // Limpar campos após envio bem-sucedido
      setMensagem('');
      setMencoes([]);
      setArquivos([]);
      onEnviar?.();
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar',
        description: 'Não foi possível enviar a mensagem. Tente novamente.'
      });
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

  const handleAudioRecorded = async (audioBlob: Blob, duration: number) => {
    if (!destinatarioId && !grupoId) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Selecione um destinatário ou grupo para enviar o áudio.'
      });
      return;
    }

    setIsEnviando(true);
    
    try {
      // Simular upload do áudio (aqui você implementaria o upload real)
      const audioUrl = URL.createObjectURL(audioBlob);
      const audioNome = `audio_${Date.now()}.webm`;
      
      await onSendMessage('🎤 Mensagem de áudio', 'audio', audioUrl, audioNome, duration, []);
      
    } catch (error) {
      console.error('Erro ao enviar áudio:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar áudio',
        description: 'Não foi possível enviar o áudio. Tente novamente.'
      });
    } finally {
      setIsEnviando(false);
    }
  };

  const canSend = (mensagem.trim() || arquivos.length > 0) && !isEnviando;

  return (
    <div className="border-t bg-white">
      {/* Selected files display */}
      {arquivos.length > 0 && (
        <div className="p-3 border-b bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {arquivos.map((arquivo, index) => (
              <div key={index} className="flex items-center bg-white border px-3 py-2 rounded-lg text-sm">
                <span className="truncate max-w-32 mr-2">{arquivo.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0 hover:bg-red-100"
                  onClick={() => removerArquivo(index)}
                >
                  <X className="h-3 w-3 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-end space-x-2">
          {/* Action buttons */}
          <div className="flex items-center space-x-1">
            <FileAttachments
              arquivos={arquivos}
              onFileSelect={handleFileSelect}
              onRemoveFile={removerArquivo}
            />

            {isGroup && (
              <MentionsList
                usuarios={usuarios}
                isGroup={isGroup}
                onMentionSelect={insertarMencao}
                open={showMencoes}
                onOpenChange={setShowMencoes}
              />
            )}

            <EmojiPicker onEmojiSelect={insertarEmoji} />

            <AudioRecorder onAudioRecorded={handleAudioRecorded} />
          </div>

          {/* Text field */}
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              placeholder="Digite sua mensagem..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[40px] max-h-32 resize-none border-gray-300 focus:border-primary"
              rows={1}
              disabled={isEnviando}
            />
          </div>

          {/* Send button */}
          <Button 
            onClick={handleEnviarMensagem}
            disabled={!canSend}
            className="shrink-0 px-4"
            size="default"
          >
            {isEnviando ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InputMensagemAvancado;
