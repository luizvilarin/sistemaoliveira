import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { formatMoney } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  DollarSign,
  Calendar
} from 'lucide-react';

const FinancialInsights: React.FC = () => {
  const { financeiro, pagamentosFuncionarios, clientes } = useData();

  const insights = useMemo(() => {
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();
    const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
    const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;

    // Receitas do mês atual vs anterior
    const receitaAtual = financeiro
      .filter(f => {
        const data = new Date(f.data_transacao);
        return data.getMonth() === mesAtual && 
               data.getFullYear() === anoAtual &&
               f.tipo === 'receita';
      })
      .reduce((acc, f) => acc + Number(f.valor), 0);

    const receitaAnterior = financeiro
      .filter(f => {
        const data = new Date(f.data_transacao);
        return data.getMonth() === mesAnterior && 
               data.getFullYear() === anoAnterior &&
               f.tipo === 'receita';
      })
      .reduce((acc, f) => acc + Number(f.valor), 0);

    // Gastos do mês atual vs anterior  
    const gastosAtual = financeiro
      .filter(f => {
        const data = new Date(f.data_transacao);
        return data.getMonth() === mesAtual && 
               data.getFullYear() === anoAtual &&
               f.tipo === 'despesa';
      })
      .reduce((acc, f) => acc + Number(f.valor), 0);

    // Análises
    const crescimentoReceita = receitaAnterior > 0 
      ? ((receitaAtual - receitaAnterior) / receitaAnterior) * 100
      : 0;

    const clientesComContrato = clientes.filter(c => c.contrato_ativo).length;
    const taxaConversao = clientes.length > 0 ? (clientesComContrato / clientes.length) * 100 : 0;

    const folhaMensal = pagamentosFuncionarios
      .filter(p => {
        const data = new Date(p.data_pagamento);
        return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
      })
      .reduce((acc, p) => acc + Number(p.valor), 0);

    const margemOperacional = receitaAtual > 0 
      ? ((receitaAtual - gastosAtual - folhaMensal) / receitaAtual) * 100
      : 0;

    return {
      crescimentoReceita,
      taxaConversao,
      margemOperacional,
      receitaAtual,
      gastosAtual,
      folhaMensal,
      clientesComContrato
    };
  }, [financeiro, pagamentosFuncionarios, clientes]);

  const getInsightStatus = (value: number, threshold: number, invert = false) => {
    const condition = invert ? value < threshold : value > threshold;
    return condition ? 'success' : value > threshold * 0.7 ? 'warning' : 'danger';
  };

  const insightItems = [
    {
      title: 'Crescimento de Receita',
      value: `${insights.crescimentoReceita.toFixed(1)}%`,
      description: 'vs mês anterior',
      icon: insights.crescimentoReceita >= 0 ? TrendingUp : TrendingDown,
      status: getInsightStatus(insights.crescimentoReceita, 5),
      color: insights.crescimentoReceita >= 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Taxa de Conversão',
      value: `${insights.taxaConversao.toFixed(1)}%`,
      description: 'clientes com contrato',
      icon: CheckCircle,
      status: getInsightStatus(insights.taxaConversao, 70),
      color: insights.taxaConversao > 70 ? 'text-green-600' : 'text-yellow-600'
    },
    {
      title: 'Margem Operacional',
      value: `${insights.margemOperacional.toFixed(1)}%`,
      description: 'lucratividade líquida',
      icon: insights.margemOperacional >= 20 ? TrendingUp : AlertTriangle,
      status: getInsightStatus(insights.margemOperacional, 20),
      color: insights.margemOperacional >= 20 ? 'text-green-600' : 'text-red-600'
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800', 
      danger: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      success: 'Excelente',
      warning: 'Atenção',
      danger: 'Crítico'
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Insights Financeiros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insightItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              <item.icon className={`h-5 w-5 ${item.color}`} />
              <div>
                <h4 className="font-medium text-sm">{item.title}</h4>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="font-bold text-lg">{item.value}</div>
              {getStatusBadge(item.status)}
            </div>
          </div>
        ))}
        
        {/* Resumo financeiro */}
        <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Receita Mensal:</span>
            <span className="font-medium">{formatMoney(insights.receitaAtual)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Gastos Operacionais:</span>
            <span className="font-medium text-red-600">-{formatMoney(insights.gastosAtual)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Folha de Pagamento:</span>
            <span className="font-medium text-orange-600">-{formatMoney(insights.folhaMensal)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold border-t pt-2">
            <span>Lucro Líquido:</span>
            <span className={insights.receitaAtual - insights.gastosAtual - insights.folhaMensal >= 0 ? 'text-green-600' : 'text-red-600'}>
              {formatMoney(insights.receitaAtual - insights.gastosAtual - insights.folhaMensal)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialInsights;