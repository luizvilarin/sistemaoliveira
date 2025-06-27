
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GrowthChart: React.FC = () => {
  const { clientes } = useData();

  const chartData = useMemo(() => {
    if (clientes.length === 0) {
      return [];
    }

    // Agrupar clientes por mês baseado na data de criação
    const clientesPorMes = clientes.reduce((acc, cliente) => {
      const date = new Date(cliente.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { fixo: 0, temporario: 0 };
      }
      
      if (cliente.tipo === 'fixo') {
        acc[monthKey].fixo++;
      } else {
        acc[monthKey].temporario++;
      }
      
      return acc;
    }, {} as Record<string, { fixo: number; temporario: number }>);

    // Converter para array e ordenar por data
    return Object.entries(clientesPorMes)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Últimos 6 meses
      .map(([monthKey, counts]) => {
        const [year, month] = monthKey.split('-');
        const monthName = new Date(parseInt(year), parseInt(month) - 1, 1)
          .toLocaleString('pt-BR', { month: 'short' });
        
        return {
          name: monthName,
          fixo: counts.fixo,
          temporario: counts.temporario,
        };
      });
  }, [clientes]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Crescimento de Clientes</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value, name) => [value, name === 'fixo' ? 'Fixos' : 'Temporários']}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="fixo" 
                  stackId="1"
                  stroke="#2563eb" 
                  fill="#3b82f6" 
                  fillOpacity={0.6} 
                  name="Fixos"
                />
                <Area 
                  type="monotone" 
                  dataKey="temporario" 
                  stackId="2" 
                  stroke="#10b981" 
                  fill="#34d399" 
                  fillOpacity={0.6} 
                  name="Temporários"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p>Nenhum dado disponível</p>
              <p className="text-sm">Adicione clientes para ver o gráfico</p>
            </div>
          </div>
        )}
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-sgc-blue-500 mr-1"></div>
            <span className="text-sm">Clientes Fixos</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-sgc-green-500 mr-1"></div>
            <span className="text-sm">Clientes Temporários</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GrowthChart;
