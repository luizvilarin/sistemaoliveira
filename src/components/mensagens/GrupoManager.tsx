
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Users } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { UserProfile } from '@/types/chat';

interface GrupoManagerProps {
  usuarios: UserProfile[];
}

const GrupoManager: React.FC<GrupoManagerProps> = ({ usuarios }) => {
  const { criarGrupo } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [nomeGrupo, setNomeGrupo] = useState('');
  const [descricaoGrupo, setDescricaoGrupo] = useState('');
  const [membrosSelecionados, setMembrosSelecionados] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleToggleMembro = (userId: string) => {
    setMembrosSelecionados(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCriarGrupo = async () => {
    if (!nomeGrupo.trim()) return;

    setIsCreating(true);
    try {
      await criarGrupo(nomeGrupo, descricaoGrupo, membrosSelecionados);
      setNomeGrupo('');
      setDescricaoGrupo('');
      setMembrosSelecionados([]);
      setIsOpen(false);
    } finally {
      setIsCreating(false);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mb-4">
          <Plus className="h-4 w-4 mr-2" />
          Criar Grupo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Grupo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome do Grupo</label>
            <Input
              value={nomeGrupo}
              onChange={(e) => setNomeGrupo(e.target.value)}
              placeholder="Digite o nome do grupo"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Descrição (opcional)</label>
            <Textarea
              value={descricaoGrupo}
              onChange={(e) => setDescricaoGrupo(e.target.value)}
              placeholder="Digite uma descrição para o grupo"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              <Users className="h-4 w-4 inline mr-1" />
              Selecionar Membros ({membrosSelecionados.length})
            </label>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {usuarios.map((usuario) => (
                <div key={usuario.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                  <Checkbox
                    checked={membrosSelecionados.includes(usuario.id)}
                    onCheckedChange={() => handleToggleMembro(usuario.id)}
                  />
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={usuario.avatar_url} alt={usuario.nome} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(usuario.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{usuario.nome}</p>
                    <p className="text-xs text-gray-500">{usuario.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCriarGrupo} 
              disabled={!nomeGrupo.trim() || isCreating}
            >
              {isCreating ? 'Criando...' : 'Criar Grupo'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GrupoManager;
