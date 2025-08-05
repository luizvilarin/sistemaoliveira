-- Atualizar enum de perfis para incluir admin+
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'admin_plus';

-- Criar tabela para informações detalhadas dos boletos
CREATE TABLE public.boletos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  valor DECIMAL(10,2) NOT NULL,
  tipo_plantao TEXT NOT NULL CHECK (tipo_plantao IN ('4h', '6h', '8h', '10h', '12h', '15h', '24h', 'personalizado')),
  valor_personalizado DECIMAL(10,2) NULL,
  dia_vencimento INTEGER NOT NULL CHECK (dia_vencimento >= 1 AND dia_vencimento <= 31),
  cuidadoras TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'pago', 'vencido')),
  data_envio DATE NULL,
  data_pagamento DATE NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adicionar informações para nota fiscal na tabela clientes
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS nome_completo TEXT;

-- Criar tabela para pagamentos de funcionários
CREATE TABLE public.pagamentos_funcionarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cuidador_id UUID NOT NULL REFERENCES public.cuidadores(id) ON DELETE CASCADE,
  valor DECIMAL(10,2) NOT NULL,
  data_pagamento DATE NOT NULL,
  referencia TEXT NOT NULL, -- Ex: "Janeiro 2024", "Plantão 15/01 - Cliente X"
  tipo_pagamento TEXT NOT NULL DEFAULT 'salario' CHECK (tipo_pagamento IN ('salario', 'plantao', 'bonus', 'outros')),
  descricao TEXT,
  status TEXT NOT NULL DEFAULT 'pago' CHECK (status IN ('pendente', 'pago', 'cancelado')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela para controle de receitas e despesas (admin+)
CREATE TABLE public.financeiro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  categoria TEXT NOT NULL, -- Ex: "pagamento_cliente", "salario_funcionario", "custo_operacional"
  valor DECIMAL(10,2) NOT NULL,
  descricao TEXT NOT NULL,
  data_transacao DATE NOT NULL,
  referencia_id UUID NULL, -- Referência para boleto, pagamento, etc.
  referencia_tipo TEXT NULL, -- "boleto", "pagamento_funcionario", etc.
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS para as novas tabelas
ALTER TABLE public.boletos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos_funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para boletos
CREATE POLICY "Admin e admin+ podem gerenciar todos os boletos"
ON public.boletos FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND perfil IN ('admin', 'admin_plus')
  )
);

CREATE POLICY "Gestores podem visualizar boletos"
ON public.boletos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND perfil IN ('admin', 'admin_plus', 'gestor')
  )
);

-- Políticas RLS para pagamentos de funcionários
CREATE POLICY "Admin+ pode gerenciar todos os pagamentos"
ON public.pagamentos_funcionarios FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND perfil = 'admin_plus'
  )
);

CREATE POLICY "Cuidadores podem ver seus próprios pagamentos"
ON public.pagamentos_funcionarios FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cuidadores c
    JOIN public.profiles p ON c.email = p.email
    WHERE c.id = pagamentos_funcionarios.cuidador_id
    AND p.id = auth.uid()
  )
);

-- Políticas RLS para financeiro (apenas admin+)
CREATE POLICY "Apenas admin+ pode acessar financeiro"
ON public.financeiro FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND perfil = 'admin_plus'
  )
);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_boletos_updated_at
  BEFORE UPDATE ON public.boletos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_pagamentos_funcionarios_updated_at
  BEFORE UPDATE ON public.pagamentos_funcionarios
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_financeiro_updated_at
  BEFORE UPDATE ON public.financeiro
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Função para verificar se usuário é admin+
CREATE OR REPLACE FUNCTION public.is_current_user_admin_plus()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND perfil = 'admin_plus'
  );
$$;

-- Criar lembretes automáticos para boletos
CREATE OR REPLACE FUNCTION public.criar_lembretes_boletos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Criar lembretes para boletos que vencem nos próximos 3 dias
  INSERT INTO public.lembretes (
    titulo,
    descricao,
    dia,
    hora,
    responsavel_id,
    cliente_id,
    tipo,
    urgente
  )
  SELECT 
    'Enviar boleto - ' || c.nome,
    'Lembrete para enviar boleto no valor de R$ ' || b.valor::text || ' (' || b.tipo_plantao || ')',
    CASE 
      WHEN b.dia_vencimento <= EXTRACT(DAY FROM CURRENT_DATE) 
      THEN DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '1 day' * (b.dia_vencimento - 1)
      ELSE DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 day' * (b.dia_vencimento - 1)
    END,
    '09:00:00'::time,
    (SELECT id FROM public.profiles WHERE perfil IN ('admin', 'admin_plus') LIMIT 1),
    b.cliente_id,
    'boleto',
    false
  FROM public.boletos b
  JOIN public.clientes c ON b.cliente_id = c.id
  WHERE b.status = 'pendente'
  AND NOT EXISTS (
    SELECT 1 FROM public.lembretes l
    WHERE l.cliente_id = b.cliente_id
    AND l.tipo = 'boleto'
    AND l.dia >= CURRENT_DATE
    AND l.dia <= CURRENT_DATE + INTERVAL '30 days'
  );
END;
$$;