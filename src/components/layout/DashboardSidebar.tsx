
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
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
  Settings
} from 'lucide-react';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  adminOnly?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, adminOnly = false }) => {
  const { isAdmin } = useAuth();

  if (adminOnly && !isAdmin) {
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
  const { user, logout } = useAuth();

  return (
    <div className="h-screen w-64 bg-sidebar border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-bold text-sgc-blue-700 dark:text-sgc-blue-400">SGC</h2>
        <p className="text-sm text-gray-500">Sistema de Gerenciamento de Clientes</p>
      </div>
      
      <div className="p-4 border-b border-border">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-sgc-blue-100 text-sgc-blue-600 flex items-center justify-center">
            <User size={20} />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{user?.nome}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.perfil}</p>
          </div>
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
        <SidebarLink to="/relatorios" icon={<FileText size={18} />} label="Relatórios" />
        <SidebarLink to="/transacoes" icon={<DollarSign size={18} />} label="Transações" adminOnly={true} />
        <SidebarLink to="/configuracoes" icon={<Settings size={18} />} label="Configurações" />
      </nav>
      
      <div className="p-4 border-t border-border">
        <button 
          onClick={logout}
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
