import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UseFileUploadOptions {
  bucket: 'documents' | 'profile-photos' | 'attachments';
  folder?: string;
  maxFileSize?: number; // em MB
  onUploadComplete?: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
}

interface UploadResult {
  url: string;
  path: string;
  name: string;
}

export const useFileUpload = (options: UseFileUploadOptions) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadFile = async (file: File): Promise<UploadResult> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Validar tamanho do arquivo
    const maxSize = (options.maxFileSize || 10) * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`Arquivo muito grande. Máximo ${options.maxFileSize || 10}MB`);
    }

    // Gerar nome único
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${options.folder ? options.folder + '/' : ''}${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    // Upload do arquivo
    const { data, error } = await supabase.storage
      .from(options.bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Obter URL
    let url: string;
    if (options.bucket === 'profile-photos') {
      // Bucket público
      const { data: { publicUrl } } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(data.path);
      url = publicUrl;
    } else {
      // Bucket privado - retornar path para criar signed URL depois
      url = data.path;
    }

    return {
      url,
      path: data.path,
      name: file.name
    };
  };

  const uploadFiles = async (files: File[]): Promise<UploadResult[]> => {
    setIsUploading(true);
    setUploadProgress({});

    try {
      const results: UploadResult[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = `${file.name}-${i}`;
        
        try {
          // Simular progresso
          setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
          
          const result = await uploadFile(file);
          
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
          results.push(result);
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro no upload';
          options.onUploadError?.(errorMessage);
          
          toast({
            title: 'Erro no upload',
            description: `${file.name}: ${errorMessage}`,
            variant: 'destructive'
          });
        }
      }

      if (results.length > 0) {
        const urls = results.map(r => r.url);
        options.onUploadComplete?.(urls);
        
        toast({
          title: 'Upload concluído',
          description: `${results.length} arquivo(s) enviado(s) com sucesso`
        });
      }

      return results;

    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const getSignedUrl = async (path: string, expiresIn = 3600): Promise<string> => {
    const { data, error } = await supabase.storage
      .from(options.bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw error;
    }

    return data.signedUrl;
  };

  const deleteFile = async (path: string): Promise<void> => {
    const { error } = await supabase.storage
      .from(options.bucket)
      .remove([path]);

    if (error) {
      throw error;
    }
  };

  return {
    uploadFile,
    uploadFiles,
    getSignedUrl,
    deleteFile,
    isUploading,
    uploadProgress
  };
};