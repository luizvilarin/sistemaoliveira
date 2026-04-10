
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  LayoutGrid, 
  List, 
  Search, 
  Filter, 
  MoreHorizontal,
  ArrowUpDown,
  ListTodo,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import TarefaForm from '@/components/tarefas/TarefaForm';
import { TarefaKanban } from '@/components/tarefas/TarefaKanban';
import { TarefaListView } from '@/components/tarefas/TarefaListView';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const TarefasPage = () => {
  const { tarefas, updateTarefa, isLoading } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTarefa, setEditingTarefa] = useState(null);
  const [view, setView] = useState<'board' | 'list'>('board');
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (tarefa: any) => {
    setEditingTarefa(tarefa);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTarefa(null);
  };

  const handleStatusChange = (tarefaId: string, newStatus: 'todo' | 'inProgress' | 'done') => {
    updateTarefa(tarefaId, { status: newStatus });
  };

  const filteredTarefas = tarefas.filter(t => 
    t.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = {
    total: tarefas.length,
    todo: tarefas.filter(t => t.status === 'todo').length,
    inProgress: tarefas.filter(t => t.status === 'inProgress').length,
    done: tarefas.filter(t => t.status === 'done').length,
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-semibold mb-1">
            <ListTodo className="h-5 w-5" />
            <span>Gestão de Operações</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Tarefas</h1>
          <p className="text-gray-500 max-w-md">
            Acompanhe o progresso das atividades diárias e gerencie a equipe de cuidadores.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Buscar tarefas..." 
              className="pl-9 w-[260px] bg-white border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="shadow-lg shadow-primary/20 gap-2">
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      <Separator className="bg-gray-100" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: ListTodo, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'A Fazer', value: stats.todo, icon: Clock, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: 'Em Progresso', value: stats.inProgress, icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Concluídas', value: stats.done, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all group">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-gray-900 leading-none mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
          <Tabs value={view} onValueChange={(v: any) => setView(v)} className="w-auto">
            <TabsList className="bg-gray-100/50 p-1">
              <TabsTrigger value="board" className="gap-2 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <LayoutGrid className="h-4 w-4" />
                Quadro
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <List className="h-4 w-4" />
                Lista
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2 mr-2">
            <Button variant="ghost" size="sm" className="text-gray-500 gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 gap-2">
              <ArrowUpDown className="h-4 w-4" />
              Ordenar
            </Button>
          </div>
        </div>

        <div className="min-h-[600px]">
          {view === 'board' ? (
            <TarefaKanban 
              tarefas={filteredTarefas} 
              onEdit={handleEdit} 
              onStatusChange={handleStatusChange} 
            />
          ) : (
            <TarefaListView 
              tarefas={filteredTarefas} 
              onEdit={handleEdit} 
              onStatusChange={handleStatusChange} 
            />
          )}
        </div>
      </div>

      <TarefaForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        tarefaToEdit={editingTarefa}
      />
    </div>
  );
};

// Import custom dynamic styles if needed or use Tailwind classes as I did
import { cn } from '@/lib/utils';

export default TarefasPage;
