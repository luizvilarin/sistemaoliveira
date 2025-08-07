
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useUserStatus } from '@/hooks/useUserStatus';
import StatCard from '@/components/dashboard/StatCard';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import GrowthChart from '@/components/dashboard/GrowthChart';
import FinancialInsights from '@/components/dashboard/FinancialInsights';
import AdminPlusNotifications from '@/components/dashboard/AdminPlusNotifications';
import UsuarioForm from '@/components/usuarios/UsuarioForm';
import UsuariosList from '@/components/usuarios/UsuariosList';
import ConvitesPendentes from '@/components/usuarios/ConvitesPendentes';
import { 
  Users, 
  HeartPulse, 
  DollarSign, 
  Clock, 
  User,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  Percent,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import { Usuario, UserInvite } from '@/types/data';
import { userService } from '@/services/userService';
import { useToast } from '@/components/ui/use-toast';

const DashboardPage = () => {
  const { isAdmin, userProfile } = useAuth();
  const { clientes, pacientes, cuidadores, transacoes, lembretes, financeiro, pagamentosFuncionarios } = useData();
  const { toast } = useToast();
  
  // Inicializar hook de status do usuário
  useUserStatus();
  
  const [isUsuarioFormOpen, setIsUsuarioFormOpen] = useState(false);
  const [users, setUsers] = useState<Usuario[]>([]);
  const [invites, setInvites] = useState<UserInvite[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const isGestor = userProfile?.perfil === 'gestor';
  const isAdminPlus = userProfile?.perfil === 'admin_plus';
  const canManageUsers = isAdmin || isGestor;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Métricas básicas
  const faturamentoDiario = transacoes
    .filter(t => {
      const transacaoDate = new Date(t.data);
      transacaoDate.setHours(0, 0, 0, 0);
      return t.status === 'confirmado' && transacaoDate.getTime() === today.getTime();
    })
    .reduce((acc, transaction) => acc + transaction.valor, 0);

  const clientesAtivos = clientes.filter(c => c.status === 'ativo').length;
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

  // Métricas avançadas para admin_plus
  const receitaMensal = isAdminPlus ? financeiro
    .filter(f => {
      const dataTransacao = new Date(f.data_transacao);
      const mesAtual = new Date().getMonth();
      const anoAtual = new Date().getFullYear();
      return dataTransacao.getMonth() === mesAtual && 
             dataTransacao.getFullYear() === anoAtual &&
             f.tipo === 'receita';
    })
    .reduce((acc, f) => acc + Number(f.valor), 0) : 0;

  const gastosMensais = isAdminPlus ? financeiro
    .filter(f => {
      const dataTransacao = new Date(f.data_transacao);
      const mesAtual = new Date().getMonth();
      const anoAtual = new Date().getFullYear();
      return dataTransacao.getMonth() === mesAtual && 
             dataTransacao.getFullYear() === anoAtual &&
             f.tipo === 'despesa';
    })
    .reduce((acc, f) => acc + Number(f.valor), 0) : 0;

  const folhaPagamento = isAdminPlus ? pagamentosFuncionarios
    .filter(p => {
      const dataPagamento = new Date(p.data_pagamento);
      const mesAtual = new Date().getMonth();
      const anoAtual = new Date().getFullYear();
      return dataPagamento.getMonth() === mesAtual && 
             dataPagamento.getFullYear() === anoAtual;
    })
    .reduce((acc, p) => acc + Number(p.valor), 0) : 0;

  const margemLucro = isAdminPlus && receitaMensal > 0 
    ? ((receitaMensal - gastosMensais - folhaPagamento) / receitaMensal) * 100 
    : 0;

  const loadUsers = async () => {
    if (!canManageUsers) return;
    
    try {
      setLoadingUsers(true);
      const [usersData, invitesData] = await Promise.all([
        userService.getAllUsers(),
        userService.getInvites()
      ]);
      setUsers(usersData);
      setInvites(invitesData.filter(invite => !invite.accepted));
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
    if (canManageUsers) {
      loadUsers();
    }
  }, [canManageUsers]);

  const handleCloseUsuarioForm = () => {
    setIsUsuarioFormOpen(false);
  };

  const handleUsuarioFormSuccess = () => {
    loadUsers();
  };

  const handleResendInvite = async (email: string, nome: string, perfil: 'admin' | 'gestor' | 'cuidador') => {
    try {
      await userService.sendInvite(email, nome, perfil, true);
      toast({
        title: 'Convite reenviado',
        description: `Convite reenviado para ${email} com sucesso!`,
      });
      loadUsers();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao reenviar convite',
        description: error.message || 'Não foi possível reenviar o convite.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-500">
          Bem-vindo ao painel de controle do Sistema de Gerenciamento de Clientes
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Total de Clientes" 
          value={clientes.length} 
          icon={Users}
          description="Clientes cadastrados" 
          colorScheme="blue"
        />
        
        <StatCard 
          title="Clientes Ativos" 
          value={clientesAtivos} 
          icon={UserCheck}
          description="Contratos ativos" 
          trend={clientesAtivos > clientes.length * 0.8 ? { direction: 'up', value: 'Excelente' } : undefined}
          colorScheme="green"
        />
        
        <StatCard 
          title="Pacientes" 
          value={pacientes.length} 
          icon={HeartPulse}
          description="Em atendimento" 
          colorScheme="purple"
        />
        
        <StatCard 
          title="Cuidadores" 
          value={cuidadores.length} 
          icon={User}
          description="Profissionais ativos" 
          colorScheme="green"
        />

        {/* Métricas financeiras básicas para admin */}
        {isAdmin && (
          <StatCard 
            title="Faturamento Diário" 
            value={formatMoney(faturamentoDiario)} 
            icon={DollarSign}
            description="Receita confirmada hoje" 
            trend={{ direction: 'up', value: '+12%' }}
            colorScheme="orange"
          />
        )}
        
        <StatCard 
          title="Agenda da Semana" 
          value={agendaSemana} 
          icon={CalendarCheck}
          description="Lembretes programados" 
          trend={agendaSemana > 10 ? { direction: 'up', value: 'Movimentada' } : undefined}
          colorScheme="blue"
        />

        {/* Métricas financeiras avançadas exclusivas para admin_plus */}
        {isAdminPlus && (
          <>
            <StatCard 
              title="Receita Mensal" 
              value={formatMoney(receitaMensal)} 
              icon={TrendingUp}
              description="Faturamento do mês" 
              trend={{ direction: 'up', value: '+8%' }}
              colorScheme="green"
            />
            
            <StatCard 
              title="Gastos Operacionais" 
              value={formatMoney(gastosMensais)} 
              icon={TrendingDown}
              description="Despesas do mês" 
              trend={{ direction: 'down', value: '-3%' }}
              colorScheme="red"
            />
            
            <StatCard 
              title="Folha de Pagamento" 
              value={formatMoney(folhaPagamento)} 
              icon={User}
              description="Pagamentos do mês" 
              colorScheme="orange"
            />
            
            <StatCard 
              title="Margem de Lucro" 
              value={`${margemLucro.toFixed(1)}%`} 
              icon={Percent}
              description="Lucratividade" 
              trend={margemLucro > 20 ? { direction: 'up', value: 'Saudável' } : { direction: 'down', value: 'Atenção' }}
              colorScheme={margemLucro > 20 ? 'green' : 'red'}
            />
          </>
        )}
      </div>
      
      {/* Gráficos e análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GrowthChart />        
        {isAdmin && <RecentTransactions />}
        {isAdminPlus && <FinancialInsights />}
        {isAdminPlus && <AdminPlusNotifications />}
      </div>

      {/* Seção de Gestão de Usuários - Para Administradores e Gestores */}
      {canManageUsers && (
        <div className="space-y-6">
          <ConvitesPendentes
            invites={invites}
            onRefresh={loadUsers}
            onResendInvite={handleResendInvite}
          />
          
          <UsuariosList
            users={users}
            onRefresh={loadUsers}
            onNewUser={() => setIsUsuarioFormOpen(true)}
            isGestor={isGestor}
          />
        </div>
      )}

      <UsuarioForm
        isOpen={isUsuarioFormOpen}
        onClose={handleCloseUsuarioForm}
        onSuccess={handleUsuarioFormSuccess}
        isGestor={isGestor}
      />
    </div>
  );
};

export default DashboardPage;
