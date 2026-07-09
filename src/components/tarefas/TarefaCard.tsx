
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tarefa } from '@/types/data';
import { useData } from '@/contexts/DataContext';
import { formatDate } from '@/lib/utils';
import { 
  Clock, CheckCircle, AlertCircle, User, Briefcase, 
  Calendar, MoreVertical, Edit, Play, Check, 
  Trash2 as TrashIcon, Archive, GripVertical 
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
  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className={cn(
          "w-full border-2 border-dashed border-slate-200 bg-slate-50/50 shadow-inner rounded-xl",
          viewType === 'list' ? "h-14 mb-2.5" : "h-28 mb-3"
        )}
      />
    );
  }

  if (viewType === 'list') {
    return (
      <div ref={setNodeRef} style={style} className="group">
        <div className={cn(
          "flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white border border-slate-100/80 hover:border-slate-200 hover:shadow-sm rounded-xl transition-all duration-200 mb-2 gap-3",
          tarefa.status === 'todo' ? "border-l-4 border-l-slate-400" : 
          tarefa.status === 'inProgress' ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-emerald-500"
        )}>
          {/* Drag Handle & Title */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors p-1 rounded">
              <GripVertical className="h-4 w-4" />
            </div>
            
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-primary transition-colors">
                {tarefa.titulo}
              </h4>
              {tarefa.descricao && (
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {tarefa.descricao}
                </p>
              )}
            </div>
          </div>

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            {cliente && (
              <span className="inline-flex items-center gap-1 bg-indigo-50/50 text-[10px] text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-100/10">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Cliente: {cliente.nome.split(' ')[0]}
              </span>
            )}
            
            {cuidador && (
              <span className="inline-flex items-center gap-1 bg-teal-50/50 text-[10px] text-teal-700 font-bold px-2 py-0.5 rounded-full border border-teal-100/10">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                Cuidador: {cuidador.nome.split(' ')[0]}
              </span>
            )}

            {tarefa.responsavel && (
              <span className="inline-flex items-center gap-1 bg-primary/5 text-[10px] text-primary font-bold px-2 py-0.5 rounded-full border border-primary/10">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Resp: {tarefa.responsavel.nome.split(' ')[0]}
              </span>
            )}
          </div>

          {/* Date & Actions */}
          <div className="flex items-center justify-between sm:justify-start gap-4 flex-shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-50">
            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
              <Calendar className="h-3 w-3" />
              {formatDate(tarefa.created_at)}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-none shadow-xl p-1.5 min-w-[140px]">
                <DropdownMenuItem onClick={() => onEdit(tarefa)} className="rounded-lg gap-2 py-2 text-xs font-bold cursor-pointer">
                  <Edit className="h-3.5 w-3.5" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onArchive(tarefa.id)} className="rounded-lg gap-2 py-2 text-xs font-bold text-amber-500 cursor-pointer">
                  <Archive className="h-3.5 w-3.5" />
                  Arquivar
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-50 my-1" />
                <DropdownMenuItem 
                  onClick={() => onDelete(tarefa.id)}
                  className="rounded-lg gap-2 py-2 text-xs font-bold text-red-600 focus:text-white focus:bg-red-500 cursor-pointer"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="group">
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 rounded-xl mb-3 border border-slate-100/60 bg-white",
        tarefa.status === 'todo' ? "border-l-slate-400" : 
        tarefa.status === 'inProgress' ? "border-l-blue-500" : "border-l-emerald-500"
      )}>
        <CardContent className="p-3.5">
          <div className="flex justify-between items-start mb-2.5">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors p-1 rounded hover:bg-slate-50">
              <GripVertical className="h-4 w-4" />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/90 backdrop-blur-sm border border-slate-100 shadow-sm rounded-lg hover:bg-slate-50">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-none shadow-xl p-1.5 min-w-[140px]">
                <DropdownMenuItem onClick={() => onEdit(tarefa)} className="rounded-lg gap-2 py-2 text-xs font-bold cursor-pointer">
                  <Edit className="h-3.5 w-3.5" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onArchive(tarefa.id)} className="rounded-lg gap-2 py-2 text-xs font-bold text-amber-500 cursor-pointer">
                  <Archive className="h-3.5 w-3.5" />
                  Arquivar
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-50 my-1" />
                <DropdownMenuItem 
                  onClick={() => onDelete(tarefa.id)}
                  className="rounded-lg gap-2 py-2 text-xs font-bold text-red-600 focus:text-white focus:bg-red-500 cursor-pointer"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h3 className="text-sm font-bold text-slate-800 mb-1.5 leading-snug tracking-tight group-hover:text-primary transition-colors line-clamp-2">
            {tarefa.titulo}
          </h3>
          
          {tarefa.descricao && (
            <p className="text-xs text-slate-400 font-medium line-clamp-2 mb-3 leading-relaxed">
              {tarefa.descricao}
            </p>
          )}

          <div className="space-y-2 pt-2.5 border-t border-slate-100/80">
            <div className="flex flex-wrap gap-1.5">
              {cliente && (
                <div className="flex items-center gap-1 bg-indigo-50/50 pr-2 pl-1.5 py-0.5 rounded-full border border-indigo-100/10">
                  <Avatar className="h-4.5 w-4.5 shadow-none border-0">
                    <AvatarFallback className="text-[8px] bg-indigo-100 text-indigo-700 font-black">
                      {getInitials(cliente.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[9px] text-indigo-700 font-bold truncate max-w-[80px]">
                    {cliente.nome.split(' ')[0]}
                  </span>
                </div>
              )}
              
              {cuidador && (
                <div className="flex items-center gap-1 bg-teal-50/50 pr-2 pl-1.5 py-0.5 rounded-full border border-teal-100/10">
                  <Avatar className="h-4.5 w-4.5 shadow-none border-0">
                    <AvatarFallback className="text-[8px] bg-teal-100 text-teal-700 font-black">
                      {getInitials(cuidador.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[9px] text-teal-700 font-bold truncate max-w-[80px]">
                    {cuidador.nome.split(' ')[0]}
                  </span>
                </div>
              )}

              {tarefa.responsavel && (
                <div className="flex items-center gap-1 bg-primary/5 pr-2 pl-1.5 py-0.5 rounded-full border border-primary/10">
                  <Avatar className="h-4.5 w-4.5 shadow-none border-0">
                    <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-black">
                      {getInitials(tarefa.responsavel.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[9px] text-primary font-bold truncate max-w-[80px]">
                    {tarefa.responsavel.nome.split(' ')[0]}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50 px-2.5 py-0.5 rounded-full border border-slate-100/40">
              <Calendar className="h-3 w-3" />
              {formatDate(tarefa.created_at)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
