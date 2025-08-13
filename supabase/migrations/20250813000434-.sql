-- Fix remaining database functions by adding search_path
CREATE OR REPLACE FUNCTION public.atualizar_ultima_atividade()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.ultima_atividade = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.marcar_mensagem_entregue()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.entregue = true;
  NEW.data_entrega = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_user_invite()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Verificar se existe convite para este email
  IF EXISTS (
    SELECT 1 FROM public.user_invites 
    WHERE email = NEW.email 
    AND NOT accepted 
    AND expires_at > now()
  ) THEN
    -- Atualizar perfil do usuário com dados do convite
    UPDATE public.profiles 
    SET 
      nome = (SELECT nome FROM public.user_invites WHERE email = NEW.email AND NOT accepted),
      perfil = (SELECT perfil FROM public.user_invites WHERE email = NEW.email AND NOT accepted)
    WHERE id = NEW.id;
    
    -- Marcar convite como aceito
    UPDATE public.user_invites 
    SET accepted = true 
    WHERE email = NEW.email AND NOT accepted;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_user(user_id_to_delete uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_email TEXT;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem deletar usuários';
  END IF;
  
  -- Buscar email do usuário a ser deletado
  SELECT email INTO target_email
  FROM public.profiles
  WHERE id = user_id_to_delete;
  
  -- Proteger o usuário proprietário
  IF target_email = 'luizvilarinho.nave@gmail.com' THEN
    RAISE EXCEPTION 'O usuário proprietário não pode ser deletado';
  END IF;
  
  -- Deletar usuário (cascade vai deletar o profile)
  DELETE FROM auth.users WHERE id = user_id_to_delete;
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.notificar_tarefas_pendentes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

CREATE OR REPLACE FUNCTION public.notificar_mensagem_grupo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Se for mensagem em grupo
  IF NEW.grupo_id IS NOT NULL THEN
    -- Inserir notificação para todos os membros do grupo, exceto o remetente
    INSERT INTO public.notificacoes_sistema (
      usuario_id,
      tipo,
      titulo,
      mensagem,
      grupo_id,
      mensagem_id,
      metadados
    )
    SELECT 
      mg.usuario_id,
      'mensagem_grupo',
      'Nova mensagem no grupo',
      COALESCE(gc.nome, 'Grupo') || ': ' || LEFT(NEW.conteudo, 50) || CASE WHEN LENGTH(NEW.conteudo) > 50 THEN '...' ELSE '' END,
      NEW.grupo_id,
      NEW.id,
      jsonb_build_object(
        'remetente_id', NEW.remetente_id,
        'grupo_nome', gc.nome,
        'tipo_mensagem', NEW.tipo_mensagem
      )
    FROM public.membros_grupo mg
    JOIN public.grupos_chat gc ON gc.id = mg.grupo_id
    WHERE mg.grupo_id = NEW.grupo_id 
    AND mg.usuario_id != NEW.remetente_id;
    
  -- Se for mensagem individual
  ELSIF NEW.destinatario_id IS NOT NULL THEN
    -- Inserir notificação apenas para o destinatário
    INSERT INTO public.notificacoes_sistema (
      usuario_id,
      tipo,
      titulo,
      mensagem,
      mensagem_id,
      metadados
    ) VALUES (
      NEW.destinatario_id,
      'mensagem_individual',
      'Nova mensagem',
      LEFT(NEW.conteudo, 100) || CASE WHEN LENGTH(NEW.conteudo) > 100 THEN '...' ELSE '' END,
      NEW.id,
      jsonb_build_object(
        'remetente_id', NEW.remetente_id,
        'tipo_mensagem', NEW.tipo_mensagem
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.criar_lembretes_boletos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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