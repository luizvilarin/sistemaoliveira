-- Corrigir função atualizar_datas_status_boleto para evitar erro "case not found"
CREATE OR REPLACE FUNCTION public.atualizar_datas_status_boleto()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
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
    ELSE
      -- Não alterar nenhuma data se status não reconhecido
      NULL;
  END CASE;

  -- Definir cores baseado no status
  CASE NEW.status
    WHEN 'pendente' THEN NEW.cor_status = '#f59e0b'; -- amber
    WHEN 'solicitado' THEN NEW.cor_status = '#3b82f6'; -- blue  
    WHEN 'enviado' THEN NEW.cor_status = '#8b5cf6'; -- purple
    WHEN 'pago' THEN NEW.cor_status = '#10b981'; -- green
    WHEN 'vencido' THEN NEW.cor_status = '#ef4444'; -- red
    WHEN 'cancelado' THEN NEW.cor_status = '#6b7280'; -- gray
    ELSE
      -- Cor padrão para status não reconhecidos
      NEW.cor_status = '#6b7280'; -- gray
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
      ELSE
        -- Não calcular próxima data para frequências não reconhecidas
        NULL;
    END CASE;
  END IF;

  RETURN NEW;
END;
$function$;