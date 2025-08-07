import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, DollarSign, Calendar, User } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import PagamentoFuncionarioForm from '@/components/pagamentos/PagamentoFuncionarioForm';

const PagamentosFuncionariosPage = () => {
  const { pagamentosFuncionarios, cuidadores } = useData();
  const { isAdmin } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Acesso Negado</h2>
          <p className="text-gray-500 mt-2">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  const getCuidadorNome = (cuidadorId: string) => {
    const cuidador = cuidadores.find(c => c.id === cuidadorId);
    return cuidador?.nome || 'Cuidador não encontrado';
  };

  const totalPagamentos = pagamentosFuncionarios.reduce((sum, pagamento) => sum + Number(pagamento.valor), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pagamentos de Funcionários</h1>
          <p className="text-gray-500">
            Gerencie os pagamentos realizados aos cuidadores
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
          <Plus size={16} />
          Novo Pagamento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pagamentos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalPagamentos)}</div>
            <p className="text-xs text-muted-foreground">
              {pagamentosFuncionarios.length} pagamentos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Este Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pagamentosFuncionarios.filter(p => {
                const pagamentoDate = new Date(p.data_pagamento);
                const currentDate = new Date();
                return pagamentoDate.getMonth() === currentDate.getMonth() && 
                       pagamentoDate.getFullYear() === currentDate.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Pagamentos realizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funcionários Ativos</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cuidadores.length}</div>
            <p className="text-xs text-muted-foreground">
              Cuidadores cadastrados
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <CardDescription>
            Lista completa de todos os pagamentos realizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pagamentosFuncionarios.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum pagamento registrado ainda.</p>
                <Button onClick={() => setIsFormOpen(true)} className="mt-4">
                  Registrar Primeiro Pagamento
                </Button>
              </div>
            ) : (
              pagamentosFuncionarios
                .sort((a, b) => new Date(b.data_pagamento).getTime() - new Date(a.data_pagamento).getTime())
                .map((pagamento) => (
                  <div key={pagamento.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{getCuidadorNome(pagamento.cuidador_id)}</h3>
                        <Badge variant={pagamento.status === 'pago' ? 'default' : 'secondary'}>
                          {pagamento.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{pagamento.descricao}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                        <span>Tipo: {pagamento.tipo_pagamento}</span>
                        <span>Referência: {pagamento.referencia}</span>
                        <span>Data: {new Date(pagamento.data_pagamento).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">
                        {formatMoney(Number(pagamento.valor))}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>

      <PagamentoFuncionarioForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
};

export default PagamentosFuncionariosPage;