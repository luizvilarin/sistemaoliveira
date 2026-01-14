-- 1. Corrigir visibilidade de tarefas para gestores
DROP POLICY IF EXISTS "Users can view relevant tarefas" ON public.tarefas;

CREATE POLICY "Users can view relevant tarefas"
ON public.tarefas
FOR SELECT
TO public
USING (
  is_current_user_admin() 
  OR get_current_user_role() = 'gestor'
  OR (cuidador_id IN (
    SELECT c.id FROM cuidadores c 
    WHERE c.email = (SELECT p.email FROM profiles p WHERE p.id = auth.uid())
  ))
);

-- 2. Corrigir visibilidade de perfis para incluir todos os tipos
DROP POLICY IF EXISTS "Users can view relevant profiles" ON public.profiles;

CREATE POLICY "Users can view relevant profiles"
ON public.profiles
FOR SELECT
TO public
USING (
  (id = auth.uid()) 
  OR is_current_user_admin() 
  OR ((get_current_user_role() = 'gestor') AND (perfil = ANY(ARRAY['admin', 'admin_plus', 'gestor', 'cuidador', 'financeiro'])))
  OR ((get_current_user_role() = 'cuidador') AND (perfil = ANY(ARRAY['admin', 'admin_plus', 'gestor', 'cuidador', 'financeiro'])))
);