-- Create audit logs table for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
FOR SELECT 
USING (is_current_user_admin());

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON public.audit_logs
FOR INSERT 
WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource);

-- Create function to log sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to sensitive tables
  IF TG_TABLE_NAME IN ('pacientes', 'clientes', 'financeiro', 'boletos', 'pagamentos_funcionarios') THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      resource,
      resource_id,
      metadata
    ) VALUES (
      auth.uid(),
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'CREATE'
        WHEN TG_OP = 'UPDATE' THEN 'UPDATE'
        WHEN TG_OP = 'DELETE' THEN 'DELETE'
        ELSE 'UNKNOWN'
      END,
      TG_TABLE_NAME,
      COALESCE(NEW.id::text, OLD.id::text),
      jsonb_build_object(
        'operation', TG_OP,
        'timestamp', now(),
        'changed_fields', CASE 
          WHEN TG_OP = 'UPDATE' THEN (
            SELECT jsonb_object_agg(key, value)
            FROM jsonb_each(to_jsonb(NEW))
            WHERE to_jsonb(NEW) -> key != to_jsonb(OLD) -> key
          )
          ELSE NULL
        END
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for sensitive tables
CREATE TRIGGER audit_pacientes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.pacientes
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

CREATE TRIGGER audit_clientes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

CREATE TRIGGER audit_financeiro_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.financeiro
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

CREATE TRIGGER audit_boletos_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.boletos
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

CREATE TRIGGER audit_pagamentos_funcionarios_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.pagamentos_funcionarios
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

-- Enhanced RLS policies for better security
-- Update clientes table to require specific conditions for sensitive data access
DROP POLICY IF EXISTS "Gestores and cuidadores can view clientes" ON public.clientes;
CREATE POLICY "Enhanced clientes access" ON public.clientes
FOR SELECT 
USING (
  -- Admins can see everything
  is_current_user_admin() 
  OR 
  -- Gestores can see all clients
  (get_current_user_role() = 'gestor')
  OR
  -- Cuidadores can only see clients they are assigned to
  (
    get_current_user_role() = 'cuidador' 
    AND id IN (
      SELECT DISTINCT cliente_id 
      FROM cuidadores c 
      WHERE c.email = (
        SELECT email FROM profiles WHERE id = auth.uid()
      )
    )
  )
);

-- Enhanced pacientes policy
DROP POLICY IF EXISTS "Gestores and assigned cuidadores can view pacientes" ON public.pacientes;
CREATE POLICY "Enhanced pacientes access" ON public.pacientes
FOR SELECT 
USING (
  -- Admins can see everything
  is_current_user_admin()
  OR
  -- Gestores can see all patients
  (get_current_user_role() = 'gestor')
  OR
  -- Cuidadores can only see patients they are assigned to
  (
    get_current_user_role() = 'cuidador'
    AND cuidador_id IN (
      SELECT id FROM cuidadores 
      WHERE email = (
        SELECT email FROM profiles WHERE id = auth.uid()
      )
    )
  )
);

-- Add data retention policy (requires pg_cron extension)
-- This would need to be run as a scheduled job
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  -- Delete audit logs older than 2 years
  DELETE FROM public.audit_logs 
  WHERE created_at < now() - interval '2 years';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;