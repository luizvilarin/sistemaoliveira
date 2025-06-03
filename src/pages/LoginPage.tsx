
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';

const LoginPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-sgc-blue-700 mb-2">SGC</h1>
        <p className="text-lg text-gray-600">Sistema de Gerenciamento de Clientes</p>
      </div>
      
      <LoginForm />
      
      <div className="mt-8 text-center max-w-md">
        <Separator className="mb-4" />
        <p className="text-sm text-gray-500">
          Sistema desenvolvido para gerenciamento de clientes, pacientes e cuidadores.
          Acesso exclusivo para usuários autorizados.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
