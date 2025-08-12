-- Modificar a tabela pagamentos_funcionarios para usar campos de texto livre
ALTER TABLE public.pagamentos_funcionarios 
DROP COLUMN IF EXISTS cuidador_id,
ADD COLUMN nome_funcionario TEXT NOT NULL DEFAULT 'Funcionário',
ADD COLUMN cargo TEXT NOT NULL DEFAULT 'Cuidador';

-- Sincronizar todas as transações existentes com o financeiro
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
  'Transação do cliente: ' || COALESCE(c.nome, 'Cliente não identificado'),
  t.id,
  'transacao_cliente',
  (SELECT id FROM public.profiles WHERE perfil = 'admin_plus' LIMIT 1)
FROM public.transacoes t
LEFT JOIN public.clientes c ON t.cliente_id = c.id
WHERE NOT EXISTS (
  SELECT 1 FROM public.financeiro f 
  WHERE f.referencia_id = t.id 
  AND f.referencia_tipo = 'transacao_cliente'
);

-- Atualizar os pagamentos de funcionários para criar entradas no financeiro
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
  'despesa',
  CASE 
    WHEN pf.tipo_pagamento = 'salario' THEN 'Salários e Ordenados'
    WHEN pf.tipo_pagamento = 'bonus' THEN 'Bonificações'
    WHEN pf.tipo_pagamento = 'comissao' THEN 'Comissões'
    WHEN pf.tipo_pagamento = 'ajuda_custo' THEN 'Ajuda de Custo'
    ELSE 'Outras Despesas com Pessoal'
  END,
  pf.valor,
  pf.data_pagamento,
  'Pagamento funcionário: ' || COALESCE(pf.nome_funcionario, 'Funcionário não identificado') || 
  CASE WHEN pf.descricao IS NOT NULL THEN ' - ' || pf.descricao ELSE '' END,
  pf.id,
  'pagamento_funcionario',
  COALESCE(pf.created_by, (SELECT id FROM public.profiles WHERE perfil = 'admin_plus' LIMIT 1))
FROM public.pagamentos_funcionarios pf
WHERE pf.status = 'pago'
AND NOT EXISTS (
  SELECT 1 FROM public.financeiro f 
  WHERE f.referencia_id = pf.id 
  AND f.referencia_tipo = 'pagamento_funcionario'
);