-- Fix infinite recursion in RLS policies for membros_grupo and grupos_chat
-- Create security definer functions to prevent recursive policy checks

-- Function to check if user is group creator
CREATE OR REPLACE FUNCTION public.is_group_creator(group_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.grupos_chat 
    WHERE id = group_id AND criado_por = user_id
  );
$$;

-- Function to check if user is group member
CREATE OR REPLACE FUNCTION public.is_group_member(group_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.membros_grupo 
    WHERE grupo_id = group_id AND usuario_id = user_id
  );
$$;

-- Function to check if user is group admin
CREATE OR REPLACE FUNCTION public.is_group_admin(group_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.membros_grupo 
    WHERE grupo_id = group_id AND usuario_id = user_id AND papel = 'admin'
  );
$$;

-- Drop all existing problematic policies for membros_grupo
DROP POLICY IF EXISTS "Group admins can manage members" ON public.membros_grupo;
DROP POLICY IF EXISTS "Group creators can manage all members" ON public.membros_grupo;
DROP POLICY IF EXISTS "Group creators can manage members" ON public.membros_grupo;
DROP POLICY IF EXISTS "Users can view group members if they are members" ON public.membros_grupo;
DROP POLICY IF EXISTS "Users can view group memberships" ON public.membros_grupo;

-- Create new non-recursive policies for membros_grupo
CREATE POLICY "Group creators and admins can manage members"
ON public.membros_grupo
FOR ALL
USING (
  public.is_group_creator(grupo_id, auth.uid()) OR 
  public.is_group_admin(grupo_id, auth.uid()) OR
  usuario_id = auth.uid()
);

CREATE POLICY "Group members can view other members"
ON public.membros_grupo
FOR SELECT
USING (
  public.is_group_creator(grupo_id, auth.uid()) OR 
  public.is_group_member(grupo_id, auth.uid())
);

-- Drop all existing problematic policies for grupos_chat
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.grupos_chat;
DROP POLICY IF EXISTS "Group admins can update groups" ON public.grupos_chat;
DROP POLICY IF EXISTS "Group creators can update groups" ON public.grupos_chat;
DROP POLICY IF EXISTS "Users can create groups" ON public.grupos_chat;
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.grupos_chat;
DROP POLICY IF EXISTS "Users can view their groups" ON public.grupos_chat;

-- Create new non-recursive policies for grupos_chat
CREATE POLICY "Authenticated users can create groups"
ON public.grupos_chat
FOR INSERT
WITH CHECK (auth.uid() = criado_por);

CREATE POLICY "Group creators and admins can update groups"
ON public.grupos_chat
FOR UPDATE
USING (
  criado_por = auth.uid() OR
  public.is_group_admin(id, auth.uid())
);

CREATE POLICY "Group members can view groups"
ON public.grupos_chat
FOR SELECT
USING (
  criado_por = auth.uid() OR
  public.is_group_member(id, auth.uid())
);

-- Fix support_requests policy - remove overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can create support requests" ON public.support_requests;

CREATE POLICY "Authenticated users can create support requests"
ON public.support_requests
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Add search_path to all existing functions for security
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT perfil FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND perfil = ANY(ARRAY['admin', 'admin_plus'])
  );
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin_plus()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND perfil = 'admin_plus'
  );
$$;