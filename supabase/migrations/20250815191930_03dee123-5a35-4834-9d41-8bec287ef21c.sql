-- Atualizar constraint do tipo_plantao para aceitar os valores do formulário
ALTER TABLE public.boletos 
DROP CONSTRAINT IF EXISTS boletos_tipo_plantao_check;

-- Adicionar nova constraint com todos os valores necessários
ALTER TABLE public.boletos 
ADD CONSTRAINT boletos_tipo_plantao_check 
CHECK (tipo_plantao IN (
  '4h', '6h', '8h', '10h', '12h', '15h', '24h', 'personalizado',
  '12h diurno', '12h noturno', '48h', 'mensal'
));