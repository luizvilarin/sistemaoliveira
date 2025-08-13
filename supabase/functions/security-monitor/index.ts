import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SecurityMonitorRequest {
  userId: string;
  action: string;
  resource: string;
  metadata?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { userId, action, resource, metadata }: SecurityMonitorRequest = await req.json();

    // Log security events to audit table
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        resource,
        metadata: metadata || {},
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      });

    if (auditError) {
      console.error('Failed to insert audit log:', auditError);
    }

    // Check for suspicious patterns
    const suspiciousActions = [
      'multiple_failed_logins',
      'unusual_access_pattern',
      'privilege_escalation_attempt',
      'sensitive_data_mass_access'
    ];

    if (suspiciousActions.includes(action)) {
      // Create security alert
      const { error: alertError } = await supabase
        .from('notificacoes_sistema')
        .insert({
          usuario_id: userId,
          tipo: 'security_alert',
          titulo: 'Alerta de Segurança',
          mensagem: `Atividade suspeita detectada: ${action}`,
          metadados: {
            action,
            resource,
            timestamp: new Date().toISOString(),
            ...metadata
          }
        });

      if (alertError) {
        console.error('Failed to create security alert:', alertError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Security event logged' }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Security monitoring error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);