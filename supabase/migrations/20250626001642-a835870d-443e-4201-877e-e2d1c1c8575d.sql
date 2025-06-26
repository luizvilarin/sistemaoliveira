
-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  perfil TEXT NOT NULL CHECK (perfil IN ('admin', 'gestor', 'cuidador')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de clientes
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  contato TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('fixo', 'temporario')),
  status TEXT NOT NULL CHECK (status IN ('ativo', 'pausado', 'terceirizado')),
  endereco TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de cuidadores
CREATE TABLE public.cuidadores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  especializacao TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  cliente_id UUID REFERENCES public.clientes(id),
  disponibilidade JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de pacientes
CREATE TABLE public.pacientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id),
  cuidador_id UUID REFERENCES public.cuidadores(id),
  historico_medico TEXT,
  contrato_ativo BOOLEAN DEFAULT true,
  valor_contrato DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de transações
CREATE TABLE public.transacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id),
  valor DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('confirmado', 'aguardando', 'expirado')),
  data TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de tarefas
CREATE TABLE public.tarefas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  status TEXT NOT NULL CHECK (status IN ('todo', 'inProgress', 'done')),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id),
  cuidador_id UUID NOT NULL REFERENCES public.cuidadores(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de lembretes
CREATE TABLE public.lembretes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  dia DATE NOT NULL,
  residencia TEXT NOT NULL,
  responsavel_id UUID NOT NULL REFERENCES auth.users(id),
  cliente_id UUID REFERENCES public.clientes(id),
  cuidador_id UUID REFERENCES public.cuidadores(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de mensagens
CREATE TABLE public.mensagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  remetente_id UUID NOT NULL REFERENCES auth.users(id),
  destinatario_id UUID REFERENCES auth.users(id),
  assunto TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de notificações
CREATE TABLE public.notificacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cuidadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lembretes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Criar políticas RLS para clientes (todos podem ver, apenas admin pode modificar)
CREATE POLICY "Everyone can view clientes" ON public.clientes FOR SELECT USING (true);
CREATE POLICY "Admins can manage clientes" ON public.clientes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil = 'admin')
);

-- Criar políticas RLS para cuidadores
CREATE POLICY "Everyone can view cuidadores" ON public.cuidadores FOR SELECT USING (true);
CREATE POLICY "Admins can manage cuidadores" ON public.cuidadores FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil = 'admin')
);

-- Criar políticas RLS para pacientes
CREATE POLICY "Everyone can view pacientes" ON public.pacientes FOR SELECT USING (true);
CREATE POLICY "Admins can manage pacientes" ON public.pacientes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil = 'admin')
);

-- Criar políticas RLS para transações (apenas admin)
CREATE POLICY "Admins can view transacoes" ON public.transacoes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil = 'admin')
);
CREATE POLICY "Admins can manage transacoes" ON public.transacoes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil = 'admin')
);

-- Criar políticas RLS para tarefas
CREATE POLICY "Everyone can view tarefas" ON public.tarefas FOR SELECT USING (true);
CREATE POLICY "Admins can manage tarefas" ON public.tarefas FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil = 'admin')
);

-- Criar políticas RLS para lembretes
CREATE POLICY "Everyone can view lembretes" ON public.lembretes FOR SELECT USING (true);
CREATE POLICY "Users can manage own lembretes" ON public.lembretes FOR ALL USING (auth.uid() = responsavel_id);

-- Criar políticas RLS para mensagens
CREATE POLICY "Users can view own messages" ON public.mensagens FOR SELECT USING (
  auth.uid() = remetente_id OR auth.uid() = destinatario_id
);
CREATE POLICY "Users can send messages" ON public.mensagens FOR INSERT WITH CHECK (auth.uid() = remetente_id);
CREATE POLICY "Users can update own messages" ON public.mensagens FOR UPDATE USING (
  auth.uid() = remetente_id OR auth.uid() = destinatario_id
);

-- Criar políticas RLS para notificações
CREATE POLICY "Users can view own notifications" ON public.notificacoes FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Users can update own notifications" ON public.notificacoes FOR UPDATE USING (auth.uid() = usuario_id);

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, perfil)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'perfil', 'cuidador')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.cuidadores FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.pacientes FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.tarefas FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
