import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar, Edit, Trash2 } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import { useFinanceiroCrud } from '@/hooks/crud/useFinanceiroCrud';
import FinanceiroForm from '@/components/financeiro/FinanceiroForm';
import FinanceiroAdvancedReports from '@/components/financeiro/FinanceiroAdvancedReports';
import FinanceiroFluxoCaixa from '@/components/financeiro/FinanceiroFluxoCaixa';
import { Financeiro } from '@/types/data';

const FinanceiroPage = () => {
  const { financeiro, setFinanceiro } = useData();
  const { userProfile } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Financeiro | null>(null);
  const { updateFinanceiro, deleteFinanceiro, isLoading } = useFinanceiroCrud(setFinanceiro);

  // Verificar se é admin_plus
  const isAdminPlus = userProfile?.perfil === 'admin_plus';

  if (!isAdminPlus) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Acesso Negado</h2>
          <p className="text-gray-500 mt-2">Apenas usuários Admin+ podem acessar o módulo financeiro.</p>
        </div>
      </div>
    );
  }

  const receitas = financeiro.filter(item => item.tipo === 'receita');
  const despesas = financeiro.filter(item => item.tipo === 'despesa');

  const totalReceitas = receitas.reduce((sum, item) => sum + Number(item.valor), 0);
  const totalDespesas = despesas.reduce((sum, item) => sum + Number(item.valor), 0);
  const saldo = totalReceitas - totalDespesas;

  const receitasEsteMes = receitas.filter(item => {
    const itemDate = new Date(item.data_transacao);
    const currentDate = new Date();
    return itemDate.getMonth() === currentDate.getMonth() && 
           itemDate.getFullYear() === currentDate.getFullYear();
  });

  const despesasEsteMes = despesas.filter(item => {
    const itemDate = new Date(item.data_transacao);
    const currentDate = new Date();
    return itemDate.getMonth() === currentDate.getMonth() && 
           itemDate.getFullYear() === currentDate.getFullYear();
  });

  const totalReceitasEsteMes = receitasEsteMes.reduce((sum, item) => sum + Number(item.valor), 0);
  const totalDespesasEsteMes = despesasEsteMes.reduce((sum, item) => sum + Number(item.valor), 0);

  const handleEditItem = (item: Financeiro) => {
    setItemToEdit(item);
    setIsFormOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteFinanceiro(id);
    } catch (error) {
      console.error('Erro ao deletar item:', error);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setItemToEdit(null);
  };

  const renderFinanceiroList = (items: typeof financeiro, tipo: 'receita' | 'despesa') => (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhuma {tipo} registrada ainda.</p>
        </div>
      ) : (
        items
          .sort((a, b) => new Date(b.data_transacao).getTime() - new Date(a.data_transacao).getTime())
          .map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{item.descricao}</h3>
                  <Badge variant="outline">
                    {item.categoria}
                  </Badge>
                  {item.referencia_tipo && (
                    <Badge variant="secondary" className="text-xs">
                      {item.referencia_tipo}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                  <span>Data: {new Date(item.data_transacao).toLocaleDateString('pt-BR')}</span>
                  {item.subcategoria && (
                    <span>Sub: {item.subcategoria}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className={`text-lg font-semibold ${
                    tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tipo === 'receita' ? '+' : '-'} {formatMoney(Number(item.valor))}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditItem(item)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir este registro financeiro? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteItem(item.id)}
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
          ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Módulo Financeiro</h1>
          <p className="text-gray-500">
            Controle completo das finanças da empresa
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2" disabled={isLoading}>
          <Plus size={16} />
          Nova Transação
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatMoney(saldo)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receitas - Despesas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatMoney(totalReceitas)}</div>
            <p className="text-xs text-muted-foreground">
              {receitas.length} transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatMoney(totalDespesas)}</div>
            <p className="text-xs text-muted-foreground">
              {despesas.length} transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (totalReceitasEsteMes - totalDespesasEsteMes) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatMoney(totalReceitasEsteMes - totalDespesasEsteMes)}
            </div>
            <p className="text-xs text-muted-foreground">
              Saldo do mês
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="receitas" className="w-full">
        <TabsList>
          <TabsTrigger value="receitas">Receitas ({receitas.length})</TabsTrigger>
          <TabsTrigger value="despesas">Despesas ({despesas.length})</TabsTrigger>
          <TabsTrigger value="todas">Todas as Transações ({financeiro.length})</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios Avançados</TabsTrigger>
          <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
        </TabsList>

        <TabsContent value="receitas">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Receitas</CardTitle>
              <CardDescription>
                Todas as receitas registradas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderFinanceiroList(receitas, 'receita')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="despesas">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Despesas</CardTitle>
              <CardDescription>
                Todas as despesas registradas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderFinanceiroList(despesas, 'despesa')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="todas">
          <Card>
            <CardHeader>
              <CardTitle>Todas as Transações</CardTitle>
              <CardDescription>
                Histórico completo de movimentações financeiras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financeiro.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhuma transação registrada ainda.</p>
                    <Button onClick={() => setIsFormOpen(true)} className="mt-4" disabled={isLoading}>
                      Registrar Primeira Transação
                    </Button>
                  </div>
                ) : (
                  financeiro
                    .sort((a, b) => new Date(b.data_transacao).getTime() - new Date(a.data_transacao).getTime())
                    .map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{item.descricao}</h3>
                            <Badge variant={item.tipo === 'receita' ? 'default' : 'destructive'}>
                              {item.tipo}
                            </Badge>
                            <Badge variant="outline">
                              {item.categoria}
                            </Badge>
                            {item.referencia_tipo && (
                              <Badge variant="secondary" className="text-xs">
                                {item.referencia_tipo}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                            <span>Data: {new Date(item.data_transacao).toLocaleDateString('pt-BR')}</span>
                            {item.subcategoria && (
                              <span>Sub: {item.subcategoria}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className={`text-lg font-semibold ${
                              item.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {item.tipo === 'receita' ? '+' : '-'} {formatMoney(Number(item.valor))}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditItem(item)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir este registro financeiro? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteItem(item.id)}
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
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios">
          <FinanceiroAdvancedReports />
        </TabsContent>

        <TabsContent value="fluxo">
          <FinanceiroFluxoCaixa />
        </TabsContent>
      </Tabs>

      <FinanceiroForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        itemToEdit={itemToEdit}
      />
    </div>
  );
};

export default FinanceiroPage;