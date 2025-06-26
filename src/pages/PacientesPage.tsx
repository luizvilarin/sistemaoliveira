
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, HeartPulse, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { formatDate, formatMoney } from '@/lib/utils';
import PacienteForm from '@/components/pacientes/PacienteForm';

const PacientesPage = () => {
  const { pacientes, isLoading } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState(null);

  const handleEdit = (paciente: any) => {
    setEditingPaciente(paciente);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPaciente(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const contratosAtivos = pacientes.filter(p => p.contrato_ativo).length;
  const valorTotal = pacientes
    .filter(p => p.contrato_ativo)
    .reduce((acc, p) => acc + (p.valor_contrato || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-600">Gerencie os pacientes do sistema</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Paciente
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <HeartPulse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pacientes.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{contratosAtivos}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Inativos</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {pacientes.length - contratosAtivos}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Contratos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(valorTotal)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cliente/Família</TableHead>
                <TableHead>Cuidador(a)</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Histórico Médico</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pacientes.map((paciente) => (
                <TableRow key={paciente.id}>
                  <TableCell className="font-medium">{paciente.nome}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {paciente.cliente?.nome || 'Cliente não encontrado'}
                      </div>
                      {paciente.cliente?.endereco && (
                        <div className="text-xs text-gray-500">
                          {paciente.cliente.endereco}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {paciente.cuidador ? (
                      <div className="space-y-1">
                        <div className="font-medium text-sm">
                          {paciente.cuidador.nome}
                        </div>
                        <div className="text-xs text-gray-500">
                          {paciente.cuidador.especializacao}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Não atribuído</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {paciente.contrato_ativo ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inativo
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {paciente.valor_contrato ? (
                      <div className="font-medium">
                        {formatMoney(paciente.valor_contrato)}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Não informado</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={paciente.historico_medico}>
                      {paciente.historico_medico || 'Não informado'}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(paciente.created_at)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(paciente)}
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

      <PacienteForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        pacienteToEdit={editingPaciente}
      />
    </div>
  );
};

export default PacientesPage;
