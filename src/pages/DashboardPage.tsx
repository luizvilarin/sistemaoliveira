import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import StatCard from '@/components/dashboard/StatCard';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import GrowthChart from '@/components/dashboard/GrowthChart';
import UsuarioForm from '@/components/usuarios/UsuarioForm';
import UsuariosList from '@/components/usuarios/UsuariosList';
import { 
  Users, 
  HeartPulse, 
  DollarSign, 
  Clock, 
  User,
  CalendarCheck
} from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import { Usuario } from '@/types/data';
import { userService } from '@/services/userService';
import { useToast } from '@/components/ui/use-toast';

const DashboardPage = () => {
  const { isAdmin } = useAuth();
  const { clientes, pacientes, cuidadores, transacoes, lembretes } = useData();
  const { toast } = useToast();
  
  const [isUsuarioFormOpen, setIsUsuarioFormOpen] = useState(false);
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // ... keep existing code (calculations for faturamentoDiario, tempoMedio, agendaSemana)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const faturamentoDiario = transacoes
    .filter(t => {
      const transacaoDate = new Date(t.data);
      transacaoDate.setHours(0, 0, 0, 0);
      return t.status === 'confirmado' && transacaoDate.getTime() === today.getTime();
    })
    .reduce((acc, transaction) => acc + transaction.valor, 0);

  const tempoMedio = pacientes.length > 0 ? "2.5h" : "0h";

  const inicioSemana = new Date();
  inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
  inicioSemana.setHours(0, 0, 0, 0);
  
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(fimSemana.getDate() + 6);
  fimSemana.setHours(23, 59, 59, 999);

  const agendaSemana = lembretes.filter(lembrete => {
    const lembreteDate = new Date(lembrete.dia);
    return lembreteDate >= inicioSemana && lembreteDate <= fimSemana;
  }).length;

  const loadUsers = async () => {
    if (!isAdmin) return;
    
    try {
      setLoadingUsers(true);
      const usersData = await userService.getAllUsers();
      setUsers(usersData);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar a lista de usuários.',
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const handleCloseUsuarioForm = () => {
    setIsUsuarioFormOpen(false);
  };

  const handleUsuarioFormSuccess = () => {
    loadUsers();
  };

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
            colorScheme="orange"
          />
        )}
        
        <StatCard 
          title="Tempo Médio de Atendimento" 
          value={tempoMedio} 
          icon={Clock}
          description="Por paciente" 
          colorScheme="default"
        />
        
        <StatCard 
          title="Agenda da Semana" 
          value={agendaSemana} 
          icon={CalendarCheck}
          description="Lembretes programados" 
          colorScheme="blue"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GrowthChart />        
        {isAdmin && <RecentTransactions />}
      </div>

      {/* Seção de Gestão de Usuários - Apenas para Administradores */}
      {isAdmin && (
        <UsuariosList
          users={users}
          onRefresh={loadUsers}
          onNewUser={() => setIsUsuarioFormOpen(true)}
        />
      )}

      <UsuarioForm
        isOpen={isUsuarioFormOpen}
        onClose={handleCloseUsuarioForm}
        onSuccess={handleUsuarioFormSuccess}
      />
    </div>
  );
};

export default DashboardPage;
