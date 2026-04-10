
import React from 'react';
import { Tarefa } from '@/types/data';
import { TarefaCard } from './TarefaCard';
import { Clock, PlayCircle, CheckCircle } from 'lucide-react';

interface TarefaKanbanProps {
  tarefas: Tarefa[];
  onEdit: (tarefa: Tarefa) => void;
  onStatusChange: (id: string, status: 'todo' | 'inProgress' | 'done') => void;
}

export const TarefaKanban: React.FC<TarefaKanbanProps> = ({ tarefas, onEdit, onStatusChange }) => {
  const columns = [
    { id: 'todo', title: 'A Fazer', icon: Clock, color: 'text-slate-500', bg: 'bg-slate-50' },
    { id: 'inProgress', title: 'Em Progresso', icon: PlayCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'done', title: 'Concluído', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  const getTarefasByStatus = (status: string) => {
    return tarefas.filter(t => t.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[500px]">
      {columns.map(column => {
        const columnTarefas = getTarefasByStatus(column.id);
        const Icon = column.icon;

        return (
          <div key={column.id} className="flex flex-col rounded-xl border border-gray-100 bg-gray-50/50 p-4">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className={cn("p-1.5 rounded-lg bg-white shadow-sm", column.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-gray-700">{column.title}</h3>
              </div>
              <span className="text-xs font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full shadow-sm">
                {columnTarefas.length}
              </span>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto">
              {columnTarefas.length > 0 ? (
                columnTarefas.map(tarefa => (
                  <TarefaCard
                    key={tarefa.id}
                    tarefa={tarefa}
                    onEdit={onEdit}
                    onStatusChange={onStatusChange}
                    viewType="grid"
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-white/50 opacity-60">
                  <Icon className="h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400 font-medium">Nenhuma tarefa</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Adicionando helper cn caso não esteja importado de forma global ou para facilitar
import { cn } from '@/lib/utils';
