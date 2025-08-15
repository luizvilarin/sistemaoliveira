import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  to: string;
  subject: string;
  content: string;
  tipo: 'boleto' | 'lembrete' | 'pagamento' | 'geral';
  cliente_nome?: string;
  valor?: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { to, subject, content, tipo, cliente_nome, valor }: NotificationEmailRequest = await req.json();

    console.log(`Sending ${tipo} email to: ${to}`);

    // Create email content based on type
    let emailHTML = '';
    
    switch (tipo) {
      case 'boleto':
        emailHTML = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Boleto de Cobrança</h2>
            <p>Olá!</p>
            <p>Você possui um boleto de cobrança pendente:</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Cliente:</strong> ${cliente_nome || 'N/A'}</p>
              ${valor ? `<p><strong>Valor:</strong> R$ ${valor.toFixed(2)}</p>` : ''}
              <p><strong>Assunto:</strong> ${subject}</p>
            </div>
            <p>${content}</p>
            <p style="margin-top: 30px; color: #6b7280;">
              Atenciosamente,<br>
              Sistema de Gestão
            </p>
          </div>
        `;
        break;
        
      case 'lembrete':
        emailHTML = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Lembrete Importante</h2>
            <p>Olá!</p>
            <p>Este é um lembrete sobre:</p>
            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p><strong>${subject}</strong></p>
              <p>${content}</p>
            </div>
            <p style="margin-top: 30px; color: #6b7280;">
              Atenciosamente,<br>
              Sistema de Gestão
            </p>
          </div>
        `;
        break;
        
      case 'pagamento':
        emailHTML = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Notificação de Pagamento</h2>
            <p>Olá!</p>
            <p>Informação sobre pagamento:</p>
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <p><strong>${subject}</strong></p>
              ${valor ? `<p><strong>Valor:</strong> R$ ${valor.toFixed(2)}</p>` : ''}
              <p>${content}</p>
            </div>
            <p style="margin-top: 30px; color: #6b7280;">
              Atenciosamente,<br>
              Sistema de Gestão
            </p>
          </div>
        `;
        break;
        
      default:
        emailHTML = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #374151;">Notificação</h2>
            <p>Olá!</p>
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>${subject}</strong></p>
              <p>${content}</p>
            </div>
            <p style="margin-top: 30px; color: #6b7280;">
              Atenciosamente,<br>
              Sistema de Gestão
            </p>
          </div>
        `;
    }

    const emailResponse = await resend.emails.send({
      from: "Sistema de Gestão <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: emailHTML,
    });

    console.log("Email sent successfully:", emailResponse);

    // Log the email sent in database
    await supabaseClient.from('audit_logs').insert({
      action: 'EMAIL_SENT',
      resource: 'notification_email',
      metadata: {
        to,
        subject,
        tipo,
        email_id: emailResponse.data?.id
      }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email enviado com sucesso",
      email_id: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);