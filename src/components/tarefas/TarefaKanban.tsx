import React, { useState } from 'react';
import { Tarefa } from '@/types/data';
import { TarefaCard } from './TarefaCard';
import { 
  Plus, 
  Layout, 
  Trash2 as TrashIcon,
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface TarefaKanbanProps {
  tarefas: Tarefa[];
  onEdit: (tarefa: Tarefa) => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onAddInColumn?: (status: string) => void;
}

export const TarefaKanban: React.FC<TarefaKanbanProps> = ({ 
  tarefas, 
  onEdit, 
  onStatusChange,
  onDelete,
  onArchive,
  onAddInColumn
}) => {
  const { kanbanColunas, addKanbanColuna, deleteKanbanColuna } = useData();
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [activeTarefa, setActiveTarefa] = useState<Tarefa | null>(null);
  const [activeTab, setActiveTab] = useState<string>(kanbanColunas[0]?.slug || 'todo');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findContainer = (id: string) => {
    if (kanbanColunas.some(c => c.slug === id)) return id;
    const tarefa = tarefas.find(t => t.id === id);
    return tarefa ? tarefa.status : null;
  };

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;
    
    const slug = newColumnTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

    await addKanbanColuna({
      titulo: newColumnTitle,
      slug,
      cor: 'bg-white',
      ordem: kanbanColunas.length
    });
    
    setNewColumnTitle('');
    setIsAddingColumn(false);
  };

  const handleDeleteColumn = async (id: string, slug: string) => {
    const hasTasks = tarefas.some(t => t.status === slug);
    if (hasTasks) {
      alert("Não é possível excluir uma coluna que possui tarefas. Mova as tarefas primeiro.");
      return;
    }

    if (window.confirm("Deseja excluir esta coluna?")) {
      await deleteKanbanColuna(id);
    }
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
    const overId = over.id;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (activeContainer && overContainer && activeContainer !== overContainer) {
      onStatusChange(activeId, overContainer);
    }
  };

  const getTarefasByStatus = (status: string) => {
    return tarefas.filter(t => t.status === status && !t.arquivada);
  };

  const renderColumn = (column: any) => {
    const columnTarefas = getTarefasByStatus(column.slug);
    
    return (
      <div 
        key={column.id} 
        className={cn(
          "flex flex-col h-full bg-slate-50/40 rounded-2xl border border-slate-100/50 p-4 transition-all duration-300 hover:bg-slate-100/30 border-t-4",
          column.slug === 'todo' ? "border-t-slate-400" :
          column.slug === 'inProgress' ? "border-t-blue-500" :
          column.slug === 'done' ? "border-t-emerald-500" : "border-t-primary"
        )}
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 text-sm tracking-tight">{column.titulo}</h3>
            <span className="bg-slate-200/50 text-slate-600 text-[10.5px] font-bold px-2 py-0.5 rounded-full">
              {columnTarefas.length}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            onClick={() => handleDeleteColumn(column.id, column.slug)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>

        {onAddInColumn && (
          <Button 
            variant="outline" 
            size="sm"
            className="w-full py-1.5 h-8 border-dashed border-2 rounded-xl text-slate-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all gap-1.5 text-xs font-bold mb-3 shadow-none bg-white"
            onClick={() => onAddInColumn(column.slug)}
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar Tarefa
          </Button>
        )}

        <div className="flex-1 space-y-3 px-1 min-h-[300px]">
          <SortableContext 
            id={column.slug}
            items={columnTarefas.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3">
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
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-white/40 group hover:border-primary/30 transition-colors">
                  <div className="p-2.5 bg-white rounded-lg shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <Plus className="h-5 w-5 text-slate-200 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-xs text-slate-400 font-bold tracking-tight">Vazio por aqui</p>
                </div>
              )}
            </div>
          </SortableContext>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        {/* Desktop View: Horizontal Flex Flow with responsive stretching */}
        <div className="hidden lg:flex overflow-x-auto pb-8 gap-8 items-stretch no-scrollbar min-h-[600px] px-2 w-full">
          {kanbanColunas.map(column => (
            <div key={column.id} className="flex-1 min-w-[280px] max-w-[360px] h-full">
              {renderColumn(column)}
            </div>
          ))}
          
          <div className="flex-1 min-w-[240px] max-w-[280px]">
            <Dialog open={isAddingColumn} onOpenChange={setIsAddingColumn}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full h-24 border-dashed border-2 rounded-2xl bg-white/50 border-slate-200 hover:border-primary hover:bg-primary/5 text-slate-400 hover:text-primary transition-all duration-300 gap-2 font-bold text-sm shadow-none"
                >
                  <Plus className="h-5 w-5" />
                  Nova Coluna
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2rem] p-8 border-none shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black tracking-tight text-gray-900">Nova Coluna</DialogTitle>
                </DialogHeader>
                <div className="py-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="font-bold text-gray-700 text-sm ml-1">Nome da Coluna</Label>
                    <Input 
                      id="title" 
                      placeholder="Ex: Em Revisão, Validando..." 
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      className="rounded-xl h-12 bg-slate-50 border-slate-100 focus:ring-2 focus:ring-primary/15 focus:bg-white text-sm px-4 font-semibold transition-all"
                    />
                  </div>
                </div>
                <DialogFooter className="gap-3 sm:justify-end">
                  <Button variant="ghost" onClick={() => setIsAddingColumn(false)} className="rounded-xl font-bold h-10 px-6 text-sm">Cancelar</Button>
                  <Button onClick={handleAddColumn} className="rounded-xl px-8 h-10 font-bold text-sm bg-primary hover:scale-105 active:scale-95 transition-all">Criar Coluna</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Mobile/Tablet Tabbed View */}
        <div className="lg:hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="relative mb-8">
              <TabsList className="w-full bg-slate-100/40 p-1.5 rounded-3xl h-16 overflow-x-auto justify-start no-scrollbar border border-slate-100">
                {kanbanColunas.map(column => (
                  <TabsTrigger 
                    key={column.id} 
                    value={column.slug}
                    className="flex-shrink-0 gap-3 px-8 rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-primary font-black h-full transition-all"
                  >
                    {column.titulo}
                    <Badge variant="secondary" className="bg-slate-200/50 text-slate-600 font-bold text-[10px] ml-1 px-2.5 py-0.5 rounded-full">
                      {getTarefasByStatus(column.slug).length}
                    </Badge>
                  </TabsTrigger>
                ))}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-full px-8 rounded-2xl text-primary/40 hover:text-primary transition-colors hover:bg-white/50"
                  onClick={() => setIsAddingColumn(true)}
                >
                  <Plus className="h-7 w-7" />
                </Button>
              </TabsList>
            </div>

            {kanbanColunas.map(column => (
              <TabsContent key={column.id} value={column.slug} className="mt-0 focus-visible:outline-none">
                <div className="px-1">
                  {renderColumn(column)}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.4',
              },
            },
          }),
        }}>
          {activeTarefa ? (
            <div className="rotate-[3deg] scale-[1.05] transition-transform duration-200 cursor-grabbing drop-shadow-[0_25px_25px_rgba(0,0,0,0.15)]">
              <TarefaCard
                tarefa={activeTarefa}
                onEdit={() => {}}
                onStatusChange={() => {}}
                onDelete={() => {}}
                onArchive={() => {}}
                viewType="grid"
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
