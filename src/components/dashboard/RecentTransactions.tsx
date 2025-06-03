
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { DollarSign } from 'lucide-react';
import { formatMoney } from '@/lib/utils';

const TransactionStatus = ({ status }: { status: string }) => {
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

const RecentTransactions = () => {
  const { transacoes } = useData();
  
  // Ordenar transações por data (mais recentes primeiro)
  const sortedTransactions = [...transacoes]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5); // Pegar apenas as 5 mais recentes

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          Transações Recentes
        </CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {sortedTransactions.length > 0 ? (
          <div className="space-y-4">
            {sortedTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center">
                <div className={`rounded-full p-2 mr-3 ${
                  transaction.status === 'confirmado' 
                    ? 'bg-sgc-green-100 text-sgc-green-800' 
                    : transaction.status === 'aguardando'
                    ? 'bg-sgc-yellow-100 text-sgc-yellow-800' 
                    : 'bg-sgc-red-100 text-sgc-red-800'
                }`}>
                  <DollarSign className="h-4 w-4" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium truncate">{transaction.cliente_nome}</p>
                    <p className="text-sm font-bold">
                      {formatMoney(transaction.valor)}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.data).toLocaleDateString()}
                    </p>
                    <TransactionStatus status={transaction.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Nenhuma transação recente encontrada
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
