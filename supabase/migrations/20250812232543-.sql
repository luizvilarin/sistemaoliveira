-- Adicionar campos de recorrência e status melhorado para boletos
ALTER TABLE public.boletos 
ADD COLUMN frequencia_recorrencia text CHECK (frequencia_recorrencia IN ('quinzenal', 'mensal', 'personalizado', 'unico')) DEFAULT 'unico',
ADD COLUMN dia_cobranca_secundario integer,
ADD COLUMN proxima_data_cobranca date,
ADD COLUMN recorrente boolean DEFAULT false,
ADD COLUMN historico_lembretes jsonb DEFAULT '[]'::jsonb,
ADD COLUMN cor_status text DEFAULT '#6b7280';

-- Adicionar CPF e nome completo para clientes (necessário para relatório de notas fiscais)
ALTER TABLE public.clientes 
ADD COLUMN cpf_completo text,
ADD COLUMN nome_completo_cliente text;

-- Atualizar possíveis valores de status do boleto
ALTER TABLE public.boletos 
DROP CONSTRAINT IF EXISTS boletos_status_check;

ALTER TABLE public.boletos 
ADD CONSTRAINT boletos_status_check 
CHECK (status IN ('pendente', 'solicitado', 'enviado', 'pago', 'vencido', 'cancelado'));

-- Adicionar campos de controle de datas para cada status
ALTER TABLE public.boletos
ADD COLUMN data_solicitacao date,
ADD COLUMN data_envio_boleto date,
ADD COLUMN data_confirmacao_pago date;

-- Função para atualizar automaticamente as datas conforme status
CREATE OR REPLACE FUNCTION public.atualizar_datas_status_boleto()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar datas automaticamente
DROP TRIGGER IF EXISTS trigger_atualizar_datas_status_boleto ON public.boletos;
CREATE TRIGGER trigger_atualizar_datas_status_boleto
  BEFORE INSERT OR UPDATE ON public.boletos
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_datas_status_boleto();

-- Função para criar lembretes automáticos para boletos recorrentes
CREATE OR REPLACE FUNCTION public.gerar_lembretes_boletos_recorrentes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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