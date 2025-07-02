-- Adicionar política para permitir que gestores também possam criar e gerenciar cuidadores
CREATE POLICY "Gestores can manage cuidadores" 
ON public.cuidadores 
FOR ALL 
USING (get_current_user_role() = 'gestor'::text);