
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import StatCard from '@/components/dashboard/StatCard';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import GrowthChart from '@/components/dashboard/GrowthChart';
import { 
  Users, 
  HeartPulse, 
  DollarSign, 
  Clock, 
  User,
  CalendarCheck
} from 'lucide-react';
import { formatMoney } from '@/lib/utils';

const DashboardPage = () => {
  const { isAdmin } = useAuth();
  const { clientes, pacientes, cuidadores, transacoes } = useData();
  
  // Calcular o número de clientes fixos e temporários
  const clientesFixos = clientes.filter(c => c.tipo === 'fixo').length;
  const clientesTemporarios = clientes.filter(c => c.tipo === 'temporario').length;
  
  // Calcular o faturamento diário (apenas para administradores)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const faturamentoDiario = transacoes
    .filter(t => {
      const transacaoDate = new Date(t.data);
      transacaoDate.setHours(0, 0, 0, 0);
      return t.status === 'confirmado' && transacaoDate.getTime() === today.getTime();
    })
    .reduce((acc, transaction) => acc + transaction.valor, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-500">
          Bem-vindo ao painel de controle do Sistema de Gerenciamento de Clientes
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard 
          title="Total de Clientes" 
          value={clientes.length} 
          icon={Users}
          description="Clientes cadastrados no sistema" 
          colorScheme="blue"
        />
        
        <StatCard 
          title="Pacientes" 
          value={pacientes.length} 
          icon={HeartPulse}
          description="Pacientes em atendimento" 
          colorScheme="purple"
        />
        
        <StatCard 
          title="Cuidadores" 
          value={cuidadores.length} 
          icon={User}
          description="Profissionais disponíveis" 
          colorScheme="green"
        />
        
        {isAdmin && (
          <StatCard 
            title="Faturamento Diário" 
            value={formatMoney(faturamentoDiario)} 
            icon={DollarSign}
            description="Receita confirmada hoje" 
            trend={{ 
              direction: 'up', 
              value: '12%' 
            }}
            colorScheme="orange"
          />
        )}
        
        <StatCard 
          title="Tempo Médio de Atendimento" 
          value="2.5h" 
          icon={Clock}
          description="Por paciente" 
          colorScheme="default"
        />
        
        <StatCard 
          title="Agenda da Semana" 
          value="15" 
          icon={CalendarCheck}
          description="Visitas programadas" 
          colorScheme="blue"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GrowthChart />
        
        {isAdmin && <RecentTransactions />}
      </div>
    </div>
  );
};

export default DashboardPage;
