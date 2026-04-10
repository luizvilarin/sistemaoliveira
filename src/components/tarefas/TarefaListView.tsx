
import React from 'react';
import { Tarefa } from '@/types/data';
import { TarefaCard } from './TarefaCard';

interface TarefaListViewProps {
  tarefas: Tarefa[];
  onEdit: (tarefa: Tarefa) => void;
  onStatusChange: (id: string, status: 'todo' | 'inProgress' | 'done') => void;
}

export const TarefaListView: React.FC<TarefaListViewProps> = ({ tarefas, onEdit, onStatusChange }) => {
  if (tarefas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
        <p className="text-gray-500 font-medium">Nenhuma tarefa encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tarefas.map(tarefa => (
        <TarefaCard
          key={tarefa.id}
          tarefa={tarefa}
          onEdit={onEdit}
          onStatusChange={onStatusChange}
          viewType="list"
        />
      ))}
    </div>
  );
};
