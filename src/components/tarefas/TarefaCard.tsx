
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
        className="h-[180px] w-full border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 shadow-inner mb-5"
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="group">
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-2xl border-l-[6px] rounded-[1.8rem] mb-5",
        tarefa.status === 'todo' ? "border-l-slate-400" : 
        tarefa.status === 'inProgress' ? "border-l-blue-500" : "border-l-emerald-500"
      )}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors p-1.5 rounded-lg hover:bg-slate-50">
                <GripVertical className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <StatusIcon className="h-3.5 w-3.5" />
                {statusConfig.label}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-md rounded-xl hover:bg-primary hover:text-white">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 min-w-[160px]">
                <DropdownMenuItem onClick={() => onEdit(tarefa)} className="rounded-xl gap-3 py-2.5 font-bold cursor-pointer">
                  <Edit className="h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onArchive(tarefa.id)} className="rounded-xl gap-3 py-2.5 font-bold text-amber-500 cursor-pointer">
                  <Archive className="h-4 w-4" />
                  Arquivar
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-50 my-1" />
                <DropdownMenuItem 
                  onClick={() => onDelete(tarefa.id)}
                  className="rounded-xl gap-3 py-2.5 font-bold text-red-600 focus:text-white focus:bg-red-500 cursor-pointer transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h3 className="text-xl font-[800] text-gray-900 mb-2 leading-tight tracking-tight group-hover:text-primary transition-colors">
            {tarefa.titulo}
          </h3>
          
          <p className="text-sm text-slate-400 font-medium line-clamp-2 mb-6 italic min-h-[40px] leading-relaxed">
            {tarefa.descricao || 'Sem descrição detalhada.'}
          </p>

          <div className="space-y-3 pt-5 border-t border-slate-50">
            <div className="flex flex-wrap gap-2.5">
              {cliente && (
                <div className="flex items-center gap-2 bg-indigo-50/50 pr-3 pl-1.5 py-1.5 rounded-full border border-indigo-100/20">
                  <Avatar className="h-6 w-6 shadow-sm border border-white">
                    <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700 font-black">
                      {getInitials(cliente.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[11px] text-indigo-700 font-black truncate max-w-[90px]">
                    {cliente.nome}
                  </span>
                </div>
              )}
              
              {cuidador && (
                <div className="flex items-center gap-2 bg-teal-50/50 pr-3 pl-1.5 py-1.5 rounded-full border border-teal-100/20">
                  <Avatar className="h-6 w-6 shadow-sm border border-white">
                    <AvatarFallback className="text-[10px] bg-teal-100 text-teal-700 font-black">
                      {getInitials(cuidador.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[11px] text-teal-700 font-black truncate max-w-[90px]">
                    {cuidador.nome}
                  </span>
                </div>
              )}

              {tarefa.responsavel && (
                <div className="flex items-center gap-2 bg-primary/5 pr-3 pl-1.5 py-1.5 rounded-full border border-primary/10">
                  <Avatar className="h-6 w-6 shadow-sm border border-white">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-black">
                      {getInitials(tarefa.responsavel.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[11px] text-primary font-black truncate max-w-[110px]">
                    {tarefa.responsavel.nome}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-50/80 px-4 py-2 rounded-full border border-slate-100/50 shadow-sm">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(tarefa.created_at)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
