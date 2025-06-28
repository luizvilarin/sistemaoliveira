
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatMoney, formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TransacaoForm from '@/components/transacoes/TransacaoForm';
import { useNavigate } from 'react-router-dom';
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
  const { transacoes, clientes, isLoading, deleteTransacao } = useData();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isTransacaoFormOpen, setIsTransacaoFormOpen] = useState(false);
  const [currentTransacao, setCurrentTransacao] = useState<any>(null);

  // Redirecionar se não for admin
  if (!isAdmin && !isLoading) {
    navigate('/dashboard');
    return null;
  }

  const handleDeleteTransacao = async (transacaoId: string) => {
    try {
      await deleteTransacao(transacaoId);
      toast({
        title: 'Transação excluída',
        description: 'A transação foi excluída com sucesso!',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao excluir transação.',
      });
    }
  };

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
    <div className="space-y-4 md:space-y-6 p-2 md:p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Transações</h1>
          <p className="text-gray-500 text-sm md:text-base">
            Gerencie todas as transações financeiras dos clientes
          </p>
        </div>
        <Button onClick={handleAddTransacao} className="flex items-center gap-2 w-full md:w-auto">
          <Plus size={18} />
          Nova Transação
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between pb-2 space-y-4 md:space-y-0">
          <CardTitle className="text-base md:text-lg font-medium">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 md:h-5 w-4 md:w-5" />
              Transações
            </div>
          </CardTitle>
          <div className="relative w-full md:w-64">
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
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transacao) => {
                    const cliente = clientes.find(c => c.id === transacao.cliente_id);
                    return (
                      <TableRow key={transacao.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{cliente?.nome || 'Cliente desconhecido'}</span>
                            <span className="text-xs text-gray-500 md:hidden">
                              {formatDateTime(transacao.data)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{formatMoney(transacao.valor)}</TableCell>
                        <TableCell>
                          <TransactionBadge status={transacao.status} />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDateTime(transacao.data)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditTransacao(transacao)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteTransacao(transacao.id)}
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
