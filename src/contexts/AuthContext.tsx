
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  nome: string;
  email: string;
  perfil: 'admin' | 'gestor' | 'cuidador';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data para demonstração (simulando um banco de dados)
const MOCK_USERS = [
  {
    id: '1',
    nome: 'Administrador',
    email: 'admin@sgc.com',
    senha: 'admin123',
    perfil: 'admin',
  },
  {
    id: '2',
    nome: 'Gestor',
    email: 'gestor@sgc.com',
    senha: 'gestor123',
    perfil: 'gestor',
  },
  {
    id: '3',
    nome: 'Cuidador',
    email: 'cuidador@sgc.com',
    senha: 'cuidador123',
    perfil: 'cuidador',
  },
];

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se há um token salvo no localStorage
    const savedToken = localStorage.getItem('sgcToken');
    const savedUser = localStorage.getItem('sgcUser');
    
    if (savedToken && savedUser) {
      try {
        // Simulating token verification
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erro ao recuperar sessão:', error);
        localStorage.removeItem('sgcToken');
        localStorage.removeItem('sgcUser');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Simulação de login (em produção, seria uma chamada API)
      const foundUser = MOCK_USERS.find(
        (u) => u.email === email && u.senha === password
      );

      if (!foundUser) {
        throw new Error('Credenciais inválidas');
      }

      // Gerar um token simulado
      const simulatedToken = `mock-jwt-token-${Date.now()}`;
      
      // Omitir senha antes de salvar no state e localStorage
      const { senha, ...userWithoutPassword } = foundUser;
      const userObj = userWithoutPassword as User;
      
      // Guardar token e dados do usuário
      setToken(simulatedToken);
      setUser(userObj);
      
      localStorage.setItem('sgcToken', simulatedToken);
      localStorage.setItem('sgcUser', JSON.stringify(userObj));

      toast({
        title: "Login bem-sucedido",
        description: `Bem-vindo, ${userObj.nome}!`,
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: error.message || 'Ocorreu um erro ao fazer login',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sgcToken');
    localStorage.removeItem('sgcUser');
    navigate('/login');
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const isAdmin = user?.perfil === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
