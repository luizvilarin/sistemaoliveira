
import React from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, X } from 'lucide-react';

interface FileAttachmentsProps {
  arquivos: File[];
  onFileSelect: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
}

const FileAttachments: React.FC<FileAttachmentsProps> = ({
  arquivos,
  onFileSelect,
  onRemoveFile
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onFileSelect(files);
  };

  return (
    <>
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
      
      {/* Selected files display */}
      {arquivos.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {arquivos.map((arquivo, index) => (
            <div key={index} className="flex items-center bg-gray-100 px-2 py-1 rounded text-sm">
              <span className="truncate max-w-32">{arquivo.name}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => onRemoveFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default FileAttachments;
