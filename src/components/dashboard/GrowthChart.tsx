
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GrowthChart: React.FC = () => {
  const { clientes } = useData();

  // Criação dos dados do gráfico (simulado para demonstração)
  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    // Gera dados para os últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleString('pt-BR', { month: 'short' });
      
      // Simula o crescimento de clientes fixos e temporários ao longo do tempo
      const baseFixos = Math.floor(15 + i * 3 + Math.random() * 5);
      const baseTemporarios = Math.floor(8 + i * 2 + Math.random() * 5);
      
      data.push({
        name: monthName,
        fixo: baseFixos,
        temporario: baseTemporarios,
      });
    }
    
    return data;
  }, [clientes]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Crescimento de Clientes</CardTitle>
      </CardHeader>
      <CardContent>
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
