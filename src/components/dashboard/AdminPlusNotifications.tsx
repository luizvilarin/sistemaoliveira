import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  TrendingDown, 
  Clock,
  DollarSign,
  Users,
  FileText,
  Calendar
} from 'lucide-react';

const AdminPlusNotifications: React.FC = () => {
  const { financeiro, pagamentosFuncionarios, clientes, boletos, tarefas } = useData();
  const navigate = useNavigate();

  const alerts = useMemo(() => {
    const notifications = [];
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    // 1. Verifica margem de lucro baixa
    const receitaMensal = financeiro
      .filter(f => {
        const data = new Date(f.data_transacao);
        return data.getMonth() === mesAtual && 
               data.getFullYear() === anoAtual &&
               f.tipo === 'receita';
      })
      .reduce((acc, f) => acc + Number(f.valor), 0);

    const gastosMensais = financeiro
      .filter(f => {
        const data = new Date(f.data_transacao);
        return data.getMonth() === mesAtual && 
               data.getFullYear() === anoAtual &&
               f.tipo === 'despesa';
      })
      .reduce((acc, f) => acc + Number(f.valor), 0);

    const folhaPagamento = pagamentosFuncionarios
      .filter(p => {
        const data = new Date(p.data_pagamento);
        return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
      })
      .reduce((acc, p) => acc + Number(p.valor), 0);

    const margemLucro = receitaMensal > 0 
      ? ((receitaMensal - gastosMensais - folhaPagamento) / receitaMensal) * 100
      : 0;

    if (margemLucro < 15 && receitaMensal > 0) {
      notifications.push({
        id: 'low-profit-margin',
        type: 'critical',
        icon: TrendingDown,
        title: 'Margem de Lucro Baixa',
        description: `Margem de ${margemLucro.toFixed(1)}% está abaixo do recomendado (15%)`,
        action: () => navigate('/financeiro'),
        actionLabel: 'Ver Financeiro'
      });
    }

    // 2. Clientes inativos há muito tempo
    const clientesInativos = clientes.filter(c => {
      if (c.status === 'ativo') return false;
      const diasInativo = Math.floor((hoje.getTime() - new Date(c.updated_at).getTime()) / (1000 * 60 * 60 * 24));
      return diasInativo > 30;
    });

    if (clientesInativos.length > 0) {
      notifications.push({
        id: 'inactive-clients',
        type: 'warning',
        icon: Users,
        title: 'Clientes Inativos',
        description: `${clientesInativos.length} clientes inativos há mais de 30 dias`,
        action: () => navigate('/clientes'),
        actionLabel: 'Ver Clientes'
      });
    }

    // 3. Boletos pendentes próximos do vencimento
    const boletosPendentes = boletos.filter(b => {
      if (b.status !== 'pendente') return false;
      const hoje = new Date();
      const diaVencimento = b.dia_vencimento;
      const vencimento = new Date(hoje.getFullYear(), hoje.getMonth(), diaVencimento);
      
      if (vencimento < hoje) {
        vencimento.setMonth(vencimento.getMonth() + 1);
      }
      
      const diasParaVencimento = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      return diasParaVencimento <= 3;
    });

    if (boletosPendentes.length > 0) {
      notifications.push({
        id: 'pending-boletos',
        type: 'warning',
        icon: FileText,
        title: 'Boletos Próximos ao Vencimento',
        description: `${boletosPendentes.length} boletos para enviar nos próximos 3 dias`,
        action: () => navigate('/boletos'),
        actionLabel: 'Ver Boletos'
      });
    }

    // 4. Gastos acima da média
    const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
    const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;
    
    const gastosAnterior = financeiro
      .filter(f => {
        const data = new Date(f.data_transacao);
        return data.getMonth() === mesAnterior && 
               data.getFullYear() === anoAnterior &&
               f.tipo === 'despesa';
      })
      .reduce((acc, f) => acc + Number(f.valor), 0);

    if (gastosAnterior > 0 && gastosMensais > gastosAnterior * 1.2) {
      notifications.push({
        id: 'high-expenses',
        type: 'critical',
        icon: DollarSign,
        title: 'Gastos Elevados',
        description: `Gastos 20% acima do mês anterior`,
        action: () => navigate('/financeiro'),
        actionLabel: 'Analisar Gastos'
      });
    }

    // 5. Tarefas pendentes acumuladas
    const tarefasPendentes = tarefas.filter(t => t.status === 'todo');
    const tarefasAntigas = tarefasPendentes.filter(t => {
      const diasPendente = Math.floor((hoje.getTime() - new Date(t.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return diasPendente > 7;
    });

    if (tarefasAntigas.length > 5) {
      notifications.push({
        id: 'old-tasks',
        type: 'warning',
        icon: Clock,
        title: 'Tarefas Pendentes Antigas',
        description: `${tarefasAntigas.length} tarefas pendentes há mais de 7 dias`,
        action: () => navigate('/tarefas'),
        actionLabel: 'Ver Tarefas'
      });
    }

    return notifications.slice(0, 5); // Máximo 5 notificações
  }, [financeiro, pagamentosFuncionarios, clientes, boletos, tarefas, navigate]);

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  if (alerts.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-green-600" />
            Sistema em Ordem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">✅</div>
            <p>Nenhum alerta crítico detectado</p>
            <p className="text-sm">Todos os indicadores estão dentro dos parâmetros normais</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          Alertas do Sistema
          <Badge className="bg-red-100 text-red-800 ml-auto">
            {alerts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <alert.icon className={`h-5 w-5 mt-0.5 ${getIconColor(alert.type)}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">{alert.title}</h4>
                <Badge className={getBadgeVariant(alert.type)}>
                  {alert.type === 'critical' ? 'Crítico' : 'Atenção'}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mb-2">{alert.description}</p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={alert.action}
                className="text-xs h-7"
              >
                {alert.actionLabel}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AdminPlusNotifications;