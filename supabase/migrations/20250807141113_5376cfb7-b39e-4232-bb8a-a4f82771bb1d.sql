-- Fix infinite recursion in membros_grupo policies
-- First drop problematic policies
DROP POLICY IF EXISTS "Group creators and admins can manage members" ON public.membros_grupo;
DROP POLICY IF EXISTS "Members can view group members" ON public.membros_grupo;

-- Create new secure policies for membros_grupo
CREATE POLICY "Group creators can manage all members" 
ON public.membros_grupo 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.grupos_chat gc 
  WHERE gc.id = membros_grupo.grupo_id 
  AND gc.criado_por = auth.uid()
));

CREATE POLICY "Group admins can manage members" 
ON public.membros_grupo 
FOR ALL 
USING (
  usuario_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.grupos_chat gc 
    WHERE gc.id = membros_grupo.grupo_id 
    AND gc.criado_por = auth.uid()
  )
);

CREATE POLICY "Users can view group members if they are members" 
ON public.membros_grupo 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.grupos_chat gc 
    WHERE gc.id = membros_grupo.grupo_id 
    AND gc.criado_por = auth.uid()
  ) OR
  grupo_id IN (
    SELECT mg.grupo_id FROM public.membros_grupo mg 
    WHERE mg.usuario_id = auth.uid()
  )
);