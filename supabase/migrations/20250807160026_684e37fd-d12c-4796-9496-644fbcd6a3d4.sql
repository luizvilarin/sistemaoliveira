-- Adicionar políticas para gestores poderem gerenciar clientes
CREATE POLICY "Gestores podem criar clientes" 
ON public.clientes 
FOR INSERT 
WITH CHECK (get_current_user_role() = ANY(ARRAY['admin', 'gestor']));

CREATE POLICY "Gestores podem atualizar clientes" 
ON public.clientes 
FOR UPDATE 
USING (get_current_user_role() = ANY(ARRAY['admin', 'gestor']));

CREATE POLICY "Gestores podem deletar clientes" 
ON public.clientes 
FOR DELETE 
USING (get_current_user_role() = ANY(ARRAY['admin', 'gestor']));

-- Adicionar políticas para transações (necessário para o cascade delete funcionar)
CREATE POLICY "Gestores podem deletar transações para cascade" 
ON public.transacoes 
FOR DELETE 
USING (get_current_user_role() = ANY(ARRAY['admin', 'gestor']));

-- Adicionar políticas para boletos (necessário para o cascade delete funcionar)  
CREATE POLICY "Gestores podem deletar boletos para cascade" 
ON public.boletos 
FOR DELETE 
USING (get_current_user_role() = ANY(ARRAY['admin', 'gestor']));

-- Adicionar políticas para financeiro (necessário para o cascade delete funcionar)
CREATE POLICY "Gestores podem deletar entradas financeiras para cascade" 
ON public.financeiro 
FOR DELETE 
USING (get_current_user_role() = ANY(ARRAY['admin', 'gestor']));

-- Adicionar políticas para pagamentos_funcionarios (necessário para o cascade delete funcionar)
CREATE POLICY "Gestores podem deletar pagamentos para cascade" 
ON public.pagamentos_funcionarios 
FOR DELETE 
USING (get_current_user_role() = ANY(ARRAY['admin', 'gestor']));