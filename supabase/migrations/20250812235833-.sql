-- Garantir que todas as transações existentes estejam sincronizadas com o financeiro
-- Remover possíveis duplicatas primeiro
DELETE FROM public.financeiro 
WHERE referencia_tipo = 'transacao_cliente' 
AND referencia_id IN (
  SELECT referencia_id 
  FROM public.financeiro 
  WHERE referencia_tipo = 'transacao_cliente'
  GROUP BY referencia_id 
  HAVING COUNT(*) > 1
);

-- Sincronizar todas as transações existentes que ainda não estão no financeiro
INSERT INTO public.financeiro (
  tipo,
  categoria,
  valor,
  data_transacao,
  descricao,
  referencia_id,
  referencia_tipo,
  created_by
)
SELECT 
  'receita',
  'Receitas de Clientes',
  t.valor,
  t.data::date,
  'Transação do cliente: ' || COALESCE(c.nome, 'Cliente não identificado') || 
  CASE 
    WHEN t.status = 'confirmado' THEN ' (Confirmado)'
    WHEN t.status = 'aguardando' THEN ' (Aguardando)'
    WHEN t.status = 'expirado' THEN ' (Expirado)'
    ELSE ''
  END,
  t.id,
  'transacao_cliente',
  COALESCE(
    (SELECT id FROM public.profiles WHERE perfil = 'admin_plus' LIMIT 1),
    (SELECT id FROM public.profiles WHERE perfil = 'admin' LIMIT 1)
  )
FROM public.transacoes t
LEFT JOIN public.clientes c ON t.cliente_id = c.id
WHERE NOT EXISTS (
  SELECT 1 FROM public.financeiro f 
  WHERE f.referencia_id = t.id 
  AND f.referencia_tipo = 'transacao_cliente'
)
AND t.id IS NOT NULL;

-- Criar um log para verificar quantas transações foram sincronizadas
DO $$
DECLARE
    sync_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO sync_count
    FROM public.financeiro
    WHERE referencia_tipo = 'transacao_cliente';
    
    RAISE NOTICE 'Total de transações sincronizadas com o financeiro: %', sync_count;
END $$;