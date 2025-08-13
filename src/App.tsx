import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { useUserActivity } from "./hooks/useUserActivity";
import { useSessionTimeout } from "./hooks/useSessionTimeout";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import TransacoesPage from "./pages/TransacoesPage";
import ClientesPage from "./pages/ClientesPage";
import PacientesPage from "./pages/PacientesPage";
import CuidadoresPage from "./pages/CuidadoresPage";
import CalendarioPage from "./pages/CalendarioPage";
import TarefasPage from "./pages/TarefasPage";
import MensagensPage from "./pages/MensagensPage";
import RelatoriosPage from "./pages/RelatoriosPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import SuportePage from "./pages/SuportePage";
import BoletosPage from "./pages/BoletosPage";
import PagamentosFuncionariosPage from "./pages/PagamentosFuncionariosPage";
import FinanceiroPage from "./pages/FinanceiroPage";
import NotFound from "./pages/NotFound";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import CompleteSignupPage from "./pages/CompleteSignupPage";

const queryClient = new QueryClient();

// Componente interno para usar os hooks
const AppContent = () => {
  useUserActivity(); // Monitora atividade dos usuários para status offline/online
  useSessionTimeout(); // Gerencia timeout de sessão por inatividade
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/complete-signup" element={<CompleteSignupPage />} />
      
      {/* Rotas protegidas - requer autenticação */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transacoes" element={<TransacoesPage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/pacientes" element={<PacientesPage />} />
        <Route path="/cuidadores" element={<CuidadoresPage />} />
        <Route path="/calendario" element={<CalendarioPage />} />
        <Route path="/tarefas" element={<TarefasPage />} />
        <Route path="/mensagens" element={<MensagensPage />} />
        <Route path="/relatorios" element={<RelatoriosPage />} />
        <Route path="/boletos" element={<BoletosPage />} />
        <Route path="/pagamentos-funcionarios" element={<PagamentosFuncionariosPage />} />
        <Route path="/financeiro" element={<FinanceiroPage />} />
        <Route path="/suporte" element={<SuportePage />} />
        <Route path="/configuracoes" element={<ConfiguracoesPage />} />
      </Route>
      
      {/* Redirecionar para a página not found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <AppContent />
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
