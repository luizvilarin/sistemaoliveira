import React, { useMemo, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Download, Filter } from 'lucide-react';
import { formatMoney } from '@/lib/utils';

const FinanceiroFluxoCaixa = () => {
  const { financeiro } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('12meses');
  const [viewType, setViewType] = useState('mensal');

  const fluxoCaixaData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let periods: string[] = [];

    if (selectedPeriod === '3meses') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      for (let i = -2; i <= 0; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
        periods.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
      }
    } else if (selectedPeriod === '6meses') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      for (let i = -5; i <= 0; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
        periods.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
      }
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      for (let i = -11; i <= 0; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
        periods.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
      }
    }

    const fluxoData = periods.map(period => {
      const [year, month] = period.split('-').map(Number);
      const periodTransactions = financeiro.filter(item => {
        const itemDate = new Date(item.data_transacao);
        return itemDate.getFullYear() === year && itemDate.getMonth() === month - 1;
      });

      const receitas = periodTransactions
        .filter(item => item.tipo === 'receita')
        .reduce((sum, item) => sum + Number(item.valor), 0);

      const despesas = periodTransactions
        .filter(item => item.tipo === 'despesa')
        .reduce((sum, item) => sum + Number(item.valor), 0);

      const saldo = receitas - despesas;

      return {
        periodo: new Date(year, month - 1, 1).toLocaleDateString('pt-BR', { 
          month: 'short', 
          year: viewType === 'anual' ? 'numeric' : undefined 
        }),
        receitas,
        despesas,
        saldo,
        saldoAcumulado: 0 // Será calculado depois
      };
    });

    // Calcular saldo acumulado
    let saldoAcumulado = 0;
    fluxoData.forEach(item => {
      saldoAcumulado += item.saldo;
      item.saldoAcumulado = saldoAcumulado;
    });

    return fluxoData;
  }, [financeiro, selectedPeriod, viewType]);

  const projecaoData = useMemo(() => {
    if (fluxoCaixaData.length < 3) return [];

    // Calcular médias dos últimos 3 meses
    const ultimosTresMeses = fluxoCaixaData.slice(-3);
    const mediaReceitas = ultimosTresMeses.reduce((sum, item) => sum + item.receitas, 0) / 3;
    const mediaDespesas = ultimosTresMeses.reduce((sum, item) => sum + item.despesas, 0) / 3;
    const mediaSaldo = mediaReceitas - mediaDespesas;

    const ultimoSaldoAcumulado = fluxoCaixaData[fluxoCaixaData.length - 1]?.saldoAcumulado || 0;

    // Projetar próximos 3 meses
    const proximosTresMeses = [];
    const now = new Date();
    
    for (let i = 1; i <= 3; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const saldoAcumuladoProjetado = ultimoSaldoAcumulado + (mediaSaldo * i);
      
      proximosTresMeses.push({
        periodo: futureDate.toLocaleDateString('pt-BR', { month: 'short' }),
        receitas: mediaReceitas,
        despesas: mediaDespesas,
        saldo: mediaSaldo,
        saldoAcumulado: saldoAcumuladoProjetado,
        projecao: true
      });
    }

    return [...fluxoCaixaData, ...proximosTresMeses];
  }, [fluxoCaixaData]);

  const estatisticas = useMemo(() => {
    if (fluxoCaixaData.length === 0) return null;

    const totalReceitas = fluxoCaixaData.reduce((sum, item) => sum + item.receitas, 0);
    const totalDespesas = fluxoCaixaData.reduce((sum, item) => sum + item.despesas, 0);
    const saldoFinal = fluxoCaixaData[fluxoCaixaData.length - 1]?.saldoAcumulado || 0;
    const mediaReceitasMensal = totalReceitas / fluxoCaixaData.length;
    const mediaDespesasMensal = totalDespesas / fluxoCaixaData.length;

    const mesesPositivos = fluxoCaixaData.filter(item => item.saldo > 0).length;
    const mesesNegativos = fluxoCaixaData.filter(item => item.saldo < 0).length;

    return {
      totalReceitas,
      totalDespesas,
      saldoFinal,
      mediaReceitasMensal,
      mediaDespesasMensal,
      mesesPositivos,
      mesesNegativos
    };
  }, [fluxoCaixaData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fluxo de Caixa</h2>
          <p className="text-muted-foreground">Acompanhe o fluxo financeiro e projeções</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3meses">3 Meses</SelectItem>
              <SelectItem value="6meses">6 Meses</SelectItem>
              <SelectItem value="12meses">12 Meses</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {estatisticas && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-600">Receitas Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatMoney(estatisticas.totalReceitas)}
              </div>
              <p className="text-xs text-muted-foreground">
                Média: {formatMoney(estatisticas.mediaReceitasMensal)}/mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-red-600">Despesas Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatMoney(estatisticas.totalDespesas)}
              </div>
              <p className="text-xs text-muted-foreground">
                Média: {formatMoney(estatisticas.mediaDespesasMensal)}/mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Saldo Acumulado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${estatisticas.saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatMoney(estatisticas.saldoFinal)}
              </div>
              <p className="text-xs text-muted-foreground">
                Posição atual
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-2">
                <Badge variant="default" className="text-xs">
                  {estatisticas.mesesPositivos} + 
                </Badge>
                <Badge variant="destructive" className="text-xs">
                  {estatisticas.mesesNegativos} -
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Meses pos./neg.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={20} />
              Fluxo de Caixa Mensal
            </CardTitle>
            <CardDescription>
              Receitas, despesas e saldo por período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fluxoCaixaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis tickFormatter={(value) => formatMoney(value)} />
                <Tooltip 
                  formatter={(value: number) => formatMoney(value)}
                  labelFormatter={(label) => `Período: ${label}`}
                />
                <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
                <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign size={20} />
              Saldo Acumulado com Projeção
            </CardTitle>
            <CardDescription>
              Evolução do saldo e projeção para próximos meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={projecaoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis tickFormatter={(value) => formatMoney(value)} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatMoney(value),
                    name === 'saldoAcumulado' ? 'Saldo Acumulado' : name
                  ]}
                  labelFormatter={(label, payload) => {
                    const isProjecao = payload?.[0]?.payload?.projecao;
                    return `${label}${isProjecao ? ' (Projeção)' : ''}`;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="saldoAcumulado" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  connectNulls={false}
                  dot={(props) => {
                    const { payload } = props;
                    return (
                      <circle 
                        cx={props.cx} 
                        cy={props.cy} 
                        r={4} 
                        fill={payload?.projecao ? '#f59e0b' : 'hsl(var(--primary))'} 
                        stroke={payload?.projecao ? '#f59e0b' : 'hsl(var(--primary))'}
                        strokeWidth={2}
                      />
                    );
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="saldoAcumulado" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  connectNulls={false}
                  dot={false}
                  data={projecaoData.filter(item => item.projecao)}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo do Período</CardTitle>
          <CardDescription>
            Detalhamento mensal do fluxo de caixa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {fluxoCaixaData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="font-medium min-w-[60px]">{item.periodo}</span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-600">+{formatMoney(item.receitas)}</span>
                    <span className="text-red-600">-{formatMoney(item.despesas)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={item.saldo >= 0 ? 'default' : 'destructive'}>
                    {item.saldo >= 0 ? '+' : ''}{formatMoney(item.saldo)}
                  </Badge>
                  <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                    Acum: {formatMoney(item.saldoAcumulado)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceiroFluxoCaixa;