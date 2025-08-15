-- Add missing fields to pagamentos_funcionarios table
ALTER TABLE public.pagamentos_funcionarios 
ADD COLUMN IF NOT EXISTS nome_funcionario TEXT,
ADD COLUMN IF NOT EXISTS cargo TEXT;

-- Update boletos table to ensure new fields have proper defaults
ALTER TABLE public.boletos 
ALTER COLUMN notificacao_dias_antes SET DEFAULT 2,
ALTER COLUMN canal_envio SET DEFAULT 'email';