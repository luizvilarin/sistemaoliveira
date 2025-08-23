-- Atualizar políticas RLS para incluir o perfil 'financeiro'
-- O perfil financeiro terá as mesmas permissões do admin + acesso a boletos

-- Atualizar função para incluir financeiro como admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND perfil = ANY(ARRAY['admin', 'admin_plus', 'financeiro'])
  );
$$;

-- Atualizar política de boletos para incluir financeiro
DROP POLICY IF EXISTS "Admin e admin+ podem gerenciar todos os boletos" ON public.boletos;
CREATE POLICY "Admin, admin+ e financeiro podem gerenciar todos os boletos" 
ON public.boletos 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.perfil = ANY(ARRAY['admin', 'admin_plus', 'financeiro'])
  )
);

-- Atualizar política de visualização de boletos para incluir financeiro
DROP POLICY IF EXISTS "Gestores podem visualizar boletos" ON public.boletos;
CREATE POLICY "Gestores, admin e financeiro podem visualizar boletos" 
ON public.boletos 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.perfil = ANY(ARRAY['admin', 'admin_plus', 'gestor', 'financeiro'])
  )
);

-- Garantir que o perfil financeiro tenha acesso aos clientes (necessário para boletos)
-- A política já existe mas vamos documentar
COMMENT ON POLICY "Enhanced clientes access" ON public.clientes IS 'Permite acesso aos clientes para admin, admin_plus, gestor, financeiro e cuidadores aos seus próprios clientes';