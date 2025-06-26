
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, User, MapPin, Users } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import CuidadorForm from '@/components/cuidadores/CuidadorForm';

const CuidadoresPage = () => {
  const { cuidadores, isLoading } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCuidador, setEditingCuidador] = useState(null);

  const handleEdit = (cuidador: any) => {
    setEditingCuidador(cuidador);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCuidador(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cuidadores</h1>
          <p className="text-gray-600">Gerencie os cuidadores do sistema</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cuidador
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cuidadores</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cuidadores.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Família Atribuída</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cuidadores.filter(c => c.cliente_id).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cuidadores.filter(c => !c.cliente_id).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Cuidadores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Especialização</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Família</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cuidadores.map((cuidador) => (
                <TableRow key={cuidador.id}>
                  <TableCell className="font-medium">{cuidador.nome}</TableCell>
                  <TableCell>{cuidador.especializacao}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {cuidador.telefone && (
                        <div className="text-sm">{cuidador.telefone}</div>
                      )}
                      {cuidador.email && (
                        <div className="text-sm text-gray-500">{cuidador.email}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {cuidador.cliente ? (
                      <div className="space-y-1">
                        <div className="font-medium text-sm text-green-600">
                          {cuidador.cliente.nome}
                        </div>
                        <div className="text-xs text-gray-500">
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
                  <TableCell>{formatDate(cuidador.created_at)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(cuidador)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
