
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, User, MapPin, Users, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import CuidadorForm from '@/components/cuidadores/CuidadorForm';
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

const CuidadoresPage = () => {
  const { cuidadores, isLoading, deleteCuidador } = useData();
  const { toast } = useToast();
  const location = useLocation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCuidador, setEditingCuidador] = useState(null);

  // Verificar se há um novo usuário cuidador para editar
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const newUserId = searchParams.get('new_user');
    
    if (newUserId) {
      // Encontrar o cuidador recém-criado
      const newCuidador = cuidadores.find(c => c.id === newUserId);
      if (newCuidador) {
        setEditingCuidador(newCuidador);
        setIsFormOpen(true);
        toast({
          title: 'Bem-vindo!',
          description: 'Complete as informações do seu perfil de cuidador.',
        });
      }
    }
  }, [location.search, cuidadores]);

  const handleEdit = (cuidador: any) => {
    setEditingCuidador(cuidador);
    setIsFormOpen(true);
  };

  const handleDeleteCuidador = async (cuidadorId: string) => {
    try {
      await deleteCuidador(cuidadorId);
      toast({
        title: 'Cuidador excluído',
        description: 'O cuidador foi excluído com sucesso!',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao excluir cuidador.',
      });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCuidador(null);
    
    // Limpar parâmetros da URL se existirem
    if (location.search.includes('new_user')) {
      window.history.replaceState({}, '', location.pathname);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Cuidadores</h1>
          <p className="text-gray-600 text-sm md:text-base">Gerencie os cuidadores do sistema</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="w-full md:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cuidador
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total de Cuidadores</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{cuidadores.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Com Família Atribuída</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {cuidadores.filter(c => c.cliente_id).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Disponíveis</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {cuidadores.filter(c => !c.cliente_id).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Lista de Cuidadores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Especialização</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead className="hidden lg:table-cell">Família</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Data de Cadastro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cuidadores.map((cuidador) => (
                  <TableRow key={cuidador.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{cuidador.nome}</span>
                        <span className="text-xs text-gray-500 md:hidden">
                          {cuidador.especializacao}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{cuidador.especializacao}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {cuidador.telefone && (
                          <div className="text-sm">{cuidador.telefone}</div>
                        )}
                        {cuidador.email && (
                          <div className="text-sm text-gray-500 truncate max-w-32">{cuidador.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {cuidador.cliente ? (
                        <div className="space-y-1">
                          <div className="font-medium text-sm text-green-600">
                            {cuidador.cliente.nome}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-32">
                            {cuidador.cliente.endereco || 'Endereço não informado'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Não atribuído</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {cuidador.cliente_id ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Ocupado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Disponível
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(cuidador.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(cuidador)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o cuidador "{cuidador.nome}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteCuidador(cuidador.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CuidadorForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        cuidadorToEdit={editingCuidador}
      />
    </div>
  );
};

export default CuidadoresPage;
