-- Corrigir política de tarefas - permitir gestores
CREATE POLICY "Gestores podem criar tarefas" 
ON public.tarefas 
FOR INSERT 
TO public 
WITH CHECK (get_current_user_role() IN ('admin', 'admin_plus', 'gestor', 'financeiro'));

-- Corrigir política de transações - permitir gestores
DROP POLICY IF EXISTS "Only admins can access transacoes" ON public.transacoes;

CREATE POLICY "Admins e gestores podem gerenciar transacoes" 
ON public.transacoes 
FOR ALL 
TO public 
USING (get_current_user_role() IN ('admin', 'admin_plus', 'gestor', 'financeiro'))
WITH CHECK (get_current_user_role() IN ('admin', 'admin_plus', 'gestor', 'financeiro'));