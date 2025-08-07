import React, { useState, useRef } from 'react';
import { Upload, File, X, Image, FileText, Video, Music } from 'lucide-react';
import { Button } from './button';
import { Progress } from './progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  bucket: 'documents' | 'profile-photos' | 'attachments';
  folder?: string;
  maxFileSize?: number; // em MB
  acceptedTypes?: string[];
  multiple?: boolean;
  onUploadComplete?: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

interface UploadingFile {
  file: File;
  progress: number;
  error?: string;
  url?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  bucket,
  folder,
  maxFileSize = 10,
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'],
  multiple = false,
  onUploadComplete,
  onUploadError,
  className,
  disabled = false
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (fileType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (fileType.startsWith('audio/')) return <Music className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const validateFile = (file: File): string | null => {
    // Verificar tamanho
    if (file.size > maxFileSize * 1024 * 1024) {
      return `Arquivo muito grande. Máximo ${maxFileSize}MB`;
    }

    // Verificar tipo
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      if (type.includes('*')) {
        const mimeType = type.split('/')[0];
        return file.type.startsWith(mimeType);
      }
      return file.type === type;
    });

    if (!isValidType) {
      return 'Tipo de arquivo não permitido';
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<string> => {
    if (!user) throw new Error('Usuário não autenticado');

    const fileError = validateFile(file);
    if (fileError) throw new Error(fileError);

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folder ? folder + '/' : ''}${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Obter URL pública para buckets públicos
    if (bucket === 'profile-photos') {
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
      return publicUrl;
    } else {
      // Para buckets privados, retornar o caminho
      return data.path;
    }
  };

  const handleFiles = async (files: FileList | File[]) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para fazer upload",
        variant: "destructive"
      });
      return;
    }

    const fileArray = Array.from(files);
    
    if (!multiple && fileArray.length > 1) {
      toast({
        title: "Erro",
        description: "Apenas um arquivo é permitido",
        variant: "destructive"
      });
      return;
    }

    // Inicializar estado dos arquivos
    const newUploadingFiles: UploadingFile[] = fileArray.map(file => ({
      file,
      progress: 0
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      
      try {
        // Simular progresso
        const updateProgress = (progress: number) => {
          setUploadingFiles(prev => 
            prev.map((item, index) => 
              index === prev.length - fileArray.length + i
                ? { ...item, progress }
                : item
            )
          );
        };

        updateProgress(25);
        
        const url = await uploadFile(file);
        
        updateProgress(100);

        // Atualizar com sucesso
        setUploadingFiles(prev => 
          prev.map((item, index) => 
            index === prev.length - fileArray.length + i
              ? { ...item, url }
              : item
          )
        );

        uploadedUrls.push(url);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro no upload';
        
        setUploadingFiles(prev => 
          prev.map((item, index) => 
            index === prev.length - fileArray.length + i
              ? { ...item, error: errorMessage }
              : item
          )
        );

        onUploadError?.(errorMessage);
        
        toast({
          title: "Erro no upload",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }

    if (uploadedUrls.length > 0) {
      onUploadComplete?.(uploadedUrls);
    }
  };

  const removeFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Área de upload */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary hover:bg-primary/5"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm font-medium mb-2">
          {multiple ? "Arraste arquivos aqui ou clique para selecionar" : "Arraste um arquivo aqui ou clique para selecionar"}
        </p>
        <p className="text-xs text-muted-foreground">
          Máximo {maxFileSize}MB • {acceptedTypes.join(', ')}
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple={multiple}
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        disabled={disabled}
      />

      {/* Lista de arquivos em upload */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
              {getFileIcon(item.file.type)}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(item.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                
                {item.progress < 100 && !item.error && (
                  <Progress value={item.progress} className="h-1 mt-1" />
                )}
                
                {item.error && (
                  <p className="text-xs text-destructive mt-1">{item.error}</p>
                )}
                
                {item.url && (
                  <p className="text-xs text-green-600 mt-1">Upload concluído!</p>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { FileUpload };