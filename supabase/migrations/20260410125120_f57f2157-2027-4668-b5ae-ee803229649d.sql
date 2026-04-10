-- Consolidar INSERT policies
DROP POLICY IF EXISTS "Admins can insert tarefas" ON public.tarefas;
DROP POLICY IF EXISTS "Gestores podem criar tarefas" ON public.tarefas;

CREATE POLICY "Usuarios podem criar tarefas"
ON public.tarefas
FOR INSERT
TO public
WITH CHECK (
  get_current_user_role() IN ('admin', 'admin_plus', 'gestor', 'financeiro')
);

-- Consolidar UPDATE policies
DROP POLICY IF EXISTS "Admins can update tarefas" ON public.tarefas;
DROP POLICY IF EXISTS "Cuidadores can update their own tarefas" ON public.tarefas;

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

-- Consolidar DELETE policies
DROP POLICY IF EXISTS "Admins can delete tarefas" ON public.tarefas;

CREATE POLICY "Usuarios podem deletar tarefas"
ON public.tarefas
FOR DELETE
TO public
USING (
  get_current_user_role() IN ('admin', 'admin_plus', 'gestor', 'financeiro')
);