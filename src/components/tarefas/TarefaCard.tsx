
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tarefa } from '@/types/data';
import { useData } from '@/contexts/DataContext';
import { formatDate } from '@/lib/utils';
import { 
  Clock, CheckCircle, AlertCircle, User, Briefcase, 
  Calendar, MoreVertical, Edit, Play, Check, 
  Trash2, Archive, GripVertical 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TarefaCardProps {
  tarefa: Tarefa;
  onEdit: (tarefa: Tarefa) => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  viewType?: 'list' | 'grid';
}

export const TarefaCard: React.FC<TarefaCardProps> = ({ 
  tarefa, 
  onEdit, 
  onStatusChange, 
  onDelete, 
  onArchive,
  viewType = 'grid' 
}) => {
  const { clientes, cuidadores, kanbanColunas } = useData();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tarefa.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  const cliente = clientes.find(c => c.id === tarefa.cliente_id);
  const cuidador = cuidadores.find(c => c.id === tarefa.cuidador_id);
  const coluna = kanbanColunas.find(c => c.slug === tarefa.status);

  const getStatusConfig = (status: string) => {
    if (coluna) {
      return {
        label: coluna.titulo,
        color: coluna.cor,
        icon: status === 'done' ? CheckCircle : status === 'inProgress' ? AlertCircle : Clock,
      };
    }
    
    switch (status) {
      case 'todo':
        return { label: 'A Fazer', color: 'bg-slate-100 text-slate-700', icon: Clock };
      case 'inProgress':
        return { label: 'Em Progresso', color: 'bg-blue-50 text-blue-700', icon: AlertCircle };
      case 'done':
        return { label: 'Concluída', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700', icon: Clock };
    }
  };

  const statusConfig = getStatusConfig(tarefa.status);
  const StatusIcon = statusConfig.icon;

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "pointer-events-none")}>
      <Card className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-md border-l-4",
        tarefa.status === 'todo' ? "border-l-slate-400" : 
        tarefa.status === 'inProgress' ? "border-l-blue-500" : "border-l-emerald-500",
        viewType === 'list' ? "mb-3" : ""
      )}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                <GripVertical className="h-4 w-4" />
              </div>
              <Badge variant="outline" className={cn("font-medium flex items-center gap-1", statusConfig.color)}>
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(tarefa)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onArchive(tarefa.id)}>
                  <Archive className="h-4 w-4 mr-2 text-amber-500" />
                  Arquivar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(tarefa.id)}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h3 className="font-bold text-gray-900 mb-1 leading-tight group-hover:text-primary transition-colors">
            {tarefa.titulo}
          </h3>
          
          <p className="text-sm text-gray-600 line-clamp-2 mb-4 italic min-h-[40px]">
            {tarefa.descricao || 'Sem descrição detalhada.'}
          </p>

          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px] bg-indigo-50 text-indigo-700">
                  {getInitials(cliente?.nome)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-700 font-medium truncate">
                {cliente?.nome || 'Cliente não definido'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px] bg-teal-50 text-teal-700">
                  {getInitials(cuidador?.nome)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-500 truncate">
                {cuidador?.nome || 'Cuidador não definido'}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-[10px] text-gray-400 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Criado: {formatDate(tarefa.created_at)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
