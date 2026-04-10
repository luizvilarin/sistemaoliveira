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
}

export const TarefaKanban: React.FC<TarefaKanbanProps> = ({ 
  tarefas, 
  onEdit, 
  onStatusChange,
  onDelete,
  onArchive
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
        className="flex flex-col h-full bg-slate-50/50 rounded-[2.5rem] border border-slate-100/50 p-5 transition-all duration-500 hover:bg-slate-100/40"
      >
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-3">
            <div className={cn("p-2.5 rounded-2xl shadow-sm text-gray-700 bg-white border border-slate-100", column.cor)}>
              <Layout className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 tracking-tight">{column.titulo}</h3>
              <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                {columnTarefas.length} {columnTarefas.length === 1 ? 'Tarefa' : 'Tarefas'}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
            onClick={() => handleDeleteColumn(column.id, column.slug)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-1 max-h-[calc(100vh-420px)] min-h-[300px] no-scrollbar">
          <SortableContext 
            id={column.slug}
            items={columnTarefas.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-5">
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
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-[3rem] bg-white/40 group hover:border-primary/30 transition-colors">
                  <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="h-6 w-6 text-slate-200 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm text-slate-400 font-black tracking-tight">Vazio por aqui</p>
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
        {/* Desktop View: Responsive Grid instead of pure horizontal scroll */}
        <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-start">
          {kanbanColunas.map(column => renderColumn(column))}
          
          <div className="mt-0">
            <Dialog open={isAddingColumn} onOpenChange={setIsAddingColumn}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full h-[120px] border-dashed border-2 rounded-[3rem] hover:border-primary hover:bg-primary/5 text-gray-400 hover:text-primary transition-all duration-500 gap-3 font-black text-lg shadow-sm"
                >
                  <Plus className="h-7 w-7" />
                  Nova Coluna
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[3rem] p-8">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black tracking-tighter">Criar Coluna</DialogTitle>
                </DialogHeader>
                <div className="py-8 space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="font-extrabold text-gray-700 text-lg ml-1">Título da Coluna</Label>
                    <Input 
                      id="title" 
                      placeholder="Ex: Em Revisão, Impedido..." 
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      className="rounded-2xl h-14 bg-gray-50 border-gray-100 focus:bg-white text-lg px-6 font-medium transition-all"
                    />
                  </div>
                </div>
                <DialogFooter className="gap-3 sm:justify-center">
                  <Button variant="ghost" onClick={() => setIsAddingColumn(false)} className="rounded-2xl font-black h-12 px-8">Cancelar</Button>
                  <Button onClick={handleAddColumn} className="rounded-2xl px-12 h-12 font-black shadow-xl shadow-primary/20 bg-primary hover:scale-105 transition-transform">Criar Coluna</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Mobile/Tablet Tabbed View for Better Responsiveness */}
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
                    <Badge variant="secondary" className="bg-slate-200/50 text-slate-600 text-[10px] ml-1 px-2">
                      {getTarefasByStatus(column.slug).length}
                    </Badge>
                  </TabsTrigger>
                ))}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-full px-6 rounded-2xl text-primary/40 hover:text-primary transition-colors"
                  onClick={() => setIsAddingColumn(true)}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </TabsList>
            </div>

            {kanbanColunas.map(column => (
              <TabsContent key={column.id} value={column.slug} className="mt-0 focus-visible:outline-none">
                {renderColumn(column)}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.6',
              },
            },
          }),
        }}>
          {activeTarefa ? (
            <div className="rotate-2 scale-105 transition-transform duration-200">
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
