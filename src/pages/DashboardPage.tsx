
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import StatCard from '@/components/dashboard/StatCard';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import GrowthChart from '@/components/dashboard/GrowthChart';
import UsuarioForm from '@/components/usuarios/UsuarioForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  HeartPulse, 
  DollarSign, 
  Clock, 
  User,
  CalendarCheck,
  Plus,
  Edit,
  UserPlus
} from 'lucide-react';
import { formatMoney } from '@/lib/utils';

// Mock data para usuários do sistema
const mockUsuarios = [
  { id: '1', nome: 'Administrador', email: 'admin@sgc.com', perfil: 'admin', ativo: true },
  { id: '2', nome: 'Gestor Silva', email: 'gestor@sgc.com', perfil: 'gestor', ativo: true },
  { id: '3', nome: 'Cuidador Santos', email: 'cuidador@sgc.com', perfil: 'cuidador', ativo: true },
  { id: '4', nome: 'Maria Oliveira', email: 'maria@sgc.com', perfil: 'cuidador', ativo: false },
];

const DashboardPage = () => {
  const { isAdmin } = useAuth();
  const { clientes, pacientes, cuidadores, transacoes } = useData();
  const [isUsuarioFormOpen, setIsUsuarioFormOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  
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

  const handleEditUsuario = (usuario: any) => {
    setEditingUsuario(usuario);
    setIsUsuarioFormOpen(true);
  };

  const handleCloseUsuarioForm = () => {
    setIsUsuarioFormOpen(false);
    setEditingUsuario(null);
  };

  const getPerfilBadge = (perfil: string) => {
    switch (perfil) {
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      case 'gestor':
        return <Badge variant="default">Gestor</Badge>;
      case 'cuidador':
        return <Badge variant="secondary">Cuidador</Badge>;
      default:
        return <Badge variant="outline">{perfil}</Badge>;
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

      {/* Seção de Gestão de Usuários - Apenas para Administradores */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Gestão de Usuários
              </CardTitle>
              <Button onClick={() => setIsUsuarioFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{usuario.nome}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>{getPerfilBadge(usuario.perfil)}</TableCell>
                    <TableCell>
                      <Badge variant={usuario.ativo ? "default" : "secondary"}>
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUsuario(usuario)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <UsuarioForm
        isOpen={isUsuarioFormOpen}
        onClose={handleCloseUsuarioForm}
        usuarioToEdit={editingUsuario}
      />
    </div>
  );
};

export default DashboardPage;
