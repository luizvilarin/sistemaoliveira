-- Migração para otimizar a plataforma

-- 1. Adicionar campos na tabela clientes
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS contrato_ativo BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS valor_contrato NUMERIC,
ADD COLUMN IF NOT EXISTS status_pagamento TEXT DEFAULT 'aguardando';

-- 2. Remover campos da tabela pacientes
ALTER TABLE public.pacientes 
DROP COLUMN IF EXISTS contrato_ativo,
DROP COLUMN IF EXISTS valor_contrato;

-- 3. Adicionar campo para tempo de antecedência de notificação na tabela lembretes
ALTER TABLE public.lembretes 
ADD COLUMN IF NOT EXISTS tempo_antecedencia INTEGER DEFAULT 60; -- em minutos

-- Comentários sobre as alterações:
-- 1. contrato_ativo e valor_contrato movidos de pacientes para clientes
-- 2. Adicionado status_pagamento nos clientes (aguardando, vencido, confirmado)
-- 3. Adicionado tempo_antecedencia nos lembretes para notificações personalizadas