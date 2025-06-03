
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, User } from 'lucide-react';
import ClienteForm from '@/components/clientes/ClienteForm';
import { formatDate } from '@/lib/utils';

const ClientStatusBadge = ({ status }: { status: string }) => {
  const styles = {
    ativo: 'bg-green-100 text-green-800 hover:bg-green-200',
    pausado: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    terceirizado: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  };
  
  const statusKey = status as keyof typeof styles;
  
  return (
    <Badge 
      variant="outline" 
      className={styles[statusKey]}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const ClientTypeBadge = ({ tipo }: { tipo: string }) => {
  return (
    <Badge 
      variant="outline" 
      className={tipo === 'fixo' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}
    >
      {tipo === 'fixo' ? 'Fixo' : 'Temporário'}
    </Badge>
  );
};

const ClientesPage = () => {
  const { clientes, isLoading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isClienteFormOpen, setIsClienteFormOpen] = useState(false);
  const [currentCliente, setCurrentCliente] = useState<any>(null);

  // Filtrar clientes com base no termo de pesquisa
  const filteredClientes = clientes.filter((cliente) => {
    const searchLower = searchTerm.toLowerCase();
    
    return (
      cliente.nome.toLowerCase().includes(searchLower) ||
      cliente.contato.toLowerCase().includes(searchLower) ||
      cliente.tipo.toLowerCase().includes(searchLower) ||
      cliente.status.toLowerCase().includes(searchLower)
    );
  });

  const handleAddCliente = () => {
    setCurrentCliente(null);
    setIsClienteFormOpen(true);
  };

  const handleEditCliente = (cliente: any) => {
    setCurrentCliente(cliente);
    setIsClienteFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Clientes</h1>
          <p className="text-gray-500">
            Gerencie os clientes da sua base
          </p>
        </div>
        <Button onClick={handleAddCliente} className="flex items-center gap-2">
          <Plus size={18} />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Lista de Clientes
            </div>
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando clientes...</div>
          ) : filteredClientes.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">
                        {cliente.nome}
                      </TableCell>
                      <TableCell>{cliente.contato}</TableCell>
                      <TableCell>
                        <ClientTypeBadge tipo={cliente.tipo} />
                      </TableCell>
                      <TableCell>
                        <ClientStatusBadge status={cliente.status} />
                      </TableCell>
                      <TableCell>{formatDate(cliente.criado_em)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleEditCliente(cliente)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum cliente encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ClienteForm
        isOpen={isClienteFormOpen}
        onClose={() => setIsClienteFormOpen(false)}
        clienteToEdit={currentCliente}
      />
    </div>
  );
};

export default ClientesPage;
