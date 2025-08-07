
import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserStatus } from '@/hooks/useUserStatus';
import UserStatusSelector from '@/components/usuarios/UserStatusSelector';
import { 
  User, 
  LayoutDashboard, 
  Users, 
  HeartPulse, 
  Calendar, 
  MessageSquare, 
  FileText,
  DollarSign,
  LogOut,
  List,
  Settings,
  HelpCircle
} from 'lucide-react';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  adminOnly?: boolean;
  gestorAndAdminOnly?: boolean;
  excludeCuidador?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ 
  to, 
  icon, 
  label, 
  adminOnly = false, 
  gestorAndAdminOnly = false,
  excludeCuidador = false 
}) => {
  const authContext = useContext(AuthContext);
  
  // Proteção contra renderização fora do AuthProvider
  if (!authContext) {
    console.error('SidebarLink sendo renderizado fora do AuthProvider');
    return null;
  }
  
  const { userProfile } = authContext;
  const perfil = userProfile?.perfil;

  // Admin pode ver tudo
  if (adminOnly && !['admin', 'admin_plus'].includes(perfil || '')) {
    return null;
  }

  // Gestor e Admin podem ver
  if (gestorAndAdminOnly && !['admin', 'admin_plus', 'gestor'].includes(perfil || '')) {
    return null;
  }

  // Excluir cuidador
  if (excludeCuidador && perfil === 'cuidador') {
    return null;
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "sgc-navbar-item text-sm font-medium transition-colors",
          isActive ? "sgc-navbar-item-active" : ""
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  );
};

const DashboardSidebar = () => {
  const authContext = useContext(AuthContext);
  
  // Proteção contra renderização fora do AuthProvider
  if (!authContext) {
    console.error('DashboardSidebar sendo renderizado fora do AuthProvider');
    return null;
  }
  
  const { userProfile, signOut } = authContext;
  const { setUserStatus } = useUserStatus();
  const [currentStatus, setCurrentStatus] = useState<'online' | 'offline' | 'ausente' | 'ocupado'>(
    userProfile?.status_online as 'online' | 'offline' | 'ausente' | 'ocupado' || 'online'
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleStatusChange = (newStatus: 'online' | 'offline' | 'ausente' | 'ocupado') => {
    setCurrentStatus(newStatus);
  };

  return (
    <div className="h-screen w-64 bg-sidebar border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-bold text-sgc-blue-700 dark:text-sgc-blue-400">SGC</h2>
        <p className="text-sm text-gray-500">Sistema de Gerenciamento de Clientes</p>
      </div>
      
      <div className="p-4 border-b border-border">
        <div className="flex items-center">
          <Avatar className="w-10 h-10">
            <AvatarImage src={userProfile?.avatar_url || ''} alt={userProfile?.nome || ''} />
            <AvatarFallback className="bg-sgc-blue-100 text-sgc-blue-600">
              {userProfile?.nome ? getInitials(userProfile.nome) : <User size={20} />}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{userProfile?.nome || 'Usuário'}</p>
            <p className="text-xs text-gray-500 capitalize">{userProfile?.perfil || 'cuidador'}</p>
          </div>
        </div>
        
        <div className="mt-3">
          <UserStatusSelector 
            currentStatus={currentStatus} 
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <SidebarLink to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
        <SidebarLink to="/clientes" icon={<Users size={18} />} label="Clientes" />
        <SidebarLink to="/pacientes" icon={<HeartPulse size={18} />} label="Pacientes" />
        <SidebarLink to="/cuidadores" icon={<User size={18} />} label="Cuidadores" />
        <SidebarLink to="/calendario" icon={<Calendar size={18} />} label="Calendário" />
        <SidebarLink to="/tarefas" icon={<List size={18} />} label="Tarefas" />
        <SidebarLink to="/mensagens" icon={<MessageSquare size={18} />} label="Mensagens" />
        <SidebarLink 
          to="/relatorios" 
          icon={<FileText size={18} />} 
          label="Relatórios" 
          excludeCuidador={true}
        />
        <SidebarLink 
          to="/transacoes" 
          icon={<DollarSign size={18} />} 
          label="Transações" 
          adminOnly={true} 
        />
        <SidebarLink 
          to="/boletos" 
          icon={<FileText size={18} />} 
          label="Boletos" 
          gestorAndAdminOnly={true}
        />
        <SidebarLink 
          to="/pagamentos-funcionarios" 
          icon={<DollarSign size={18} />} 
          label="Pagamentos" 
          adminOnly={true}
        />
        <SidebarLink 
          to="/financeiro" 
          icon={<DollarSign size={18} />} 
          label="Financeiro" 
          adminOnly={true}
        />
        <SidebarLink to="/suporte" icon={<HelpCircle size={18} />} label="Suporte" />
        <SidebarLink to="/configuracoes" icon={<Settings size={18} />} label="Configurações" />
      </nav>
      
      <div className="p-4 border-t border-border">
        <button 
          onClick={signOut}
          className="sgc-navbar-item w-full text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
