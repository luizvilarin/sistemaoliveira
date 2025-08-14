-- 1. Create notas_fiscais table
CREATE TABLE public.notas_fiscais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL,
  responsavel_pagador TEXT NOT NULL,
  emissor_nf TEXT NOT NULL,
  valor_nf NUMERIC NOT NULL,
  cpf_tomador TEXT NOT NULL,
  periodo TEXT NOT NULL,
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  status_envio TEXT NOT NULL DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS on notas_fiscais
ALTER TABLE public.notas_fiscais ENABLE ROW LEVEL SECURITY;

-- Create policies for notas_fiscais
CREATE POLICY "Admin+ can manage all notas_fiscais" 
ON public.notas_fiscais 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND perfil = 'admin_plus'
  )
);

-- 2. Add new columns to boletos table for better recurrence management
ALTER TABLE public.boletos 
ADD COLUMN IF NOT EXISTS canal_envio TEXT DEFAULT 'email',
ADD COLUMN IF NOT EXISTS dias_antecedencia_notificacao INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS notificacoes_config JSONB DEFAULT '{"envio": true, "vencimento": true}',
ADD COLUMN IF NOT EXISTS historico_ciclos JSONB DEFAULT '[]';

-- 3. Update existing boletos function to handle new recurrence logic
CREATE OR REPLACE FUNCTION public.atualizar_boleto_recorrente()
RETURNS TRIGGER AS $$
BEGIN
  -- If boleto is marked as paid and is recurrent, calculate next dates
  IF NEW.status = 'pago' AND NEW.recorrente = true AND (OLD.status IS NULL OR OLD.status != 'pago') THEN
    -- Add current cycle to history
    NEW.historico_ciclos = COALESCE(OLD.historico_ciclos, '[]'::jsonb) || 
      jsonb_build_object(
        'data_pagamento', NEW.data_confirmacao_pago,
        'valor_pago', NEW.valor_personalizado OR NEW.valor,
        'ciclo_concluido', now()
      );
    
    -- Calculate next billing date based on frequency
    CASE NEW.frequencia_recorrencia
      WHEN 'quinzenal' THEN
        NEW.proxima_data_cobranca = NEW.data_confirmacao_pago + INTERVAL '15 days';
      WHEN 'mensal' THEN
        NEW.proxima_data_cobranca = (NEW.data_confirmacao_pago + INTERVAL '1 month')::date;
      WHEN 'personalizado' THEN
        IF NEW.dia_cobranca_secundario IS NOT NULL THEN
          NEW.proxima_data_cobranca = (date_trunc('month', NEW.data_confirmacao_pago) + INTERVAL '1 month' + (NEW.dia_cobranca_secundario - 1 || ' days')::interval)::date;
        END IF;
    END CASE;
    
    -- Reset status for next cycle
    NEW.status = 'pendente';
    NEW.data_solicitacao = NULL;
    NEW.data_envio_boleto = NULL;
    NEW.data_confirmacao_pago = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for boleto recurrence
DROP TRIGGER IF EXISTS trigger_atualizar_boleto_recorrente ON public.boletos;
CREATE TRIGGER trigger_atualizar_boleto_recorrente
  BEFORE UPDATE ON public.boletos
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_boleto_recorrente();

-- 4. Create notification function for boletos
CREATE OR REPLACE FUNCTION public.criar_notificacoes_boletos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Create notifications for boletos that need to be sent
  INSERT INTO public.notificacoes_sistema (
    usuario_id,
    tipo,
    titulo,
    mensagem,
    data_vencimento,
    metadados
  )
  SELECT 
    (SELECT id FROM public.profiles WHERE perfil IN ('admin', 'admin_plus') ORDER BY created_at LIMIT 1),
    'boleto_envio',
    'Boleto pronto para envio',
    'Boleto para ' || c.nome || ' deve ser enviado. Valor: R$ ' || 
    COALESCE(b.valor_personalizado, b.valor)::text,
    (CURRENT_DATE + INTERVAL '1 day'),
    jsonb_build_object('boleto_id', b.id, 'cliente_id', b.cliente_id)
  FROM public.boletos b
  JOIN public.clientes c ON b.cliente_id = c.id
  WHERE b.proxima_data_cobranca IS NOT NULL
    AND b.proxima_data_cobranca <= CURRENT_DATE + (b.dias_antecedencia_notificacao || ' days')::interval
    AND b.recorrente = true
    AND b.status = 'pendente'
    AND NOT EXISTS (
      SELECT 1 FROM public.notificacoes_sistema ns
      WHERE ns.tipo = 'boleto_envio'
        AND ns.metadados->>'boleto_id' = b.id::text
        AND ns.created_at > CURRENT_DATE - INTERVAL '1 day'
    );
END;
$$;

-- 5. Fix pagamentos_funcionarios structure
ALTER TABLE public.pagamentos_funcionarios 
ADD COLUMN IF NOT EXISTS nome_funcionario TEXT,
ADD COLUMN IF NOT EXISTS cargo TEXT,
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT;

-- Update existing records to use cuidador name if available
UPDATE public.pagamentos_funcionarios pf
SET nome_funcionario = c.nome,
    cargo = c.especializacao
FROM public.cuidadores c
WHERE pf.cuidador_id = c.id AND pf.nome_funcionario IS NULL;

-- 6. Clean up financeiro table - remove entries that came from transacoes
DELETE FROM public.financeiro 
WHERE referencia_tipo = 'transacao_cliente' OR referencia_tipo = 'transacao';

-- 7. Update trigger for updated_at on new tables
CREATE TRIGGER update_notas_fiscais_updated_at
  BEFORE UPDATE ON public.notas_fiscais
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 8. Add storage bucket for employee payment attachments if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('employee-payments', 'employee-payments', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for employee payment attachments
CREATE POLICY "Admin+ can manage employee payment files" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'employee-payments' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND perfil = 'admin_plus'
  )
);

-- 9. Create function to schedule boleto notifications
SELECT cron.schedule(
  'boleto-notifications',
  '0 9 * * *', -- Daily at 9 AM
  $$SELECT public.criar_notificacoes_boletos();$$
);