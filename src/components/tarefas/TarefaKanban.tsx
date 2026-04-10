
import React, { useState } from 'react';
import { Tarefa, KanbanColuna } from '@/types/data';
import { TarefaCard } from './TarefaCard';
import { Clock, PlayCircle, CheckCircle, Plus, Layout, Settings2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TarefaKanbanProps {
  tarefas: Tarefa[];
  onEdit: (tarefa: Tarefa) => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

export const TarefaKanban: React.FC<TarefaKanbanProps> = ({ 
  tarefas, 
  onEdit, 
  onStatusChange,
  onDelete,
  onArchive
}) => {
  const { kanbanColunas, addKanbanColuna } = useData();
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [activeTarefa, setActiveTarefa] = useState<Tarefa | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;
    
    // Create slug from title
    const slug = newColumnTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

    await addKanbanColuna({
      titulo: newColumnTitle,
      slug,
      cor: 'bg-slate-50',
      ordem: kanbanColunas.length
    });
    
    setNewColumnTitle('');
    setIsAddingColumn(false);
  };

  const onDragStart = (event: any) => {
    const { active } = event;
    const tarefa = tarefas.find(t => t.id === active.id);
    if (tarefa) setActiveTarefa(tarefa);
  };

  const onDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveTarefa(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id; // This will be the column slug

    // If we dropped over a column, update the task status
    const column = kanbanColunas.find(c => c.slug === overId);
    if (column) {
      onStatusChange(activeId, column.slug);
    }
  };

  const getTarefasByStatus = (status: string) => {
    return tarefas.filter(t => t.status === status && !t.arquivada);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-6 h-full min-h-[500px] overflow-x-auto pb-4">
        {kanbanColunas.map(column => {
          const columnTarefas = getTarefasByStatus(column.slug);
          
          return (
            <div 
              key={column.id} 
              className="flex flex-col min-w-[320px] max-w-[320px] rounded-xl border border-gray-100 bg-gray-50/50 p-4"
            >
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white shadow-sm text-gray-500">
                    <Layout className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-gray-700">{column.titulo}</h3>
                </div>
                <Badge className="bg-white text-gray-400 border-gray-200">
                  {columnTarefas.length}
                </Badge>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto">
                <SortableContext 
                  id={column.slug}
                  items={columnTarefas.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="min-h-[100px] flex flex-col gap-4">
                    {columnTarefas.length > 0 ? (
                      columnTarefas.map(tarefa => (
                        <TarefaCard
                          key={tarefa.id}
                          tarefa={tarefa}
                          onEdit={onEdit}
                          onStatusChange={onStatusChange}
                          onDelete={onDelete}
                          onArchive={onArchive}
                          viewType="grid"
                        />
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-white/50 opacity-60">
                        <Plus className="h-8 w-8 text-gray-300 mb-2" />
                        <p className="text-xs text-gray-400 font-medium">Arraste tarefas para cá</p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            </div>
          );
        })}

        {/* Botão para adicionar nova coluna */}
        <div className="min-w-[320px] flex items-start">
          <Dialog open={isAddingColumn} onOpenChange={setIsAddingColumn}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full h-[60px] border-dashed border-2 hover:border-primary hover:bg-primary/5 text-gray-400 hover:text-primary transition-all duration-300 gap-2 font-medium"
              >
                <Plus className="h-5 w-5" />
                Nova Coluna
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Coluna</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Coluna</Label>
                  <Input 
                    id="title" 
                    placeholder="Ex: Em Revisão, Impedido..." 
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingColumn(false)}>Cancelar</Button>
                <Button onClick={handleAddColumn}>Criar Coluna</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.5',
            },
          },
        }),
      }}>
        {activeTarefa ? (
          <TarefaCard
            tarefa={activeTarefa}
            onEdit={() => {}}
            onStatusChange={() => {}}
            onDelete={() => {}}
            onArchive={() => {}}
            viewType="grid"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

// Import component for counting tasks
import { Badge } from '@/components/ui/badge';
