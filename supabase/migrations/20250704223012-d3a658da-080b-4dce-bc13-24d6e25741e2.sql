-- Criar tabela para solicitações de suporte
CREATE TABLE public.support_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL,
  assunto text NOT NULL,
  mensagem text NOT NULL,
  status text DEFAULT 'pendente',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários autenticados criem solicitações
CREATE POLICY "Authenticated users can create support requests" 
ON public.support_requests 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Política para que admins possam ver todas as solicitações
CREATE POLICY "Admins can view all support requests" 
ON public.support_requests 
FOR SELECT 
TO authenticated 
USING (is_current_user_admin());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_support_requests_updated_at
  BEFORE UPDATE ON public.support_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Função para criar notificações de tarefas com prazo próximo
CREATE OR REPLACE FUNCTION public.notificar_tarefas_pendentes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Criar notificações para tarefas que estão há mais de 1 dia pendentes
  INSERT INTO public.notificacoes_sistema (
    usuario_id,
    tipo,
    titulo,
    mensagem,
    metadados
  )
  SELECT DISTINCT
    c.id as usuario_id,
    'tarefa_pendente',
    'Tarefa pendente há mais de 1 dia',
    'A tarefa "' || t.titulo || '" está pendente há mais de 1 dia. Verifique se precisa de atenção.',
    jsonb_build_object('tarefa_id', t.id, 'cliente_nome', cl.nome)
  FROM public.tarefas t
  JOIN public.cuidadores cu ON t.cuidador_id = cu.id
  JOIN public.profiles c ON cu.email = c.email
  JOIN public.clientes cl ON t.cliente_id = cl.id
  WHERE t.status = 'todo'
    AND t.created_at < (now() - interval '1 day')
    AND NOT EXISTS (
      SELECT 1 FROM public.notificacoes_sistema ns
      WHERE ns.usuario_id = c.id
        AND ns.tipo = 'tarefa_pendente'
        AND ns.metadados->>'tarefa_id' = t.id::text
        AND ns.created_at > (now() - interval '1 day')
    );

  -- Criar notificações para tarefas em progresso há mais de 2 dias
  INSERT INTO public.notificacoes_sistema (
    usuario_id,
    tipo,
    titulo,
    mensagem,
    metadados
  )
  SELECT DISTINCT
    c.id as usuario_id,
    'tarefa_atrasada',
    'Tarefa em progresso há muito tempo',
    'A tarefa "' || t.titulo || '" está em progresso há mais de 2 dias. Considere finalizá-la.',
    jsonb_build_object('tarefa_id', t.id, 'cliente_nome', cl.nome)
  FROM public.tarefas t
  JOIN public.cuidadores cu ON t.cuidador_id = cu.id
  JOIN public.profiles c ON cu.email = c.email
  JOIN public.clientes cl ON t.cliente_id = cl.id
  WHERE t.status = 'inProgress'
    AND t.updated_at < (now() - interval '2 days')
    AND NOT EXISTS (
      SELECT 1 FROM public.notificacoes_sistema ns
      WHERE ns.usuario_id = c.id
        AND ns.tipo = 'tarefa_atrasada'
        AND ns.metadados->>'tarefa_id' = t.id::text
        AND ns.created_at > (now() - interval '1 day')
    );
END;
$$;