
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tarefa } from '@/types/data';
import { useData } from '@/contexts/DataContext';
import { formatDate } from '@/lib/utils';
import { Clock, CheckCircle, AlertCircle, User, Briefcase, Calendar, MoreVertical, Edit, Play, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface TarefaCardProps {
  tarefa: Tarefa;
  onEdit: (tarefa: Tarefa) => void;
  onStatusChange: (id: string, status: 'todo' | 'inProgress' | 'done') => void;
  viewType?: 'list' | 'grid';
}

export const TarefaCard: React.FC<TarefaCardProps> = ({ tarefa, onEdit, onStatusChange, viewType = 'grid' }) => {
  const { clientes, cuidadores } = useData();

  const cliente = clientes.find(c => c.id === tarefa.cliente_id);
  const cuidador = cuidadores.find(c => c.id === tarefa.cuidador_id);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'todo':
        return { 
          label: 'A Fazer', 
          color: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: Clock,
          accent: 'bg-slate-500'
        };
      case 'inProgress':
        return { 
          label: 'Em Progresso', 
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: AlertCircle,
          accent: 'bg-blue-500'
        };
      case 'done':
        return { 
          label: 'Concluída', 
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: CheckCircle,
          accent: 'bg-emerald-500'
        };
      default:
        return { 
          label: status, 
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: Clock,
          accent: 'bg-gray-500'
        };
    }
  };

  const statusConfig = getStatusConfig(tarefa.status);
  const StatusIcon = statusConfig.icon;

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:shadow-md border-l-4",
      tarefa.status === 'todo' ? "border-l-slate-400" : 
      tarefa.status === 'inProgress' ? "border-l-blue-500" : "border-l-emerald-500",
      viewType === 'list' ? "mb-3" : ""
    )}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <Badge variant="outline" className={cn("font-medium flex items-center gap-1", statusConfig.color)}>
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
          
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
              {tarefa.status === 'todo' && (
                <DropdownMenuItem onClick={() => onStatusChange(tarefa.id, 'inProgress')}>
                  <Play className="h-4 w-4 mr-2 text-blue-500" />
                  Iniciar
                </DropdownMenuItem>
              )}
              {tarefa.status !== 'done' && (
                <DropdownMenuItem onClick={() => onStatusChange(tarefa.id, 'done')}>
                  <Check className="h-4 w-4 mr-2 text-emerald-500" />
                  Concluir
                </DropdownMenuItem>
              )}
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
          {tarefa.status === 'todo' && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 text-[10px] px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => onStatusChange(tarefa.id, 'inProgress')}
            >
              Iniciar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
