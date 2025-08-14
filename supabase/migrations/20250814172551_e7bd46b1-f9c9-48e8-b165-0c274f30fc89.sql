-- Fase 1: Correção da Base de Dados

-- Criar tabela notas_fiscais
CREATE TABLE public.notas_fiscais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL,
  periodo TEXT NOT NULL,
  cpf_tomador TEXT NOT NULL,
  responsavel_pagador TEXT NOT NULL,
  emissor_nf TEXT NOT NULL,
  valor_nf NUMERIC NOT NULL,
  status_envio TEXT NOT NULL DEFAULT 'pendente',
  data_emissao DATE DEFAULT CURRENT_DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for notas_fiscais
ALTER TABLE public.notas_fiscais ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para notas_fiscais (apenas admin+)
CREATE POLICY "Apenas admin+ pode acessar notas fiscais" 
ON public.notas_fiscais 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND perfil = 'admin_plus'
  )
);

-- Adicionar campos faltantes em boletos
ALTER TABLE public.boletos 
ADD COLUMN IF NOT EXISTS notificacao_dias_antes INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS canal_envio TEXT DEFAULT 'email',
ADD COLUMN IF NOT EXISTS historico_ciclos JSONB DEFAULT '[]'::jsonb;

-- Adicionar campos em pagamentos_funcionarios
ALTER TABLE public.pagamentos_funcionarios 
ADD COLUMN IF NOT EXISTS periodo_competencia TEXT,
ADD COLUMN IF NOT EXISTS metodo_pagamento TEXT DEFAULT 'pix',
ADD COLUMN IF NOT EXISTS comprovante_url TEXT;

-- Limpar entradas do financeiro que vieram de transações
DELETE FROM public.financeiro 
WHERE referencia_tipo = 'transacao';

-- Função para criar notificações de boletos
CREATE OR REPLACE FUNCTION public.criar_notificacoes_boletos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Criar lembretes para boletos próximos do envio
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
    ' (' || b.tipo_plantao || ')',
    CURRENT_DATE + (b.notificacao_dias_antes || ' days')::interval,
    '09:00:00'::time,
    (SELECT id FROM public.profiles WHERE perfil IN ('admin', 'admin_plus') ORDER BY created_at LIMIT 1),
    b.cliente_id,
    'boleto',
    CASE WHEN b.notificacao_dias_antes <= 1 THEN true ELSE false END,
    COALESCE(c.endereco, 'Não especificado')
  FROM public.boletos b
  JOIN public.clientes c ON b.cliente_id = c.id
  WHERE b.status IN ('pendente', 'enviado')
  AND b.recorrente = true
  AND NOT EXISTS (
    SELECT 1 FROM public.lembretes l
    WHERE l.cliente_id = b.cliente_id
    AND l.tipo = 'boleto'
    AND l.dia = CURRENT_DATE + (b.notificacao_dias_antes || ' days')::interval
  );
END;
$function$;

-- Trigger para atualizar updated_at em notas_fiscais
CREATE TRIGGER update_notas_fiscais_updated_at
BEFORE UPDATE ON public.notas_fiscais
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Políticas de storage para comprovantes de pagamento
CREATE POLICY "Admin+ pode fazer upload de comprovantes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'attachments' AND 
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE perfil = 'admin_plus'
  )
);

CREATE POLICY "Admin+ pode visualizar comprovantes" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'attachments' AND 
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE perfil = 'admin_plus'
  )
);