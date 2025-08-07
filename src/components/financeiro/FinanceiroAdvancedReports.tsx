import React, { useMemo, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, PieChart as PieChartIcon, BarChart3, Calendar } from 'lucide-react';
import { formatMoney } from '@/lib/utils';

const FinanceiroAdvancedReports = () => {
  const { financeiro } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('mes');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const filteredData = useMemo(() => {
    const currentDate = new Date();
    return financeiro.filter(item => {
      const itemDate = new Date(item.data_transacao);
      const itemYear = itemDate.getFullYear();
      
      if (selectedPeriod === 'ano') {
        return itemYear.toString() === selectedYear;
      } else if (selectedPeriod === 'mes') {
        return itemYear === currentDate.getFullYear() && 
               itemDate.getMonth() === currentDate.getMonth();
      } else if (selectedPeriod === 'trimestre') {
        const currentQuarter = Math.floor(currentDate.getMonth() / 3);
        const itemQuarter = Math.floor(itemDate.getMonth() / 3);
        return itemYear === currentDate.getFullYear() && 
               itemQuarter === currentQuarter;
      }
      return true;
    });
  }, [financeiro, selectedPeriod, selectedYear]);

  const categoryData = useMemo(() => {
    const receitas = filteredData.filter(item => item.tipo === 'receita');
    const despesas = filteredData.filter(item => item.tipo === 'despesa');
    
    const receitasByCategory = receitas.reduce((acc, item) => {
      acc[item.categoria] = (acc[item.categoria] || 0) + Number(item.valor);
      return acc;
    }, {} as Record<string, number>);

    const despesasByCategory = despesas.reduce((acc, item) => {
      acc[item.categoria] = (acc[item.categoria] || 0) + Number(item.valor);
      return acc;
    }, {} as Record<string, number>);

    return { receitasByCategory, despesasByCategory };
  }, [filteredData]);

  const monthlyTrend = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(parseInt(selectedYear), i, 1);
      const monthData = financeiro.filter(item => {
        const itemDate = new Date(item.data_transacao);
        return itemDate.getMonth() === i && itemDate.getFullYear() === parseInt(selectedYear);
      });

      const receitas = monthData.filter(item => item.tipo === 'receita')
        .reduce((sum, item) => sum + Number(item.valor), 0);
      const despesas = monthData.filter(item => item.tipo === 'despesa')
        .reduce((sum, item) => sum + Number(item.valor), 0);

      return {
        mes: date.toLocaleDateString('pt-BR', { month: 'short' }),
        receitas,
        despesas,
        saldo: receitas - despesas
      };
    });

    return months;
  }, [financeiro, selectedYear]);

  const centerCostData = useMemo(() => {
    const centerCosts = filteredData.reduce((acc, item) => {
      const centro = (item as any).centro_custo || 'Não especificado';
      if (!acc[centro]) {
        acc[centro] = { receitas: 0, despesas: 0 };
      }
      if (item.tipo === 'receita') {
        acc[centro].receitas += Number(item.valor);
      } else {
        acc[centro].despesas += Number(item.valor);
      }
      return acc;
    }, {} as Record<string, { receitas: number; despesas: number }>);

    return Object.entries(centerCosts).map(([centro, valores]) => ({
      centro,
      receitas: valores.receitas,
      despesas: valores.despesas,
      saldo: valores.receitas - valores.despesas
    }));
  }, [filteredData]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4'];

  const preparePieData = (data: Record<string, number>) => {
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Relatórios Avançados</h2>
          <p className="text-muted-foreground">Análise detalhada das finanças</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes">Mês Atual</SelectItem>
              <SelectItem value="trimestre">Trimestre</SelectItem>
              <SelectItem value="ano">Ano</SelectItem>
            </SelectContent>
          </Select>
          {selectedPeriod === 'ano' && (
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <Tabs defaultValue="categorias" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="categorias">Por Categoria</TabsTrigger>
          <TabsTrigger value="tendencia">Tendência</TabsTrigger>
          <TabsTrigger value="centro-custo">Centro de Custo</TabsTrigger>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
        </TabsList>

        <TabsContent value="categorias" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <PieChartIcon size={20} />
                  Receitas por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={preparePieData(categoryData.receitasByCategory)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {preparePieData(categoryData.receitasByCategory).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatMoney(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <PieChartIcon size={20} />
                  Despesas por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={preparePieData(categoryData.despesasByCategory)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {preparePieData(categoryData.despesasByCategory).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatMoney(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tendencia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={20} />
                Tendência Mensal ({selectedYear})
              </CardTitle>
              <CardDescription>
                Evolução das receitas, despesas e saldo ao longo do ano
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={(value) => formatMoney(value)} />
                  <Tooltip formatter={(value: number) => formatMoney(value)} />
                  <Line type="monotone" dataKey="receitas" stroke="#10b981" strokeWidth={2} name="Receitas" />
                  <Line type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={2} name="Despesas" />
                  <Line type="monotone" dataKey="saldo" stroke="hsl(var(--primary))" strokeWidth={3} name="Saldo" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="centro-custo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={20} />
                Análise por Centro de Custo
              </CardTitle>
              <CardDescription>
                Receitas e despesas organizadas por centro de custo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={centerCostData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="centro" />
                  <YAxis tickFormatter={(value) => formatMoney(value)} />
                  <Tooltip formatter={(value: number) => formatMoney(value)} />
                  <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
                  <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {centerCostData.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-muted rounded-lg">
                    <span className="font-medium">{item.centro}</span>
                    <Badge variant={item.saldo >= 0 ? 'default' : 'destructive'}>
                      {formatMoney(item.saldo)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resumo" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-600">Total de Receitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatMoney(filteredData.filter(item => item.tipo === 'receita')
                    .reduce((sum, item) => sum + Number(item.valor), 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {filteredData.filter(item => item.tipo === 'receita').length} transações
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-red-600">Total de Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatMoney(filteredData.filter(item => item.tipo === 'despesa')
                    .reduce((sum, item) => sum + Number(item.valor), 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {filteredData.filter(item => item.tipo === 'despesa').length} transações
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Saldo do Período</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const receitas = filteredData.filter(item => item.tipo === 'receita').reduce((sum, item) => sum + Number(item.valor), 0);
                  const despesas = filteredData.filter(item => item.tipo === 'despesa').reduce((sum, item) => sum + Number(item.valor), 0);
                  const saldo = receitas - despesas;
                  return (
                    <>
                      <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatMoney(saldo)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {filteredData.length} transações totais
                      </p>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tags Mais Utilizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const tagCount = filteredData.reduce((acc, item) => {
                    const tags = (item as any).tags;
                    if (tags) {
                      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
                      tagArray.forEach((tag: string) => {
                        const trimmedTag = tag.trim();
                        if (trimmedTag) {
                          acc[trimmedTag] = (acc[trimmedTag] || 0) + 1;
                        }
                      });
                    }
                    return acc;
                  }, {} as Record<string, number>);

                  return Object.entries(tagCount)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([tag, count]) => (
                      <Badge key={tag} variant="secondary">
                        {tag} ({count})
                      </Badge>
                    ));
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceiroAdvancedReports;