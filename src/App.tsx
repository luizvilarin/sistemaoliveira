
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import TransacoesPage from "./pages/TransacoesPage";
import ClientesPage from "./pages/ClientesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Rotas protegidas - requer autenticação */}
              <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/transacoes" element={<TransacoesPage />} />
                <Route path="/clientes" element={<ClientesPage />} />
                
                {/* Rotas que serão implementadas futuramente */}
                <Route path="/pacientes" element={<DashboardPage />} />
                <Route path="/cuidadores" element={<DashboardPage />} />
                <Route path="/calendario" element={<DashboardPage />} />
                <Route path="/tarefas" element={<DashboardPage />} />
                <Route path="/mensagens" element={<DashboardPage />} />
                <Route path="/relatorios" element={<DashboardPage />} />
              </Route>
              
              {/* Redirecionar para a página not found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
