-- Migração para limpeza de dados órfãos no sistema financeiro
-- Remover entradas do financeiro que referenciam pagamentos que não existem mais

DELETE FROM public.financeiro 
WHERE referencia_tipo = 'pagamento_funcionario'
AND referencia_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.pagamentos_funcionarios 
  WHERE public.pagamentos_funcionarios.id = public.financeiro.referencia_id::uuid
);

-- Adicionar comentário para auditoria
COMMENT ON TABLE public.financeiro IS 'Tabela para controle financeiro operacional da empresa. Separada da tabela transacoes que controla faturamento de clientes.';
COMMENT ON TABLE public.transacoes IS 'Tabela para controle de transações com clientes (faturamento). Separada da tabela financeiro que controla operações internas.';