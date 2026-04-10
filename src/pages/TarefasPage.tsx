
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, List, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import TarefaForm from '@/components/tarefas/TarefaForm';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const TarefasPage = () => {
  const { tarefas, clientes, cuidadores, updateTarefa, isLoading } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTarefa, setEditingTarefa] = useState(null);

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

  const getClienteNome = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente?.nome || 'Cliente não encontrado';
  };

  const getCuidadorNome = (cuidadorId: string) => {
    const cuidador = cuidadores.find(c => c.id === cuidadorId);
    return cuidador?.nome || 'Cuidador não encontrado';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'todo':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />A Fazer</Badge>;
      case 'inProgress':
        return <Badge variant="default"><AlertCircle className="h-3 w-3 mr-1" />Em Progresso</Badge>;
      case 'done':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Concluída</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const tarefasPorStatus = {
    todo: tarefas.filter(t => t.status === 'todo').length,
    inProgress: tarefas.filter(t => t.status === 'inProgress').length,
    done: tarefas.filter(t => t.status === 'done').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-gray-600">Gerencie as tarefas do sistema</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tarefas.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Fazer</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tarefasPorStatus.todo}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tarefasPorStatus.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tarefasPorStatus.done}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Tarefas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Cuidador</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tarefas.map((tarefa) => (
                <TableRow key={tarefa.id}>
                  <TableCell className="font-medium">{tarefa.titulo}</TableCell>
                  <TableCell className="max-w-[200px]">
                    {tarefa.descricao ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block truncate cursor-help">{tarefa.descricao}</span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[300px] whitespace-pre-wrap">
                            {tarefa.descricao}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-muted-foreground italic">Sem descrição</span>
                    )}
                  </TableCell>
                  <TableCell>{getClienteNome(tarefa.cliente_id)}</TableCell>
                  <TableCell>{getCuidadorNome(tarefa.cuidador_id)}</TableCell>
                  <TableCell>{getStatusBadge(tarefa.status)}</TableCell>
                  <TableCell>{formatDate(tarefa.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(tarefa)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {tarefa.status !== 'done' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(tarefa.id, tarefa.status === 'todo' ? 'inProgress' : 'done')}
                        >
                          {tarefa.status === 'todo' ? 'Iniciar' : 'Finalizar'}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TarefaForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        tarefaToEdit={editingTarefa}
      />
    </div>
  );
};

export default TarefasPage;
