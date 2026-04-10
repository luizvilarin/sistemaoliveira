
-- Garantir que todos os perfis administrativos possam ver todas as tarefas
DROP POLICY IF EXISTS "Users can view relevant tarefas" ON public.tarefas;

CREATE POLICY "Usuarios administrativos podem ver todas as tarefas"
ON public.tarefas
FOR SELECT
TO public
USING (
  get_current_user_role() IN ('admin', 'admin_plus', 'gestor', 'financeiro')
  OR (cuidador_id IN (
    SELECT c.id FROM cuidadores c
    WHERE c.email = (SELECT p.email FROM profiles p WHERE p.id = auth.uid())
  ))
);

-- Garantir que as permissões de INSERT/UPDATE/DELETE estejam consistentes
DROP POLICY IF EXISTS "Usuarios podem criar tarefas" ON public.tarefas;
CREATE POLICY "Usuarios podem criar tarefas"
ON public.tarefas
FOR INSERT
TO public
WITH CHECK (
  get_current_user_role() IN ('admin', 'admin_plus', 'gestor', 'financeiro')
);

DROP POLICY IF EXISTS "Usuarios podem atualizar tarefas" ON public.tarefas;
CREATE POLICY "Usuarios podem atualizar tarefas"
ON public.tarefas
FOR UPDATE
TO public
USING (
  get_current_user_role() IN ('admin', 'admin_plus', 'gestor', 'financeiro')
  OR (cuidador_id IN (
    SELECT c.id FROM cuidadores c
    WHERE c.email = (SELECT p.email FROM profiles p WHERE p.id = auth.uid())
  ))
);
