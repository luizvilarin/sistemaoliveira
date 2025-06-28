
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatMoney, formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Search, Plus, Edit } from 'lucide-react';
import TransacaoForm from '@/components/transacoes/TransacaoForm';
import { useNavigate } from 'react-router-dom';

const TransactionBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'confirmado':
      return <span className="sgc-badge-confirmed">Confirmado</span>;
    case 'aguardando':
      return <span className="sgc-badge-waiting">Aguardando</span>;
    case 'expirado':
      return <span className="sgc-badge-expired">Expirado</span>;
    default:
      return null;
  }
};

const TransacoesPage = () => {
  const { transacoes, clientes, isLoading } = useData();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isTransacaoFormOpen, setIsTransacaoFormOpen] = useState(false);
  const [currentTransacao, setCurrentTransacao] = useState<any>(null);

  // Redirecionar se não for admin
  if (!isAdmin && !isLoading) {
    navigate('/dashboard');
    return null;
  }

  // Filtrar transações com base no termo de pesquisa
  const filteredTransactions = transacoes.filter((transacao) => {
    const cliente = clientes.find(c => c.id === transacao.cliente_id);
    const clienteNome = cliente?.nome.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    return (
      clienteNome.includes(searchLower) ||
      transacao.status.includes(searchLower) ||
      transacao.valor.toString().includes(searchLower)
    );
  });

  const handleAddTransacao = () => {
    setCurrentTransacao(null);
    setIsTransacaoFormOpen(true);
  };

  const handleEditTransacao = (transacao: any) => {
    setCurrentTransacao(transacao);
    setIsTransacaoFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transações</h1>
          <p className="text-gray-500">
            Gerencie todas as transações financeiras dos clientes
          </p>
        </div>
        <Button onClick={handleAddTransacao} className="flex items-center gap-2">
          <Plus size={18} />
          Nova Transação
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Transações
            </div>
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar transações..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando transações...</div>
          ) : filteredTransactions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transacao) => {
                    const cliente = clientes.find(c => c.id === transacao.cliente_id);
                    return (
                      <TableRow key={transacao.id}>
                        <TableCell className="font-medium">
                          {cliente?.nome || 'Cliente desconhecido'}
                        </TableCell>
                        <TableCell>{formatMoney(transacao.valor)}</TableCell>
                        <TableCell>
                          <TransactionBadge status={transacao.status} />
                        </TableCell>
                        <TableCell>{formatDateTime(transacao.data)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleEditTransacao(transacao)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma transação encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>

      <TransacaoForm
        isOpen={isTransacaoFormOpen}
        onClose={() => setIsTransacaoFormOpen(false)}
        transacaoToEdit={currentTransacao}
      />
    </div>
  );
};

export default TransacoesPage;
