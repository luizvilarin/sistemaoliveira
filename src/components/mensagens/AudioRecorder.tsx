
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AudioRecorderProps {
  onAudioRecorded: (audioBlob: Blob, duration: number) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioRecorded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const { toast } = useToast();

  const iniciarGravacao = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        onAudioRecorded(audioBlob, duration);
        
        // Parar todas as tracks do stream
        stream.getTracks().forEach(track => track.stop());
        
        // Limpar timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        setRecordingTime(0);
      };

      mediaRecorder.start(1000); // Capturar dados a cada segundo
      setIsRecording(true);
      
      // Iniciar timer para mostrar tempo de gravação
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: 'Gravação iniciada',
        description: 'Fale agora e clique novamente para parar'
      });

    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      toast({
        variant: 'destructive',
        title: 'Erro na gravação',
        description: 'Não foi possível acessar o microfone. Verifique as permissões.'
      });
    }
  };

  const pararGravacao = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: 'Gravação finalizada',
        description: `Áudio de ${recordingTime} segundos será enviado`
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        size="sm"
        variant={isRecording ? "destructive" : "ghost"}
        onClick={isRecording ? pararGravacao : iniciarGravacao}
        className={isRecording ? "animate-pulse" : ""}
      >
        {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
      
      {isRecording && (
        <span className="text-sm text-red-600 font-mono">
          {formatTime(recordingTime)}
        </span>
      )}
    </div>
  );
};

export default AudioRecorder;
