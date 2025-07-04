import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SupportEmailRequest {
  nome: string;
  email: string;
  assunto: string;
  mensagem: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { nome, email, assunto, mensagem }: SupportEmailRequest = await req.json();

    console.log('Recebida solicitação de suporte:', { nome, email, assunto });

    // Salvar no banco de dados para controle
    const { error: dbError } = await supabase
      .from('support_requests')
      .insert({
        nome,
        email,
        assunto,
        mensagem,
        status: 'pendente',
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Erro ao salvar no banco:', dbError);
      // Não falhar por causa do banco, continuar com o email
    }

    // Enviar notificação por email para o suporte
    // Nota: Aqui você integraria com um serviço de email como Resend, SendGrid, etc.
    // Por enquanto, vamos apenas retornar sucesso e logar
    
    console.log(`
      ====== NOVA SOLICITAÇÃO DE SUPORTE ======
      Nome: ${nome}
      Email: ${email}
      Assunto: ${assunto}
      Mensagem: ${mensagem}
      Data: ${new Date().toLocaleString('pt-BR')}
      ========================================
    `);

    // TODO: Integrar com serviço de email
    // const emailResponse = await sendEmail({
    //   to: 'suporte@seudominio.com',
    //   subject: `Nova solicitação de suporte: ${assunto}`,
    //   html: `
    //     <h2>Nova solicitação de suporte</h2>
    //     <p><strong>Nome:</strong> ${nome}</p>
    //     <p><strong>Email:</strong> ${email}</p>
    //     <p><strong>Assunto:</strong> ${assunto}</p>
    //     <p><strong>Mensagem:</strong></p>
    //     <p>${mensagem.replace(/\n/g, '<br>')}</p>
    //   `
    // });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Solicitação de suporte enviada com sucesso',
        id: crypto.randomUUID() // Simular ID da solicitação
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Erro na função de suporte:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);