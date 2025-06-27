
-- First, let's remove the overly permissive policies and create proper user-based access controls

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Everyone can view clientes" ON public.clientes;
DROP POLICY IF EXISTS "Admins can manage clientes" ON public.clientes;
DROP POLICY IF EXISTS "Everyone can view cuidadores" ON public.cuidadores;
DROP POLICY IF EXISTS "Admins can manage cuidadores" ON public.cuidadores;
DROP POLICY IF EXISTS "Everyone can view pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Admins can manage pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Everyone can view tarefas" ON public.tarefas;
DROP POLICY IF EXISTS "Admins can manage tarefas" ON public.tarefas;
DROP POLICY IF EXISTS "Admins can view transacoes" ON public.transacoes;
DROP POLICY IF EXISTS "Admins can manage transacoes" ON public.transacoes;

-- Create a security definer function to get current user role to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT perfil FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND perfil = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- CLIENTES - Role-based access with proper restrictions
CREATE POLICY "Admins can manage all clientes" ON public.clientes
  FOR ALL USING (public.is_current_user_admin());

CREATE POLICY "Gestores and cuidadores can view clientes" ON public.clientes
  FOR SELECT USING (
    public.get_current_user_role() IN ('admin', 'gestor', 'cuidador')
  );

-- CUIDADORES - Role-based access
CREATE POLICY "Admins can manage all cuidadores" ON public.cuidadores
  FOR ALL USING (public.is_current_user_admin());

CREATE POLICY "Gestores can view cuidadores" ON public.cuidadores
  FOR SELECT USING (
    public.get_current_user_role() IN ('admin', 'gestor')
  );

CREATE POLICY "Cuidadores can view their own profile" ON public.cuidadores
  FOR SELECT USING (
    public.get_current_user_role() = 'cuidador' AND 
    email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

-- PACIENTES - Client-based access with role restrictions
CREATE POLICY "Admins can manage all pacientes" ON public.pacientes
  FOR ALL USING (public.is_current_user_admin());

CREATE POLICY "Gestores and assigned cuidadores can view pacientes" ON public.pacientes
  FOR SELECT USING (
    public.get_current_user_role() IN ('admin', 'gestor') OR
    (public.get_current_user_role() = 'cuidador' AND cuidador_id IN (
      SELECT id FROM public.cuidadores 
      WHERE email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    ))
  );

-- TAREFAS - User can only see tasks assigned to them or their clients
CREATE POLICY "Users can view relevant tarefas" ON public.tarefas
  FOR SELECT USING (
    public.is_current_user_admin() OR
    cuidador_id IN (
      SELECT id FROM public.cuidadores 
      WHERE email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Admins can insert tarefas" ON public.tarefas
  FOR INSERT WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Admins can update tarefas" ON public.tarefas
  FOR UPDATE USING (public.is_current_user_admin());

CREATE POLICY "Admins can delete tarefas" ON public.tarefas
  FOR DELETE USING (public.is_current_user_admin());

CREATE POLICY "Cuidadores can update their own tarefas" ON public.tarefas
  FOR UPDATE USING (
    cuidador_id IN (
      SELECT id FROM public.cuidadores 
      WHERE email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    )
  );

-- TRANSACOES - Admin-only access (financial data is sensitive)
CREATE POLICY "Only admins can access transacoes" ON public.transacoes
  FOR ALL USING (public.is_current_user_admin());

-- LEMBRETES - Users can only manage their own reminders
DROP POLICY IF EXISTS "Everyone can view lembretes" ON public.lembretes;
DROP POLICY IF EXISTS "Users can manage own lembretes" ON public.lembretes;

CREATE POLICY "Users can view their own lembretes" ON public.lembretes
  FOR SELECT USING (responsavel_id = auth.uid());

CREATE POLICY "Users can insert their own lembretes" ON public.lembretes
  FOR INSERT WITH CHECK (responsavel_id = auth.uid());

CREATE POLICY "Users can update their own lembretes" ON public.lembretes
  FOR UPDATE USING (responsavel_id = auth.uid());

CREATE POLICY "Users can delete their own lembretes" ON public.lembretes
  FOR DELETE USING (responsavel_id = auth.uid());

CREATE POLICY "Admins can view all lembretes" ON public.lembretes
  FOR SELECT USING (public.is_current_user_admin());

-- MENSAGENS - Enhanced security for messaging
DROP POLICY IF EXISTS "Users can view own messages" ON public.mensagens;
DROP POLICY IF EXISTS "Users can send messages" ON public.mensagens;
DROP POLICY IF EXISTS "Users can update own messages" ON public.mensagens;

CREATE POLICY "Users can view their messages" ON public.mensagens
  FOR SELECT USING (
    remetente_id = auth.uid() OR destinatario_id = auth.uid()
  );

CREATE POLICY "Users can send messages" ON public.mensagens
  FOR INSERT WITH CHECK (remetente_id = auth.uid());

CREATE POLICY "Users can mark their received messages as read" ON public.mensagens
  FOR UPDATE USING (destinatario_id = auth.uid());

-- PROFILES - Enhanced profile security
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_current_user_admin());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Add indexes for better performance on RLS queries
CREATE INDEX IF NOT EXISTS idx_profiles_perfil ON public.profiles(perfil);
CREATE INDEX IF NOT EXISTS idx_cuidadores_email ON public.cuidadores(email);
CREATE INDEX IF NOT EXISTS idx_lembretes_responsavel ON public.lembretes(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_users ON public.mensagens(remetente_id, destinatario_id);
