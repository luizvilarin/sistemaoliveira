-- Fix remaining database functions
CREATE OR REPLACE FUNCTION public.criar_notificacao_lembrete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Criar notificação quando um lembrete é criado
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notificacoes_sistema (
      usuario_id,
      tipo,
      titulo,
      mensagem,
      data_vencimento,
      acao_url,
      metadados
    ) VALUES (
      NEW.responsavel_id,
      'lembrete',
      'Novo lembrete criado',
      'Lembrete "' || NEW.titulo || '" foi criado para ' || NEW.dia::text,
      NEW.dia::timestamp with time zone,
      '/calendario',
      jsonb_build_object('lembrete_id', NEW.id, 'urgente', NEW.urgente)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.criar_lembretes_boletos_automaticos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Criar lembretes para boletos que vencem nos próximos 3 dias e não têm lembretes criados
  INSERT INTO public.lembretes (
    titulo,
    descricao,
    dia,
    hora,
    responsavel_id,
    cliente_id,
    tipo,
    urgente,
    residencia
  )
  SELECT 
    'Enviar boleto - ' || c.nome,
    'Lembrete para enviar boleto no valor de R$ ' || 
    COALESCE(b.valor_personalizado, b.valor)::text || 
    ' (' || b.tipo_plantao || '). Vence dia ' || b.dia_vencimento::text,
    CASE 
      WHEN b.dia_vencimento <= EXTRACT(DAY FROM CURRENT_DATE) 
      THEN DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '1 day' * (b.dia_vencimento - 3)
      ELSE DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 day' * (b.dia_vencimento - 3)
    END,
    '09:00:00'::time,
    (SELECT id FROM public.profiles WHERE perfil IN ('admin', 'admin_plus') ORDER BY created_at LIMIT 1),
    b.cliente_id,
    'boleto',
    CASE WHEN b.dia_vencimento <= EXTRACT(DAY FROM CURRENT_DATE) + 1 THEN true ELSE false END,
    COALESCE(c.endereco, 'Não especificado')
  FROM public.boletos b
  JOIN public.clientes c ON b.cliente_id = c.id
  WHERE b.status IN ('pendente', 'enviado')
  AND NOT EXISTS (
    SELECT 1 FROM public.lembretes l
    WHERE l.cliente_id = b.cliente_id
    AND l.tipo = 'boleto'
    AND l.dia >= CURRENT_DATE
    AND l.dia <= CURRENT_DATE + INTERVAL '30 days'
    AND l.descricao LIKE '%' || b.tipo_plantao || '%'
  );

  -- Atualizar status dos boletos vencidos
  UPDATE public.boletos 
  SET status = 'vencido', updated_at = now()
  WHERE status IN ('pendente', 'enviado')
  AND (
    CASE 
      WHEN dia_vencimento <= EXTRACT(DAY FROM CURRENT_DATE)
      THEN DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 day' * (dia_vencimento - 1)
      ELSE DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '1 day' * (dia_vencimento - 1)
    END
  ) < CURRENT_DATE;
END;
$$;

CREATE OR REPLACE FUNCTION public.executar_automacao_boletos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM public.criar_lembretes_boletos_automaticos();
END;
$$;

CREATE OR REPLACE FUNCTION public.atualizar_datas_status_boleto()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- Atualizar datas baseado no novo status
  CASE NEW.status
    WHEN 'solicitado' THEN
      NEW.data_solicitacao = CURRENT_DATE;
    WHEN 'enviado' THEN
      NEW.data_envio_boleto = CURRENT_DATE;
      NEW.data_envio = CURRENT_DATE; -- manter compatibilidade
    WHEN 'pago' THEN
      NEW.data_confirmacao_pago = CURRENT_DATE;
      NEW.data_pagamento = CURRENT_DATE; -- manter compatibilidade
  END CASE;

  -- Definir cores baseado no status
  CASE NEW.status
    WHEN 'pendente' THEN NEW.cor_status = '#f59e0b'; -- amber
    WHEN 'solicitado' THEN NEW.cor_status = '#3b82f6'; -- blue  
    WHEN 'enviado' THEN NEW.cor_status = '#8b5cf6'; -- purple
    WHEN 'pago' THEN NEW.cor_status = '#10b981'; -- green
    WHEN 'vencido' THEN NEW.cor_status = '#ef4444'; -- red
    WHEN 'cancelado' THEN NEW.cor_status = '#6b7280'; -- gray
  END CASE;

  -- Calcular próxima data de cobrança se for recorrente e foi pago
  IF NEW.recorrente = true AND NEW.status = 'pago' AND (OLD.status IS NULL OR OLD.status != 'pago') THEN
    CASE NEW.frequencia_recorrencia
      WHEN 'quinzenal' THEN
        -- Para quinzenal, próxima cobrança é 15 dias após a atual
        NEW.proxima_data_cobranca = NEW.data_confirmacao_pago + INTERVAL '15 days';
      WHEN 'mensal' THEN
        -- Para mensal, próxima cobrança é no mesmo dia do próximo mês
        NEW.proxima_data_cobranca = (NEW.data_confirmacao_pago + INTERVAL '1 month')::date;
      WHEN 'personalizado' THEN
        -- Para personalizado, usar o dia_cobranca_secundario se definido
        IF NEW.dia_cobranca_secundario IS NOT NULL THEN
          NEW.proxima_data_cobranca = (date_trunc('month', NEW.data_confirmacao_pago) + INTERVAL '1 month' + (NEW.dia_cobranca_secundario - 1 || ' days')::interval)::date;
        END IF;
    END CASE;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.gerar_lembretes_boletos_recorrentes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Gerar lembretes para boletos que chegaram na data de próxima cobrança
  INSERT INTO public.lembretes (
    titulo,
    descricao,
    dia,
    hora,
    responsavel_id,
    cliente_id,
    tipo,
    urgente,
    residencia
  )
  SELECT 
    'Cobrança recorrente - ' || c.nome,
    'Gerar novo boleto recorrente no valor de R$ ' || 
    COALESCE(b.valor_personalizado, b.valor)::text || 
    ' (' || b.tipo_plantao || '). Frequência: ' || b.frequencia_recorrencia,
    b.proxima_data_cobranca,
    '09:00:00'::time,
    (SELECT id FROM public.profiles WHERE perfil IN ('admin', 'admin_plus') ORDER BY created_at LIMIT 1),
    b.cliente_id,
    'boleto_recorrente',
    CASE WHEN b.proxima_data_cobranca <= CURRENT_DATE + INTERVAL '1 day' THEN true ELSE false END,
    COALESCE(c.endereco, 'Não especificado')
  FROM public.boletos b
  JOIN public.clientes c ON b.cliente_id = c.id
  WHERE b.recorrente = true
    AND b.proxima_data_cobranca IS NOT NULL
    AND b.proxima_data_cobranca <= CURRENT_DATE + INTERVAL '3 days'
    AND b.status = 'pago'
    AND NOT EXISTS (
      SELECT 1 FROM public.lembretes l
      WHERE l.cliente_id = b.cliente_id
        AND l.tipo = 'boleto_recorrente'
        AND l.dia = b.proxima_data_cobranca
    );

  -- Atualizar histórico de lembretes nos boletos
  UPDATE public.boletos 
  SET historico_lembretes = historico_lembretes || jsonb_build_array(
    jsonb_build_object(
      'data_lembrete', CURRENT_DATE,
      'proxima_cobranca', proxima_data_cobranca,
      'tipo', 'automatico'
    )
  )
  WHERE recorrente = true
    AND proxima_data_cobranca IS NOT NULL
    AND proxima_data_cobranca <= CURRENT_DATE + INTERVAL '3 days'
    AND status = 'pago';
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;