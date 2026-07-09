import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  LayoutGrid, 
  List, 
  Search, 
  Filter, 
  ArrowUpDown,
  ListTodo,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowDownAZ,
  CalendarDays
} from 'lucide-react';
import TarefaForm from '@/components/tarefas/TarefaForm';
import { TarefaKanban } from '@/components/tarefas/TarefaKanban';
import { TarefaListView } from '@/components/tarefas/TarefaListView';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const TarefasPage = () => {
  const { 
    tarefas, 
    updateTarefa, 
    deleteTarefa, 
    isLoading, 
    clientes, 
    cuidadores,
    kanbanColunas 
  } = useData();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTarefa, setEditingTarefa] = useState<any>(null);
  const [view, setView] = useState<'board' | 'list'>('board');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [clientFilter, setClientFilter] = useState<string | null>(null);
  const [caregiverFilter, setCaregiverFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleEdit = (tarefa: any) => {
    setEditingTarefa(tarefa);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTarefa(null);
  };

  const handleStatusChange = (tarefaId: string, newStatus: string) => {
    updateTarefa(tarefaId, { status: newStatus });
    toast({
      title: "Status atualizado",
      description: "A tarefa foi movida com sucesso.",
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta tarefa permanentemente?")) {
      try {
        await deleteTarefa(id);
        toast({
          title: "Tarefa excluída",
          description: "A tarefa foi removida do sistema.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao excluir",
          description: "Não foi possível excluir a tarefa.",
        });
      }
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await updateTarefa(id, { arquivada: true });
      toast({
        title: "Tarefa arquivada",
        description: "A tarefa agora está na seção de arquivos.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao arquivar",
        description: "Não foi possível arquivar a tarefa.",
      });
    }
  };

  const processedTarefas = useMemo(() => {
    let result = [...tarefas].filter(t => !t.arquivada);

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.titulo.toLowerCase().includes(lowerSearch) ||
        t.descricao?.toLowerCase().includes(lowerSearch)
      );
    }

    if (statusFilter.length > 0) {
      result = result.filter(t => statusFilter.includes(t.status));
    }

    if (clientFilter) {
      result = result.filter(t => t.cliente_id === clientFilter);
    }

    if (caregiverFilter) {
      result = result.filter(t => t.cuidador_id === caregiverFilter);
    }

    result.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else {
        return sortOrder === 'asc' 
          ? a.titulo.localeCompare(b.titulo)
          : b.titulo.localeCompare(a.titulo);
      }
    });

    return result;
  }, [tarefas, searchTerm, statusFilter, clientFilter, caregiverFilter, sortBy, sortOrder]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = {
    total: processedTarefas.length,
    todo: processedTarefas.filter(t => t.status === 'todo').length,
    inProgress: processedTarefas.filter(t => t.status === 'inProgress').length,
    done: processedTarefas.filter(t => t.status === 'done').length,
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 space-y-6 animate-in fade-in duration-500 pb-10">
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
              className="pl-9 w-[260px] bg-white border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="shadow-lg shadow-primary/20 gap-2 h-10 px-5 font-bold">
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      <Separator className="bg-gray-100" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: ListTodo, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'A Fazer', value: stats.todo, icon: Clock, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: 'Em Progresso', value: stats.inProgress, icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Concluídas', value: stats.done, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
            <CardContent className="p-4 flex items-center gap-3 relative">
              <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-black text-gray-900 leading-none mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-2 rounded-2xl border border-gray-100 shadow-sm gap-4">
          <Tabs value={view} onValueChange={(v: any) => setView(v)} className="w-full sm:w-auto">
            <TabsList className="bg-gray-100/50 p-1 w-full sm:w-auto">
              <TabsTrigger value="board" className="flex-1 sm:flex-none gap-2 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">
                <LayoutGrid className="h-4 w-4" />
                Quadro
              </TabsTrigger>
              <TabsTrigger value="list" className="flex-1 sm:flex-none gap-2 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">
                <List className="h-4 w-4" />
                Lista
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={cn(
                  "h-9 gap-2 font-bold",
                  (statusFilter.length > 0 || clientFilter || caregiverFilter) && "border-primary text-primary bg-primary/5"
                )}>
                  <Filter className="h-4 w-4" />
                  Filtros
                  {(statusFilter.length > 0 || clientFilter || caregiverFilter) && (
                    <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-primary text-white">
                      {(statusFilter.length > 0 ? 1 : 0) + (clientFilter ? 1 : 0) + (caregiverFilter ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[240px]">
                <DropdownMenuLabel>Filtrar por Status</DropdownMenuLabel>
                {kanbanColunas.map(col => (
                  <DropdownMenuCheckboxItem
                    key={col.slug}
                    checked={statusFilter.includes(col.slug)}
                    onCheckedChange={(checked) => {
                      setStatusFilter(prev => 
                        checked ? [...prev, col.slug] : prev.filter(s => s !== col.slug)
                      );
                    }}
                  >
                    {col.titulo}
                  </DropdownMenuCheckboxItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Relacionados</DropdownMenuLabel>
                <div className="px-2 py-1.5 space-y-2">
                  <select 
                    className="w-full text-sm border-gray-200 rounded-md focus:ring-primary focus:border-primary"
                    value={clientFilter || ''}
                    onChange={(e) => setClientFilter(e.target.value || null)}
                  >
                    <option value="">Todos os Clientes</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                  
                  <select 
                    className="w-full text-sm border-gray-200 rounded-md focus:ring-primary focus:border-primary"
                    value={caregiverFilter || ''}
                    onChange={(e) => setCaregiverFilter(e.target.value || null)}
                  >
                    <option value="">Todos os Cuidadores</option>
                    {cuidadores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-center justify-center text-xs font-bold text-primary"
                  onClick={() => {
                    setStatusFilter([]);
                    setClientFilter(null);
                    setCaregiverFilter(null);
                  }}
                >
                  Limpar Filtros
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2 font-bold">
                  <ArrowUpDown className="h-4 w-4" />
                  Ordenar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuRadioGroup value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <DropdownMenuRadioItem value="date" className="gap-2">
                    <CalendarDays className="h-4 w-4" /> Data de Criação
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="title" className="gap-2">
                    <ArrowDownAZ className="h-4 w-4" /> Título
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
                  <DropdownMenuRadioItem value="asc">Crescente</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="desc">Decrescente</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="min-h-[600px] bg-slate-50/10 rounded-2xl p-1">
          {view === 'board' ? (
            <TarefaKanban 
              tarefas={processedTarefas} 
              onEdit={handleEdit} 
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onArchive={handleArchive}
              onAddInColumn={(status) => {
                setEditingTarefa({ status });
                setIsFormOpen(true);
              }}
            />
          ) : (
            <TarefaListView 
              tarefas={processedTarefas} 
              onEdit={handleEdit} 
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onArchive={handleArchive}
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

export default TarefasPage;
