
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Plus, Clock, MapPin, User, Edit, Trash2, AlertTriangle } from 'lucide-react';
import LembreteForm from '@/components/lembretes/LembreteForm';
import { formatDate } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CalendarioPage = () => {
  const { lembretes, isLoading, deleteLembrete } = useData();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLembrete, setEditingLembrete] = useState(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleEditLembrete = (lembrete: any) => {
    setEditingLembrete(lembrete);
    setIsFormOpen(true);
  };

  const handleDeleteLembrete = async (lembreteId: string) => {
    try {
      await deleteLembrete(lembreteId);
      toast({
        title: 'Lembrete excluído',
        description: 'O lembrete foi excluído com sucesso!',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao excluir lembrete.',
      });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingLembrete(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'concluido':
        return <Badge variant="default">Concluído</Badge>;
      case 'em_andamento':
        return <Badge variant="secondary">Em Andamento</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const getTipoBadge = (tipo: string) => {
    const colors = {
      geral: 'bg-gray-100 text-gray-800',
      consulta: 'bg-blue-100 text-blue-800',
      medicamento: 'bg-green-100 text-green-800',
      emergencia: 'bg-red-100 text-red-800',
      rotina: 'bg-purple-100 text-purple-800',
    };
    
    return (
      <Badge className={colors[tipo as keyof typeof colors] || colors.geral}>
        {tipo}
      </Badge>
    );
  };

  // Agrupar lembretes por data
  const lembretesPorData = lembretes.reduce((acc, lembrete) => {
    const data = lembrete.dia;
    if (!acc[data]) {
      acc[data] = [];
    }
    acc[data].push(lembrete);
    return acc;
  }, {} as Record<string, typeof lembretes>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendário e Lembretes</h1>
          <p className="text-gray-600">Gerencie os lembretes e agendamentos</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Lembrete
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Lembretes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lembretes.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lembretesPorData[new Date().toISOString().split('T')[0]]?.length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lembretes.filter(l => {
                const lembreteDate = new Date(l.dia);
                const today = new Date();
                const weekFromNow = new Date();
                weekFromNow.setDate(today.getDate() + 7);
                return lembreteDate >= today && lembreteDate <= weekFromNow;
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {lembretes.filter(l => l.urgente).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {Object.keys(lembretesPorData)
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
          .map((data) => (
            <Card key={data}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {formatDate(data)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lembretesPorData[data].map((lembrete) => (
                    <div key={lembrete.id} className={`p-4 border rounded-lg ${lembrete.urgente ? 'border-red-200 bg-red-50' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{lembrete.titulo}</h3>
                            {lembrete.urgente && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {getTipoBadge(lembrete.tipo)}
                            {getStatusBadge(lembrete.status)}
                            {lembrete.tags?.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          {lembrete.descricao && (
                            <p className="text-gray-600">{lembrete.descricao}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {lembrete.residencia}
                            </div>
                            {lembrete.hora && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {lembrete.hora}
                              </div>
                            )}
                            {lembrete.cliente && (
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                Cliente: {lembrete.cliente.nome}
                              </div>
                            )}
                            {lembrete.cuidador && (
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                Cuidador: {lembrete.cuidador.nome}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditLembrete(lembrete)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o lembrete "{lembrete.titulo}"? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteLembrete(lembrete.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        
        {Object.keys(lembretesPorData).length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Nenhum lembrete cadastrado</p>
              <Button 
                onClick={() => setIsFormOpen(true)}
                className="mt-4"
              >
                Criar primeiro lembrete
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <LembreteForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        lembreteToEdit={editingLembrete}
      />
    </div>
  );
};

export default CalendarioPage;
